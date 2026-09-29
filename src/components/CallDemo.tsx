import { useEffect, useRef, useState } from 'react';

type Phase = 'idle' | 'greeting' | 'reason' | 'checking' | 'slot' | 'confirming' | 'complete';
type Message = { role: 'agent' | 'client'; text: string };
const reasons = [
  { value: 'Révision annuelle', label: 'Faire une révision' },
  { value: 'Contrôle technique', label: 'Contrôle technique' },
  { value: 'Diagnostic panne', label: 'Un voyant s’allume' },
];
const slots = ['Demain · 09 h 00', 'Demain · 10 h 30', 'Vendredi · 14 h 00', 'Vendredi · 16 h 30'];
const steps = [
  ['Décrochage', 'Accueil immédiat et personnalisé'],
  ['Qualification', 'Motif et informations du véhicule'],
  ['Disponibilités', 'Créneaux compatibles avec l’agenda'],
  ['Confirmation', 'Rendez-vous ajouté et client informé'],
  ['Résumé', 'L’essentiel transmis à votre équipe'],
];
const stepByPhase: Record<Phase, number> = { idle: 1, greeting: 1, reason: 2, checking: 2, slot: 3, confirming: 4, complete: 5 };

export default function CallDemo() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [seconds, setSeconds] = useState(0);
  const [reason, setReason] = useState('');
  const [slot, setSlot] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const transcript = useRef<HTMLDivElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const running = phase !== 'idle' && phase !== 'complete';
  const step = stepByPhase[phase];

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSeconds(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  // Each transition owns its timeout: restarting or unmounting cancels it.
  useEffect(() => {
    if (phase !== 'greeting' && phase !== 'checking' && phase !== 'confirming') return;
    const timeout = window.setTimeout(() => {
      if (phase === 'greeting') {
        setMessages([{ role: 'agent', text: 'Bonjour, vous êtes bien au Garage des Lilas. Je suis Ansolari, comment puis-je vous aider ?' }]);
        setPhase('reason');
      } else if (phase === 'checking') {
        setMessages(previous => [...previous, { role: 'agent', text: 'Très bien. J’ai identifié votre véhicule. Voici les prochains créneaux disponibles dans l’agenda du garage.' }]);
        setPhase('slot');
      } else {
        setMessages(previous => [...previous, { role: 'agent', text: `C’est confirmé pour ${slot.toLowerCase()}. Vous allez recevoir la confirmation. Bonne journée et à bientôt au garage !` }]);
        setPhase('complete');
      }
    }, 1200);
    return () => window.clearTimeout(timeout);
  }, [phase, slot]);

  useEffect(() => {
    if (transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (phase === 'reason' || phase === 'slot' || phase === 'complete') controls.current?.focus({ preventScroll: true });
  }, [phase]);

  function reset() {
    setPhase('idle'); setSeconds(0); setReason(''); setSlot(''); setMessages([]);
  }
  function chooseReason(value: string, label: string) {
    if (phase !== 'reason') return;
    setReason(value);
    setMessages(previous => [...previous, { role: 'client', text: label === 'Un voyant s’allume' ? 'Un voyant orange vient de s’allumer sur ma Peugeot 208.' : `Je voudrais prendre rendez-vous pour ${value.toLowerCase()} sur ma Peugeot 208.` }]);
    setPhase('checking');
  }
  function chooseSlot(value: string) {
    if (phase !== 'slot') return;
    setSlot(value);
    setMessages(previous => [...previous, { role: 'client', text: `${value}, c’est parfait pour moi.` }]);
    setPhase('confirming');
  }

  return <>
    <p className="demo-disclaimer">Simulation illustrative : aucun appel réel, rendez-vous ou message n’est envoyé.</p>
    <div className="demo-shell reveal">
      <div className="demo-phone">
        <div className="phone-header"><div><span className="phone-kicker">APPEL ENTRANT</span><strong>Garage des Lilas</strong></div><span className="demo-timer">{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</span></div>
        {(phase === 'idle' || phase === 'greeting') && <div className="call-state" role="status">
          <div className="ring-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 3l3 4-2 2c2 4 3 5 7 7l2-2 4 3c-1 4-4 5-8 2S3 10 3 6z" /></svg></div>
          <strong>{phase === 'idle' ? 'Un client appelle…' : 'Ansolari a décroché'}</strong>
          <span>{phase === 'idle' ? 'Voyez comment Ansolari prend le relais.' : 'La conversation commence.'}</span>
        </div>}
        <div className={`transcript${messages.length ? ' visible' : ''}`} ref={transcript} role="log" aria-label="Conversation simulée" aria-live="polite" tabIndex={messages.length ? 0 : -1}>
          {messages.map((message, index) => <div key={index} className={`message${message.role === 'client' ? ' client' : ''}`}><small>{message.role === 'client' ? 'Vous' : 'Ansolari'}</small>{message.text}</div>)}
        </div>
        <div className="demo-controls" ref={controls} tabIndex={-1}>
          {phase === 'idle' && <button className="button button-primary button-full" type="button" onClick={() => setPhase('greeting')}><span className="phone-dot" aria-hidden="true" />Décrocher avec Ansolari</button>}
          {phase === 'reason' && <><p className="choice-title">Quel est le motif de votre appel ?</p><div className="choice-grid">{reasons.map(item => <button key={item.value} type="button" onClick={() => chooseReason(item.value, item.label)}>{item.label}</button>)}</div></>}
          {phase === 'slot' && <><p className="choice-title">Choisissez un créneau proposé</p><div className="choice-grid slot-grid">{slots.map(value => <button key={value} type="button" onClick={() => chooseSlot(value)}>{value}<small>30 min</small></button>)}</div></>}
          {(phase === 'checking' || phase === 'confirming') && <p className="choice-title" role="status">{phase === 'checking' ? 'Recherche des disponibilités…' : 'Confirmation du rendez-vous…'}</p>}
          {phase === 'complete' && <a className="button button-primary button-full" href="#contact">Adapter cette démo à mon garage</a>}
        </div>
      </div>
      <aside className="demo-progress" aria-label="Progression de la simulation">
        <div className="progress-top"><span>Parcours de l’appel</span><button type="button" disabled={phase === 'idle'} onClick={reset}>Recommencer</button></div>
        <ol>{steps.map(([title, description], index) => <li key={title} className={index + 1 === step ? 'active' : index + 1 < step ? 'done' : ''} aria-current={index + 1 === step ? 'step' : undefined}><span>{index + 1 < step ? '✓' : index + 1}</span><div><strong>{title}</strong><small>{description}</small></div></li>)}</ol>
        <div className={`result-card${phase === 'complete' ? ' complete' : ''}`}>
          <div className="result-head"><span>RÉSUMÉ DE L’APPEL</span><span className="result-status">{phase === 'complete' ? 'Simulation terminée' : 'À venir'}</span></div>
          <dl><div><dt>Motif</dt><dd>{reason || '—'}</dd></div><div><dt>Véhicule</dt><dd>{reason ? 'Peugeot 208' : '—'}</dd></div><div><dt>Rendez-vous</dt><dd>{slot || '—'}</dd></div></dl>
        </div>
      </aside>
    </div>
  </>;
}
