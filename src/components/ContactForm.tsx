import { useEffect, useState, type SubmitEvent } from 'react';

const needs = [
  'Répondre aux appels manqués',
  'Automatiser la prise de rendez-vous',
  'Filtrer et résumer les demandes',
  'Voir comment l’IA s’adapte au garage',
];

export default function ContactForm() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [submitted, setSubmitted] = useState(false);
  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
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
      <label><span>Principal besoin</span>
        <select name="need" required defaultValue="">
          <option value="" disabled>Sélectionnez un besoin</option>
          {needs.map(need => <option key={need}>{need}</option>)}
        </select>
      </label>
      <button className="button button-dark button-full" type="submit" disabled={!ready}>{submitted ? 'Demande préparée' : 'Préparer ma demande'}<span aria-hidden="true">→</span></button>
      <noscript>Activez JavaScript pour tester ce formulaire privé.</noscript>
      <p className="form-note">Version privée : aucune donnée n’est transmise ni enregistrée.</p>
      <div role="status" aria-live="polite">
        {submitted && <div className="form-success visible"><span aria-hidden="true">✓</span><div><strong>Votre demande est prête.</strong><p>Le parcours de réservation réel sera relié avant la mise en ligne publique.</p></div></div>}
      </div>
    </form>
  );
}
