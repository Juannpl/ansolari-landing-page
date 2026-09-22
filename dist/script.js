const demo = {
  step: 1,
  seconds: 0,
  timer: null,
  reason: "",
  vehicle: "Peugeot 208",
  slot: "",
};

const transcript = document.querySelector("#transcript");
const controls = document.querySelector("#demoControls");
const stateTitle = document.querySelector("#stateTitle");
const stateSubtitle = document.querySelector("#stateSubtitle");
const callState = document.querySelector("#callState");
const timerDisplay = document.querySelector("#demoTimer");
const resetButton = document.querySelector("#resetDemo");
const resultCard = document.querySelector("#resultCard");

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function setStep(step) {
  demo.step = step;
  document.querySelectorAll(".demo-progress li").forEach((item) => {
    const itemStep = Number(item.dataset.step);
    item.classList.toggle("active", itemStep === step);
    item.classList.toggle("done", itemStep < step);
    const marker = item.querySelector(":scope > span");
    marker.textContent = itemStep < step ? "✓" : String(itemStep);
  });
}

function addMessage(role, text) {
  const message = document.createElement("div");
  message.className = `message${role === "client" ? " client" : ""}`;
  const name = role === "client" ? "Vous" : "Ansolari";
  message.innerHTML = `<small>${name}</small>${text}`;
  transcript.appendChild(message);
  transcript.scrollTop = transcript.scrollHeight;
}

function updateTimer() {
  demo.seconds += 1;
  const minutes = String(Math.floor(demo.seconds / 60)).padStart(2, "0");
  const seconds = String(demo.seconds % 60).padStart(2, "0");
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

function showChoices(title, choices, type = "intent") {
  controls.innerHTML = `<p class="choice-title">${title}</p><div class="choice-grid ${type === "slot" ? "slot-grid" : ""}">${choices
    .map(
      (choice) =>
        `<button type="button" data-value="${choice.value}" data-label="${choice.label}">${choice.label}${choice.detail ? `<small>${choice.detail}</small>` : ""}</button>`,
    )
    .join("")}</div>`;

  controls.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      if (type === "intent") chooseReason(button.dataset.value, button.dataset.label);
      if (type === "slot") chooseSlot(button.dataset.value, button.dataset.label);
    });
  });
}

async function startDemo() {
  resetButton.disabled = false;
  controls.innerHTML = "";
  document.querySelector("#ringIcon").style.animation = "none";
  stateTitle.textContent = "Ansolari a décroché";
  stateSubtitle.textContent = "La conversation commence.";
  demo.timer = window.setInterval(updateTimer, 1000);
  await wait(650);
  callState.style.display = "none";
  transcript.classList.add("visible");
  addMessage("agent", "Bonjour, vous êtes bien au Garage des Lilas. Je suis Ansolari, comment puis-je vous aider ?");
  await wait(700);
  setStep(2);
  showChoices("Quel est le motif de votre appel ?", [
    { value: "Révision annuelle", label: "Faire une révision" },
    { value: "Contrôle technique", label: "Contrôle technique" },
    { value: "Diagnostic panne", label: "Un voyant s’allume" },
  ]);
}

async function chooseReason(value, label) {
  demo.reason = value;
  controls.innerHTML = "";
  addMessage("client", label === "Un voyant s’allume" ? "Un voyant orange vient de s’allumer sur ma Peugeot 208." : `Je voudrais prendre rendez-vous pour ${value.toLowerCase()} sur ma Peugeot 208.`);
  document.querySelector("#summaryReason").textContent = value;
  document.querySelector("#summaryVehicle").textContent = demo.vehicle;
  await wait(700);
  addMessage("agent", "Très bien. J’ai identifié votre véhicule. Je vérifie maintenant les prochains créneaux disponibles dans l’agenda du garage.");
  await wait(850);
  setStep(3);
  showChoices("Choisissez un créneau proposé", [
    { value: "Demain · 09 h 00", label: "Demain · 09 h 00", detail: "30 min" },
    { value: "Demain · 10 h 30", label: "Demain · 10 h 30", detail: "30 min" },
    { value: "Vendredi · 14 h 00", label: "Vendredi · 14 h 00", detail: "30 min" },
    { value: "Vendredi · 16 h 30", label: "Vendredi · 16 h 30", detail: "30 min" },
  ], "slot");
}

