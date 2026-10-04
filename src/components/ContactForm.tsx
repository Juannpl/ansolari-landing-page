import * as Select from '@radix-ui/react-select';
import { useEffect, useRef, useState, type SubmitEvent } from 'react';

const emailJS = {
  serviceId: import.meta.env.PUBLIC_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID,
  otpTemplateId: import.meta.env.PUBLIC_EMAILJS_TEMPLATE_OTP_ID,
  publicKey: import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY,
};

const captchaSiteKey = import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY;
type CaptchaApi = {
  ready: (callback: () => void) => void;
  render: (element: HTMLElement, options: Record<string, unknown>) => number;
  reset: (id: number) => void;
};

const needs = [
  'Répondre aux appels manqués',
  'Automatiser la prise de rendez-vous',
  'Filtrer et résumer les demandes',
  'Voir comment l’IA s’adapte au garage',
];

export default function ContactForm() {
  const [need, setNeed] = useState('');
  const [needError, setNeedError] = useState(false);
  const needTrigger = useRef<HTMLButtonElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const inFlight = useRef(false);
  const [pending, setPending] = useState<{ garage: string; name: string; email: string; need: string } | null>(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const otp = useRef<{ code: string; expires: number } | null>(null);
  const resendAt = useRef(0);
  const attempts = useRef(0);
  const [formError, setFormError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const captchaContainer = useRef<HTMLDivElement>(null);
  const captchaWidget = useRef<number | null>(null);
  const captchaApi = useRef<CaptchaApi | null>(null);
  useEffect(() => {
    if (!captchaSiteKey || !pending || code.length !== 6 || captchaWidget.current !== null) return;
    let cancelled = false;
    const initialize = () => {
      const api = (window as Window & { grecaptcha?: CaptchaApi }).grecaptcha;
      api?.ready(() => {
        if (cancelled || !captchaContainer.current) return;
        captchaApi.current = api;
        captchaWidget.current = api.render(captchaContainer.current, {
          sitekey: captchaSiteKey,
          callback: (token: string) => { setCaptchaToken(token); setCaptchaError(''); },
          'expired-callback': () => setCaptchaToken(''),
          'error-callback': () => { setCaptchaToken(''); setCaptchaError('Le CAPTCHA est indisponible. Rechargez la page.'); },
        });
      });
    };
    let script = document.getElementById('contact-recaptcha-script') as HTMLScriptElement | null;
    const failed = () => setCaptchaError('Le CAPTCHA n’a pas pu être chargé. Rechargez la page ou contactez-nous par e-mail.');
    if (!script) {
      script = document.createElement('script');
      script.id = 'contact-recaptcha-script';
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit&hl=fr';
      script.async = true;
      script.defer = true;
      script.addEventListener('load', initialize);
      script.addEventListener('error', failed);
      document.head.appendChild(script);
    } else if ((window as Window & { grecaptcha?: CaptchaApi }).grecaptcha) initialize();
    else { script.addEventListener('load', initialize); script.addEventListener('error', failed); }
    return () => {
      cancelled = true;
      script?.removeEventListener('load', initialize);
      script?.removeEventListener('error', failed);
    };
  }, [pending, code]);
  function resetCaptcha() {
    setCaptchaToken('');
    if (captchaApi.current && captchaWidget.current !== null) captchaApi.current.reset(captchaWidget.current);
  }
  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(() => setCooldown(Math.max(0, Math.ceil((resendAt.current - Date.now()) / 1000))), 1000);
    return () => clearInterval(timer);
  }, [pending]);

  async function sendEmail(templateId: string, params: Record<string, string>, requireCaptcha = true) {
    if (requireCaptcha && (!captchaSiteKey || !captchaToken)) throw new Error('CAPTCHA requis');
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: emailJS.serviceId, template_id: templateId, user_id: emailJS.publicKey, template_params: { ...params, ...(requireCaptcha ? { 'g-recaptcha-response': captchaToken } : {}) } }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`EmailJS HTTP ${response.status}: ${await response.text()}`);
  }

  async function sendCode(params: NonNullable<typeof pending>) {
    if (inFlight.current) return;
    if (Date.now() < resendAt.current) { setCodeError('Veuillez patienter avant de demander un nouveau code.'); return; }
    inFlight.current = true;
    setSending(true);
    setCodeError('');
    setSendError(false);
    otp.current = null;
    attempts.current = 0;
    setCode('');
    resendAt.current = Date.now() + 60000;
    setCooldown(60);
    try {
      const generated = String(100000 + crypto.getRandomValues(new Uint32Array(1))[0] % 900000);
      await sendEmail(emailJS.otpTemplateId, {
        ...params, first_name: params.name, to_email: params.email, user_email: params.email,
        reply_to: params.email, otp_code: generated, code: generated, verification_code: generated,
        year: String(new Date().getFullYear()),
      }, false);
      otp.current = { code: generated, expires: Date.now() + 10 * 60 * 1000 };
    } catch (error) {
      console.error('[ContactForm] Échec de l’envoi du code', error);
      setCodeError('Impossible d’envoyer le code. Vérifiez votre adresse et réessayez.');
    } finally {
      resetCaptcha();
      inFlight.current = false;
      setSending(false);
    }
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || submitted) return;
    if (pending) {
      if (!otp.current || Date.now() >= otp.current.expires) {
        setCodeError('Le code a expiré ou n’a pas été envoyé. Demandez-en un nouveau.');
        return;
      }
      if (code !== otp.current.code) {
        attempts.current++;
        if (attempts.current >= 5) {
          otp.current = null;
          setCodeError('Trop de tentatives. Demandez un nouveau code.');
        } else setCodeError('Code incorrect. Vérifiez votre e-mail.');
        return;
      }
      if (!captchaToken) { setCaptchaError('Veuillez valider le CAPTCHA avant l’envoi.'); return; }
      inFlight.current = true;
      setSending(true);
      setCodeError('');
      setSendError(false);
      try {
        await sendEmail(emailJS.templateId, pending);
        otp.current = null;
        setPending(null);
        setCode('');
        setSubmitted(true);
      } catch (error) {
        console.error('[ContactForm] Échec de l’envoi', error);
        setSendError(true);
      } finally {
        resetCaptcha();
        inFlight.current = false;
        setSending(false);
      }
      return;
    }
    if (!need) {
      setNeedError(true);
      needTrigger.current?.focus();
      return;
    }
    const fields = new FormData(event.currentTarget);
    if (fields.get('bot-field')) { setSendError(true); return; }
    if (!emailJS.serviceId || !emailJS.templateId || !emailJS.otpTemplateId || !emailJS.publicKey) {
      console.error('[ContactForm] Configuration EmailJS manquante : vérifiez PUBLIC_EMAILJS_TEMPLATE_OTP_ID et les autres variables, puis redémarrez Astro.');
      setSendError(true);
      return;
    }
    const params = {
      garage: String(fields.get('garage') ?? '').trim(),
      name: String(fields.get('name') ?? '').trim(),
      email: String(fields.get('email') ?? '').trim(), need,
    };
    if (!params.garage || params.garage.length > 120 || !params.name || params.name.length > 80 ||
      params.email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(params.email) ||
      /[\u0000-\u001f\u007f<>]/.test(params.garage + params.name) || !needs.includes(params.need)) {
      setFormError('Vérifiez vos coordonnées : les champs ne doivent pas être vides ni contenir de balises.');
      return;
    }
    if (Date.now() < resendAt.current) { setFormError('Veuillez patienter une minute avant une nouvelle demande de code.'); return; }
    setFormError('');
    setPending(params);
    await sendCode(params);
  }
  return (
    <form className="contact-card reveal" name="demo-request" method="POST"
      aria-busy={sending} onSubmit={submit} onChange={() => { setSubmitted(false); setSendError(false); }}>
      <div hidden><label>Ne pas remplir ce champ<input name="bot-field" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="form-heading">
        <span className="form-number">15</span>
        <div><strong>Demander une démo</strong><span>minutes · sans engagement</span></div>
      </div>
      <div className="field-grid">
        <label><span>Nom du garage</span><input name="garage" placeholder="Garage Dupont" disabled={sending || Boolean(pending)} required maxLength={120} autoComplete="organization" /></label>
        <label><span>Votre prénom</span><input name="name" placeholder="Thomas" disabled={sending || Boolean(pending)} required maxLength={80} autoComplete="given-name" /></label>
      </div>
      <label><span>E-mail professionnel</span><input name="email" type="email" placeholder="thomas@garage.fr" disabled={sending || Boolean(pending)} required maxLength={254} autoComplete="email" /></label>
      <div className="need-field">
        <label htmlFor="contact-need" id="contact-need-label">Principal besoin</label>
        <Select.Root name="need" value={need} onValueChange={value => {
          setNeed(value); setNeedError(false); setSubmitted(false); setSendError(false);
        }}>
          <Select.Trigger id="contact-need" ref={needTrigger} className="need-trigger"
            disabled={!ready || sending || Boolean(pending)} aria-labelledby="contact-need-label" aria-required="true"
            aria-invalid={needError || undefined} aria-describedby={needError ? 'need-error' : undefined}>
            <Select.Value placeholder="Sélectionnez un besoin" />
            <Select.Icon className="need-chevron"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg></Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="need-menu" position="popper" sideOffset={8} collisionPadding={16}>
              <Select.ScrollUpButton className="need-scroll" aria-label="Défiler vers le haut">⌃</Select.ScrollUpButton>
              <Select.Viewport className="need-options">
                <Select.Group>
                  <Select.Label className="need-menu-label">COMMENT POUVONS-NOUS VOUS AIDER ?</Select.Label>
                  {needs.map((item, index) => <Select.Item className="need-option" value={item} key={item}>
                    <span className="need-option-number" aria-hidden="true">0{index + 1}</span>
                    <Select.ItemText>{item}</Select.ItemText>
                    <Select.ItemIndicator className="need-check"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-8" /></svg></Select.ItemIndicator>
                  </Select.Item>)}
                </Select.Group>
              </Select.Viewport>
              <Select.ScrollDownButton className="need-scroll" aria-label="Défiler vers le bas">⌄</Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
        {needError && <p className="need-error" id="need-error" role="alert">Sélectionnez un besoin pour continuer.</p>}
      </div>
      {pending && <section className="email-verification" aria-labelledby="verification-title">
        <h3 id="verification-title">Vérifiez votre e-mail</h3>
        <p role="status">{sending ? 'Envoi en cours…' : otp.current ? `Un code a été envoyé à ${pending.email}.` : 'Demandez un code pour vérifier votre adresse.'}</p>
        <label><span>Code de vérification</span><input autoFocus type="text" inputMode="numeric" autoComplete="one-time-code"
          value={code} maxLength={6} pattern="[0-9]{6}" required disabled={sending}
          aria-invalid={Boolean(codeError)} aria-describedby={codeError ? 'code-error' : 'code-help'}
          onChange={event => { setCode(event.target.value.replace(/\D/g, '')); setCodeError(''); }} /></label>
        <p id="code-help">Code valable 10 minutes. Pensez à vérifier vos spams.</p>
        {codeError && <p id="code-error" className="need-error" role="alert">{codeError}</p>}
        <div className="verification-actions">
          <button type="button" disabled={sending || cooldown > 0} onClick={() => sendCode(pending)}>{cooldown > 0 ? `Renvoyer dans ${cooldown} s` : 'Renvoyer le code'}</button>
          <button type="button" disabled={sending} onClick={() => { setPending(null); otp.current = null; setCode(''); setCodeError(''); setSendError(false); }}>Modifier mes coordonnées</button>
        </div>
      </section>}
      <div className="captcha-field">
        <div hidden={!pending || code.length !== 6}><div ref={captchaContainer} /></div>
        {!captchaSiteKey && <p className="need-error" role="alert">Le formulaire est temporairement indisponible. Contactez-nous à <a href="mailto:contact@ansolari.fr">contact@ansolari.fr</a>.</p>}
        {captchaError && <p className="need-error" role="alert">{captchaError}</p>}
      </div>
      {formError && <p className="need-error" role="alert">{formError}</p>}
      <button className="button button-dark button-full" type="submit" disabled={!ready || !captchaSiteKey || sending || submitted || Boolean(pending && code.length !== 6)}>{sending ? 'Envoi en cours…' : submitted ? 'Demande envoyée' : pending ? 'Confirmer et envoyer' : 'Envoyer ma demande'}<span aria-hidden="true">→</span></button>
      <noscript>Activez JavaScript pour envoyer votre demande, ou écrivez à contact@ansolari.fr.</noscript>
      <p className="form-note">Votre adresse sert à recevoir le code et notre réponse. Les e-mails sont envoyés via EmailJS ; Google reCAPTCHA protège l’envoi de la demande.</p>
      {sendError && <p className="need-error" role="alert">L’envoi a échoué. Réessayez ou contactez-nous à <a href="mailto:contact@ansolari.fr">contact@ansolari.fr</a>.</p>}
      <div role="status" aria-live="polite">
        {submitted && <div className="form-success visible"><span aria-hidden="true">✓</span><div><strong>Votre demande a bien été envoyée.</strong><p>Nous vous répondrons par e-mail pour convenir d’un créneau. Aucun rendez-vous n’est réservé automatiquement.</p></div></div>}
      </div>
    </form>
  );
}
