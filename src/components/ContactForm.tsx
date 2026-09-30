import * as Select from '@radix-ui/react-select';
import { useEffect, useRef, useState, type SubmitEvent } from 'react';

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
  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!need) {
      setNeedError(true);
      needTrigger.current?.focus();
      return;
    }
    setSubmitted(true);
  }
  return (
    <form className="contact-card reveal" onSubmit={submit} onChange={() => setSubmitted(false)}>
      <div className="form-heading">
        <span className="form-number">15</span>
        <div><strong>Réserver une démo</strong><span>minutes · sans engagement</span></div>
      </div>
      <div className="field-grid">
        <label><span>Nom du garage</span><input name="garage" placeholder="Garage Dupont" required autoComplete="organization" /></label>
        <label><span>Votre prénom</span><input name="name" placeholder="Thomas" required autoComplete="given-name" /></label>
      </div>
      <label><span>E-mail professionnel</span><input name="email" type="email" placeholder="thomas@garage.fr" required autoComplete="email" /></label>
      <div className="need-field">
        <label htmlFor="contact-need" id="contact-need-label">Principal besoin</label>
        <Select.Root name="need" value={need} onValueChange={value => {
          setNeed(value); setNeedError(false); setSubmitted(false);
        }}>
          <Select.Trigger id="contact-need" ref={needTrigger} className="need-trigger"
            disabled={!ready} aria-labelledby="contact-need-label" aria-required="true"
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
      <button className="button button-dark button-full" type="submit" disabled={!ready}>{submitted ? 'Demande préparée' : 'Préparer ma demande'}<span aria-hidden="true">→</span></button>
      <noscript>Activez JavaScript pour tester ce formulaire privé.</noscript>
      <p className="form-note">Version privée : aucune donnée n’est transmise ni enregistrée.</p>
      <div role="status" aria-live="polite">
        {submitted && <div className="form-success visible"><span aria-hidden="true">✓</span><div><strong>Votre demande est prête.</strong><p>Le parcours de réservation réel sera relié avant la mise en ligne publique.</p></div></div>}
      </div>
    </form>
  );
}
