import { expect, test } from '@playwright/test';

// Simulate the provider; never send real emails or load Google's widget in tests.
test.beforeEach(async ({ page }) => {
  await page.route('https://www.google.com/recaptcha/api.js**', route => route.fulfill({
    contentType: 'application/javascript',
    body: `window.grecaptcha = {
      ready: callback => callback(),
      render: (element, options) => {
        const button = document.createElement('button');
        button.type = 'button'; button.textContent = 'Valider le CAPTCHA de test';
        button.onclick = () => options.callback('test-token');
        element.appendChild(button); return 0;
      },
      reset: () => {}
    };`,
  }));
});

test('landing, navigation and complete simulated call', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ne laissez plus un appel devenir un client perdu.');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await page.getByRole('link', { name: 'Simuler un appel' }).click();
  await expect(page).toHaveURL(/#demo$/);
  await page.getByRole('button', { name: 'Décrocher avec Ansolari' }).click();
  await page.getByRole('button', { name: 'Faire une révision', exact: true }).click();
  await page.getByRole('button', { name: 'Demain · 10 h 30' }).click();
  await expect(page.getByText('Simulation terminée')).toBeVisible();
  await expect(page.locator('.result-card')).toContainText('Révision annuelle');
  await expect(page.locator('.result-card')).toContainText('Peugeot 208');
  await expect(page.locator('.result-card')).toContainText('Demain · 10 h 30');
  await expect(page.locator('.demo-timer')).not.toHaveText('00:00');
  const finishedTime = await page.locator('.demo-timer').textContent();
  await page.waitForTimeout(1100);
  await expect(page.locator('.demo-timer')).toHaveText(finishedTime!);
  await page.getByRole('button', { name: 'Recommencer' }).click();
  await expect(page.locator('.demo-timer')).toHaveText('00:00');
  await expect(page.locator('.result-card')).not.toContainText('Peugeot 208');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

for (const resetAt of ['greeting', 'checking', 'confirming']) {
  test(`restart cancels pending ${resetAt} transition`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Décrocher avec Ansolari' }).click();
    if (resetAt !== 'greeting') await page.getByRole('button', { name: 'Un voyant s’allume' }).click();
    if (resetAt === 'confirming') await page.getByRole('button', { name: 'Vendredi · 16 h 30' }).click();
    await page.getByRole('button', { name: 'Recommencer' }).click();
    await page.waitForTimeout(1500);
    await expect(page.getByRole('button', { name: 'Décrocher avec Ansolari' })).toBeVisible();
    await expect(page.locator('.message')).toHaveCount(0);
    await expect(page.locator('.demo-timer')).toHaveText('00:00');
    await expect(page.getByRole('button', { name: 'Recommencer' })).toBeDisabled();
  });
}

async function fillContact(page: import('@playwright/test').Page) {
  await page.getByLabel('Nom du garage').fill('Garage Test');
  await page.getByLabel('Votre prénom').fill('Camille');
  await page.getByLabel('E-mail professionnel').fill('camille@example.com');
  await page.getByRole('combobox', { name: 'Principal besoin' }).click();
  await page.getByRole('option', { name: 'Répondre aux appels manqués' }).click();
}

test('form validates fields and sends the complete EmailJS payload', async ({ page }) => {
  const payloads: string[] = [];
  await page.route('https://api.emailjs.com/api/v1.0/email/send', async route => {
    payloads.push(route.request().postData()!);
    await route.fulfill({ status: 200, body: 'OK' });
  });
  await page.goto('/#contact');
  await page.getByRole('button', { name: 'Envoyer ma demande' }).click();
  expect(payloads).toEqual([]);
  await page.getByLabel('Nom du garage').fill('Garage Test');
  await page.getByLabel('Votre prénom').fill('Camille');
  await page.getByLabel('E-mail professionnel').fill('camille@example.com');
  await page.getByRole('button', { name: 'Envoyer ma demande' }).click();
  await expect(page.getByText('Sélectionnez un besoin pour continuer.')).toBeVisible();
  expect(payloads).toEqual([]);
  await page.getByRole('combobox', { name: 'Principal besoin' }).click();
  await page.getByRole('option', { name: 'Répondre aux appels manqués' }).click();
  await page.getByRole('button', { name: 'Envoyer ma demande' }).click();
  await expect(page.getByLabel('Code de vérification')).toBeVisible();
  await expect(page.getByText('Votre demande a bien été envoyée.')).toHaveCount(0);
  expect(payloads).toHaveLength(1);
  const otpPayload = JSON.parse(payloads[0]);
  expect(otpPayload.template_params.to_email).toBe('camille@example.com');
  expect(otpPayload.template_params['g-recaptcha-response']).toBeUndefined();
  expect(otpPayload.template_params.otp_code).toMatch(/^[0-9]{6}$/);
  await page.getByLabel('Code de vérification').fill(otpPayload.template_params.otp_code === '111111' ? '222222' : '111111');
  await page.getByRole('button', { name: 'Valider le CAPTCHA de test' }).click();
  await page.getByRole('button', { name: 'Confirmer et envoyer' }).click();
  await expect(page.getByRole('alert')).toContainText('Code incorrect');
  expect(payloads).toHaveLength(1);
  await page.getByLabel('Code de vérification').fill(otpPayload.template_params.otp_code);
  await page.getByRole('button', { name: 'Valider le CAPTCHA de test' }).click();
  await page.getByRole('button', { name: 'Confirmer et envoyer' }).click();
  await expect(page.getByText('Votre demande a bien été envoyée.')).toBeVisible();
  expect(payloads).toHaveLength(2);
  expect(JSON.parse(payloads[1])).toEqual({
    service_id: expect.any(String), template_id: expect.any(String), user_id: expect.any(String),
    template_params: { 'g-recaptcha-response': 'test-token', garage: 'Garage Test', name: 'Camille', email: 'camille@example.com', need: 'Répondre aux appels manqués' },
  });
  await expect(page.getByRole('button', { name: 'Demande envoyée' })).toBeDisabled();
  await expect(page).toHaveURL('/#contact');
  await page.getByLabel('Votre prénom').fill('Alex');
  await expect(page.getByText('Votre demande a bien été envoyée.')).toHaveCount(0);
});

test('failed submission preserves data and can be retried', async ({ page }) => {
  let attempts = 0;
  let otpCode = '';
  await page.route('https://api.emailjs.com/api/v1.0/email/send', async route => {
    attempts++;
    const payload = route.request().postDataJSON();
    if (payload.template_params.otp_code) otpCode = payload.template_params.otp_code;
    await route.fulfill({ status: attempts === 2 ? 500 : 200, body: 'response' });
  });
  await page.goto('/#contact');
  await fillContact(page);
  await page.getByRole('button', { name: 'Envoyer ma demande' }).click();
  await expect(page.getByLabel('Code de vérification')).toBeVisible();
  await page.getByLabel('Code de vérification').fill(otpCode);
  await page.getByRole('button', { name: 'Valider le CAPTCHA de test' }).click();
  await page.getByRole('button', { name: 'Confirmer et envoyer' }).click();
  await expect(page.getByRole('alert')).toContainText('L’envoi a échoué.');
  await expect(page.getByLabel('Votre prénom')).toHaveValue('Camille');
  await expect(page.getByText('Votre demande a bien été envoyée.')).toHaveCount(0);
  await page.getByRole('button', { name: 'Valider le CAPTCHA de test' }).click();
  await page.getByRole('button', { name: 'Confirmer et envoyer' }).click();
  await expect(page.getByText('Votre demande a bien été envoyée.')).toBeVisible();
  expect(attempts).toBe(3);
});

test('static content remains readable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Envoyer ma demande' })).toBeDisabled();
  await context.close();
});