async function chooseSlot(value, label) {
  demo.slot = value;
  controls.innerHTML = "";
  addMessage("client", `${label}, c’est parfait pour moi.`);
  document.querySelector("#summarySlot").textContent = value;
  await wait(700);
  setStep(4);
  addMessage("agent", `C’est confirmé pour ${label.toLowerCase()}. Vous allez recevoir la confirmation. Bonne journée et à bientôt au garage !`);
  await wait(950);
  setStep(5);
  window.clearInterval(demo.timer);
  resultCard.classList.add("complete");
  resultCard.querySelector(".result-status").textContent = "Envoyé à l’équipe";
  controls.innerHTML = `<a class="button button-primary button-full" href="#contact">Adapter cette démo à mon garage</a>`;
}

function resetDemo() {
  window.clearInterval(demo.timer);
  Object.assign(demo, { step: 1, seconds: 0, timer: null, reason: "", slot: "" });
  timerDisplay.textContent = "00:00";
  transcript.innerHTML = "";
  transcript.classList.remove("visible");
  callState.style.display = "flex";
  stateTitle.textContent = "Un client appelle…";
  stateSubtitle.textContent = "Voyez comment Ansolari prend le relais.";
  document.querySelector("#ringIcon").style.animation = "";
  controls.innerHTML = `<button class="button button-primary button-full" id="startDemo" type="button"><span class="phone-dot" aria-hidden="true"></span> Décrocher avec Ansolari</button>`;
  controls.querySelector("button").addEventListener("click", startDemo);
  ["summaryReason", "summaryVehicle", "summarySlot"].forEach((id) => (document.querySelector(`#${id}`).textContent = "—"));
  resultCard.classList.remove("complete");
  resultCard.querySelector(".result-status").textContent = "À venir";
  resetButton.disabled = true;
  setStep(1);
}

document.querySelector("#startDemo").addEventListener("click", startDemo);
resetButton.addEventListener("click", resetDemo);

document.querySelectorAll("[data-custom-select]").forEach((customSelect) => {
  const nativeSelect = customSelect.querySelector("select");
  const trigger = customSelect.querySelector(".select-trigger");
  const triggerLabel = trigger.querySelector("span");
  const optionsPanel = customSelect.querySelector(".select-options");
  const options = [...optionsPanel.querySelectorAll("[role='option']")];

  const close = () => {
    customSelect.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
  };

  const open = () => {
    customSelect.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
    (options.find((option) => option.getAttribute("aria-selected") === "true") || options[0]).focus();
  };

  const choose = (option) => {
    nativeSelect.value = option.dataset.value;
    nativeSelect.dispatchEvent(new Event("change", { bubbles: true }));
    triggerLabel.textContent = option.textContent;
    customSelect.classList.add("has-value");
    options.forEach((item) => item.setAttribute("aria-selected", String(item === option)));
    close();
    trigger.focus();
  };

  trigger.addEventListener("click", () => (customSelect.classList.contains("open") ? close() : open()));
  nativeSelect.addEventListener("invalid", (event) => {
    event.preventDefault();
    trigger.focus();
    open();
  });
  trigger.addEventListener("keydown", (event) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      open();
    }
  });
  options.forEach((option, index) => {
    option.setAttribute("aria-selected", "false");
    option.addEventListener("click", () => choose(option));
    option.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { close(); trigger.focus(); }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        options[(index + direction + options.length) % options.length].focus();
      }
      if (event.key === "Home") { event.preventDefault(); options[0].focus(); }
      if (event.key === "End") { event.preventDefault(); options.at(-1).focus(); }
    });
  });
  document.addEventListener("click", (event) => {
    if (!customSelect.contains(event.target)) close();
  });
});

document.querySelector("#demoForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const success = document.querySelector("#formSuccess");
  success.classList.add("visible");
  form.querySelector("button[type='submit']").textContent = "Demande préparée";
  success.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

const observer = new IntersectionObserver(
  (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")),
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
document.querySelector("#year").textContent = new Date().getFullYear();
