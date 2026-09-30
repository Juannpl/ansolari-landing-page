import { expect, test } from '@playwright/test';

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

test('form validates required fields and stays entirely local', async ({ page }) => {
  await page.goto('/#contact');
  await page.getByRole('button', { name: 'Préparer ma demande' }).click();
  await expect(page.getByText('Votre demande est prête.')).toHaveCount(0);
  await page.getByLabel('Nom du garage').fill('Garage Test');
  await page.getByLabel('Votre prénom').fill('Camille');
  await page.getByLabel('E-mail professionnel').fill('camille@example.com');
  await page.getByRole('combobox', { name: 'Principal besoin' }).click();
  await page.getByRole('option', { name: 'Répondre aux appels manqués' }).click();
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.getByRole('button', { name: 'Préparer ma demande' }).click();
  await expect(page.getByText('Votre demande est prête.')).toBeVisible();
  expect(requests).toEqual([]);
  await expect(page).toHaveURL('/#contact');
  await page.getByLabel('Votre prénom').fill('Alex');
  await expect(page.getByText('Votre demande est prête.')).toHaveCount(0);
});

test('static content remains readable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Préparer ma demande' })).toBeDisabled();
  await context.close();
});