test('CAPTCHA is required and OTP stops after five incorrect guesses', async ({ page }) => {
  let requests = 0;
  let correct = '';
  await page.route('https://api.emailjs.com/api/v1.0/email/send', async route => {
    requests++;
    correct = route.request().postDataJSON().template_params.otp_code;
    await route.fulfill({ status: 200, body: 'OK' });
  });
  await page.goto('/#contact');
  await fillContact(page);
  await page.getByRole('button', { name: 'Envoyer ma demande' }).click();
  await expect(page.getByLabel('Code de vérification')).toBeVisible();
  await page.getByLabel('Code de vérification').fill(correct);
  await page.getByRole('button', { name: 'Confirmer et envoyer' }).click();
  await expect(page.getByRole('alert')).toContainText('Veuillez valider le CAPTCHA');
  expect(requests).toBe(1);
  await page.getByLabel('Code de vérification').fill(correct === '111111' ? '222222' : '111111');
  await page.getByRole('button', { name: 'Valider le CAPTCHA de test' }).click();
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.getByRole('button', { name: 'Confirmer et envoyer' }).click();
  }
  await expect(page.getByText('Trop de tentatives. Demandez un nouveau code.')).toBeVisible();
  await page.getByLabel('Code de vérification').fill(correct);
  await page.getByRole('button', { name: 'Confirmer et envoyer' }).click();
  await expect(page.getByText('Le code a expiré ou n’a pas été envoyé. Demandez-en un nouveau.')).toBeVisible();
  expect(requests).toBe(1);
});

test('FAQ works with the keyboard and CAPTCHA loads only after six digits', async ({ page }) => {
  const googleRequests: string[] = [];
  page.on('request', request => {
    if (request.url().startsWith('https://www.google.com/recaptcha/')) googleRequests.push(request.url());
  });
  await page.route('https://api.emailjs.com/api/v1.0/email/send', route => route.fulfill({ status: 200, body: 'OK' }));
  await page.goto('/');
  const question = page.locator('summary').filter({ hasText: 'La simulation effectue-t-elle un véritable appel ?' });
  await question.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Non. Le parcours interactif utilise des réponses et des créneaux fictifs.')).toBeVisible();
  expect(googleRequests).toEqual([]);
  await fillContact(page);
  await page.getByRole('button', { name: 'Envoyer ma demande' }).click();
  await expect(page.getByLabel('Code de vérification')).toBeVisible();
  await page.getByLabel('Code de vérification').fill('12345');
  expect(googleRequests).toEqual([]);
  await page.getByLabel('Code de vérification').fill('123456');
  await expect(page.getByRole('button', { name: 'Valider le CAPTCHA de test' })).toBeVisible();
  expect(googleRequests).toHaveLength(1);
});

test('English landing, language switch, simulation and verified request', async ({ page }) => {
  let otpCode = '';
  const payloads: Record<string, any>[] = [];
  await page.route('https://api.emailjs.com/api/v1.0/email/send', async route => {
    const payload = route.request().postDataJSON();
    payloads.push(payload);
    if (payload.template_params.otp_code) otpCode = payload.template_params.otp_code;
    await route.fulfill({ status: 200, body: 'OK' });
  });
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Langue' }).getByRole('link', { name: 'EN' }).click();
  await expect(page).toHaveURL(/\/en\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Don’t let a missed call become a lost customer.');
  await expect(page).toHaveTitle('AI phone assistant for auto repair shops | Ansolari');
  await page.getByRole('link', { name: 'Try a simulated call' }).click();
  await page.getByRole('button', { name: 'Answer with Ansolari' }).click();
  await page.getByRole('button', { name: 'Book a service', exact: true }).click();
  await page.getByRole('button', { name: 'Tomorrow · 10:30 am' }).click();
  await expect(page.getByText('Simulation complete')).toBeVisible();
  await expect(page.locator('.result-card')).toContainText('Annual service');
  await expect(page.locator('.transcript')).toContainText('You’re booked for tomorrow');
  await page.getByRole('link', { name: 'Tailor this demo to my workshop' }).click();
  await page.getByLabel('Workshop name').fill('Test Workshop');
  await page.getByLabel('First name').fill('Sam');
  await page.getByLabel('Work email').fill('sam@example.com');
  await page.getByRole('combobox', { name: 'Main need' }).click();
  await page.getByRole('option', { name: 'Answer missed calls' }).click();
  await page.getByRole('button', { name: 'Send my request' }).click();
  await expect(page.getByText('A code has been sent to sam@example.com.')).toBeVisible();
  await page.getByLabel('Verification code').fill(otpCode);
  await page.getByRole('button', { name: 'Valider le CAPTCHA de test' }).click();
  await page.getByRole('button', { name: 'Confirm and send' }).click();
  await expect(page.getByText('Your request has been sent.')).toBeVisible();
  expect(payloads[1].template_params.need).toBe('Answer missed calls');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `/tmp/ansolari-en-${test.info().project.name}.png`, fullPage: true });
  await page.getByRole('navigation', { name: 'Language' }).getByRole('link', { name: 'FR' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});

test('FAQ animates both ways and handles rapid toggles and reduced motion', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('#questions details').first();
  const summary = card.locator('summary');
  await summary.click();
  await expect(card).toHaveAttribute('open', '');
  await page.waitForTimeout(350);
  const expandedHeight = await card.evaluate(element => element.getBoundingClientRect().height);
  await summary.press('Enter');
  await expect(card).not.toHaveAttribute('open', '');
  expect(await card.evaluate(element => element.getBoundingClientRect().height)).toBeLessThan(expandedHeight);
  await summary.evaluate(element => { (element as HTMLElement).click(); (element as HTMLElement).click(); (element as HTMLElement).click(); });
  await page.waitForTimeout(350);
  await expect(card).toHaveAttribute('open', '');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await summary.press('Enter');
  await expect(card).not.toHaveAttribute('open', '');
  expect(await card.evaluate(element => element.getAnimations().length)).toBe(0);
});
