"use strict";

const STORAGE_KEY = "detour.stats.v1";
const PAUSE_SECONDS = 30;

const reflections = {
  anger: {
    label: "Anger",
    verse: "A soft answer turneth away wrath: but grievous words stir up anger.",
    reference: "Proverbs 15:1",
    prayer:
      "Lord, meet me in this heat. Slow my words, steady my body, and help me choose a response shaped by mercy and truth. Amen.",
  },
  lust: {
    label: "Lust",
    verse:
      "There hath no temptation taken you but such as is common to man: but God is faithful, who will not suffer you to be tempted above that ye are able; but will with the temptation also make a way to escape, that ye may be able to bear it.",
    reference: "1 Corinthians 10:13",
    prayer:
      "Faithful God, help me take the way of escape before me. Turn my attention toward what is true, loving, and worthy of the person before me. Amen.",
  },
  envy: {
    label: "Envy",
    verse: "A sound heart is the life of the flesh: but envy the rottenness of the bones.",
    reference: "Proverbs 14:30",
    prayer:
      "God of every good gift, quiet comparison in me. Help me receive my own life with gratitude and sincerely desire good for others. Amen.",
  },
  fear: {
    label: "Fear",
    verse:
      "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
    reference: "Isaiah 41:10",
    prayer:
      "God, I am afraid, and I do not have to hide it from you. Hold me steady and give me courage for the next small, faithful step. Amen.",
  },
  distraction: {
    label: "Distraction",
    verse: "Set your affection on things above, not on things on the earth.",
    reference: "Colossians 3:2",
    prayer:
      "Lord, gather my scattered attention. Help me release what is pulling at me and return to the good work and people you have placed before me. Amen.",
  },
  other: {
    label: "Other",
    verse: "Create in me a clean heart, O God; and renew a right spirit within me.",
    reference: "Psalm 51:10",
    prayer:
      "Merciful God, you know what I cannot yet name. Renew my heart, make the faithful way clearer, and help me take it without fear or shame. Amen.",
  },
};

const pivotActions = [
  { id: "leave", label: "Leave the room", detail: "Put distance between you and the trigger." },
  { id: "device", label: "Put the device away", detail: "Place it somewhere you cannot reach from here." },
  { id: "contact", label: "Contact someone you trust", detail: "Send a simple message: “Can you stay with me for a minute?”" },
  { id: "walk", label: "Walk outside", detail: "Change your surroundings and move your body." },
  { id: "task", label: "Start a useful task", detail: "Choose one small action that serves someone or something good." },
];

const quickActions = [pivotActions[0], pivotActions[1], pivotActions[2]];

const state = {
  screen: "home",
  struggle: "",
  pivot: "",
  timerRemaining: PAUSE_SECONDS,
  timerStartedAt: 0,
  timerId: null,
  completionCommitted: false,
  completedAction: "",
  wasQuickExit: false,
};

const root = document.querySelector("#screen-root");
const main = document.querySelector("#main-content");
const announcer = document.querySelector("#announcer");
const totalResetsElement = document.querySelector("#total-resets");
const dailyStreakElement = document.querySelector("#daily-streak");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadStats() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      total: Number.isFinite(stored?.total) ? Math.max(0, stored.total) : 0,
      streak: Number.isFinite(stored?.streak) ? Math.max(0, stored.streak) : 0,
      lastDate: typeof stored?.lastDate === "string" ? stored.lastDate : "",
    };
  } catch {
    return { total: 0, streak: 0, lastDate: "" };
  }
}

function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    announce("Your reset is complete. This browser could not save the updated count.");
  }
}

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function yesterdayKey() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateKey(yesterday);
}

function recordReset() {
  const stats = loadStats();
  const today = dateKey();

  stats.total += 1;
  if (stats.lastDate === today) {
    stats.streak = Math.max(1, stats.streak);
  } else if (stats.lastDate === yesterdayKey()) {
    stats.streak = Math.max(0, stats.streak) + 1;
  } else {
    stats.streak = 1;
  }
  stats.lastDate = today;
  saveStats(stats);
  updateStats();
  return stats;
}

function updateStats() {
  const stats = loadStats();
  totalResetsElement.textContent = String(stats.total);
  dailyStreakElement.textContent = String(stats.streak);
}

function announce(message) {
  announcer.textContent = "";
  window.setTimeout(() => {
    announcer.textContent = message;
  }, 20);
}

function clearTimer() {
  if (state.timerId !== null) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function resetFlow({ focus = true, announcement = "Returned to the Detour start." } = {}) {
  clearTimer();
  state.screen = "home";
  state.struggle = "";
  state.pivot = "";
  state.timerRemaining = PAUSE_SECONDS;
  state.timerStartedAt = 0;
  state.completionCommitted = false;
  state.completedAction = "";
  state.wasQuickExit = false;
  render({ focus });
  if (announcement) announce(announcement);
}

function startReset() {
  clearTimer();
  state.screen = "pause";
  state.struggle = "";
  state.pivot = "";
  state.timerRemaining = PAUSE_SECONDS;
  state.timerStartedAt = Date.now();
  state.completionCommitted = false;
  state.completedAction = "";
  state.wasQuickExit = false;
  render();
  startTimer();
  announce("Pause step started. Thirty second breathing timer.");
}

function openQuickExit() {
  clearTimer();
  state.screen = "quick";
  state.completionCommitted = false;
  state.completedAction = "";
  state.wasQuickExit = true;
  render();
  announce("Quick Exit opened. Choose one immediate action.");
}

function startTimer() {
  clearTimer();
  updateTimerDisplay();
  state.timerId = window.setInterval(() => {
    const elapsedSeconds = Math.floor((Date.now() - state.timerStartedAt) / 1000);
    const nextRemaining = Math.max(0, PAUSE_SECONDS - elapsedSeconds);
    if (nextRemaining !== state.timerRemaining) {
      state.timerRemaining = nextRemaining;
      updateTimerDisplay();
    }
    if (nextRemaining === 0) {
      clearTimer();
      announce("Thirty seconds complete. Continue to pray when you are ready.");
    }
  }, 200);
}

function timerContent(remaining) {
  if (remaining === 0) {
    return { phase: "You paused", instruction: "The urge did not make the decision. You still can." };
  }

  const elapsed = PAUSE_SECONDS - remaining;
  const cycle = elapsed % 10;
  let phase = "Breathe in";
  if (cycle >= 4 && cycle < 5) phase = "Hold gently";
  if (cycle >= 5) phase = "Breathe out";

  if (remaining >= 24) {
    return { phase, instruction: "Set both feet down. Let your shoulders drop." };
  }
  if (remaining >= 16) {
    return { phase, instruction: "You do not have to act on this feeling. Stay with this breath." };
  }
  if (remaining >= 8) {
    return { phase, instruction: "Make room for one faithful choice. Nothing more is required yet." };
  }
  return { phase, instruction: "Stay here. The next clear step is enough." };
}

function updateTimerDisplay() {
  if (state.screen !== "pause") return;
  const number = document.querySelector("#timer-number");
  const phase = document.querySelector("#breath-phase");
  const instruction = document.querySelector("#breath-instruction");
  const progress = document.querySelector("#timer-progress");
  const fill = document.querySelector("#timer-progress-fill");
  const continueButton = document.querySelector("#pause-continue");
  if (!number || !phase || !instruction || !progress || !fill || !continueButton) return;

  const content = timerContent(state.timerRemaining);
  const elapsed = PAUSE_SECONDS - state.timerRemaining;
  number.textContent = String(state.timerRemaining).padStart(2, "0");
  if (phase.textContent !== content.phase) phase.textContent = content.phase;
  if (instruction.textContent !== content.instruction) instruction.textContent = content.instruction;
  progress.setAttribute("aria-valuenow", String(elapsed));
  progress.setAttribute("aria-valuetext", `${elapsed} of ${PAUSE_SECONDS} seconds complete`);
  fill.style.transform = `scaleX(${elapsed / PAUSE_SECONDS})`;
  continueButton.innerHTML = `${state.timerRemaining === 0 ? "Continue to pray" : "Continue early"}<span class="button-arrow" aria-hidden="true">→</span>`;
}

function goToPray() {
  clearTimer();
  state.screen = "pray";
  render();
  announce("Pray step. Choose the struggle you are facing.");
}

function goToPivot() {
  if (!state.struggle) return;
  state.screen = "pivot";
  render();
  announce("Pivot step. Choose a practical escape action.");
}

function finishReset(action, wasQuickExit = false) {
  if (state.completionCommitted) return;
  const selectedAction = pivotActions.find((item) => item.id === action);
  if (!selectedAction) return;

  state.completionCommitted = true;
  state.pivot = action;
  state.completedAction = selectedAction.label;
  state.wasQuickExit = wasQuickExit;
  recordReset();
  state.screen = "complete";
  render();
  announce("Reset complete. You chose a faithful next step.");
}

function updateProgress() {
  const order = ["pause", "pray", "pivot"];
  let activeIndex = -1;

  if (state.screen === "pause") activeIndex = 0;
  if (state.screen === "pray") activeIndex = 1;
  if (state.screen === "pivot") activeIndex = 2;
  if (state.screen === "complete" && !state.wasQuickExit) activeIndex = 3;

  document.querySelectorAll(".step").forEach((element, index) => {
    const isCurrent = index === activeIndex;
    const isComplete = activeIndex > index;
    element.classList.toggle("is-current", isCurrent);
    element.classList.toggle("is-complete", isComplete);
    if (isCurrent) {
      element.setAttribute("aria-current", "step");
    } else {
      element.removeAttribute("aria-current");
    }
  });
}

function renderHome() {
  return `
    <section class="screen screen--home" aria-labelledby="screen-title">
      <div class="screen-header">
        <div>
          <p class="eyebrow">A private guided reset</p>
          <h1 id="screen-title" tabindex="-1">Take the next faithful step.</h1>
          <p class="screen-intro">Temptation narrows the moment. Detour gives you room to pause, pray, and choose a practical way forward.</p>
        </div>
        <span class="screen-number" aria-hidden="true">03</span>
      </div>
      <div class="home-grid">
        <p class="home-prompt">You are not proving anything here. You are making enough space to choose what is good.</p>
        <div class="button-stack">
          <button class="button button--primary" type="button" data-action="start">
            Start 30-second reset <span class="button-arrow" aria-hidden="true">→</span>
          </button>
          <button class="button" type="button" data-action="quick-exit">
            I need to move now <span class="button-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  `;
}

function renderPause() {
  const content = timerContent(state.timerRemaining);
  const elapsed = PAUSE_SECONDS - state.timerRemaining;
  return `
    <section class="screen" aria-labelledby="screen-title">
      <div class="screen-header">
        <div>
          <p class="eyebrow">01 / Pause</p>
          <h1 id="screen-title" tabindex="-1">Make room for a choice.</h1>
        </div>
        <span class="screen-number" aria-hidden="true">01</span>
      </div>
      <div class="screen-body">
        <div class="timer-grid">
          <div class="timer-readout" aria-label="Seconds remaining">
            <span class="timer-number" id="timer-number">${String(state.timerRemaining).padStart(2, "0")}</span>
            <span class="timer-unit">sec</span>
          </div>
          <div>
            <p class="breath-phase" id="breath-phase">${escapeHtml(content.phase)}</p>
            <p class="breath-instruction" id="breath-instruction" aria-live="polite">${escapeHtml(content.instruction)}</p>
          </div>
        </div>
        <div
          class="timer-progress"
          id="timer-progress"
          role="progressbar"
          aria-label="Breathing timer"
          aria-valuemin="0"
          aria-valuemax="${PAUSE_SECONDS}"
          aria-valuenow="${elapsed}"
          aria-valuetext="${elapsed} of ${PAUSE_SECONDS} seconds complete"
        >
          <div class="timer-progress__fill" id="timer-progress-fill" style="transform: scaleX(${elapsed / PAUSE_SECONDS})"></div>
        </div>
        <div class="timer-actions">
          <button class="button button--primary" id="pause-continue" type="button" data-action="to-pray">
            ${state.timerRemaining === 0 ? "Continue to pray" : "Continue early"}<span class="button-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  `;
}

function renderReflection() {
  if (!state.struggle || !reflections[state.struggle]) return "";
  const reflection = reflections[state.struggle];
  return `
    <div class="reflection-panel" id="reflection-panel">
      <article class="scripture" aria-labelledby="scripture-label">
        <p class="section-label" id="scripture-label">Scripture / KJV</p>
        <blockquote>
          <p>“${escapeHtml(reflection.verse)}”</p>
          <cite>${escapeHtml(reflection.reference)} · KJV</cite>
        </blockquote>
      </article>
      <section class="prayer" aria-labelledby="prayer-label">
        <p class="section-label" id="prayer-label">A short prayer</p>
        <p>${escapeHtml(reflection.prayer)}</p>
      </section>
    </div>
  `;
}

function renderPray() {
  const choices = Object.entries(reflections)
    .map(
      ([id, item]) => `
        <label class="choice">
          <input type="radio" name="struggle" value="${id}" ${state.struggle === id ? "checked" : ""}>
          <span>${escapeHtml(item.label)}</span>
        </label>
      `,
    )
    .join("");

  return `
    <section class="screen" aria-labelledby="screen-title">
      <div class="screen-header">
        <div>
          <p class="eyebrow">02 / Pray</p>
          <h1 id="screen-title" tabindex="-1">Name what you are facing.</h1>
          <p class="screen-intro">Choose the closest word. You do not need to explain or defend it.</p>
        </div>
        <span class="screen-number" aria-hidden="true">02</span>
      </div>
      <div class="screen-body">
        <fieldset class="choice-fieldset">
          <legend class="field-label">Choose one struggle</legend>
          <div class="choice-grid">${choices}</div>
        </fieldset>
        <div id="reflection-root">${renderReflection()}</div>
        <div class="form-actions">
          <button class="button button--primary" id="pray-continue" type="button" data-action="to-pivot" ${state.struggle ? "" : "disabled"}>
            Continue to pivot <span class="button-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  `;
}

function renderPivot() {
  const choices = pivotActions
    .map(
      (item) => `
        <label class="choice">
          <input type="radio" name="pivot" value="${item.id}" ${state.pivot === item.id ? "checked" : ""}>
          <span>${escapeHtml(item.label)}</span>
        </label>
      `,
    )
    .join("");
  const selected = pivotActions.find((item) => item.id === state.pivot);

  return `
    <section class="screen" aria-labelledby="screen-title">
      <div class="screen-header">
        <div>
          <p class="eyebrow">03 / Pivot</p>
          <h1 id="screen-title" tabindex="-1">Put faith into motion.</h1>
          <p class="screen-intro">Choose one action you can begin now. Small and concrete is enough.</p>
        </div>
        <span class="screen-number" aria-hidden="true">03</span>
      </div>
      <div class="screen-body">
        <fieldset class="choice-fieldset">
          <legend class="field-label">Choose one escape action</legend>
          <div class="choice-grid">${choices}</div>
        </fieldset>
        <div id="selection-root">
          ${
            selected
              ? `<p class="selection-note"><strong>${escapeHtml(selected.label)}.</strong> ${escapeHtml(selected.detail)}</p>`
              : ""
          }
        </div>
        <div class="form-actions">
          <button class="button button--primary" id="complete-reset" type="button" data-action="complete" ${state.pivot ? "" : "disabled"}>
            Complete reset <span class="button-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  `;
}

function renderQuickExit() {
  const actions = quickActions
    .map(
      (item, index) => `
        <button class="quick-action" type="button" data-quick-action="${item.id}">
          <span class="quick-action__number">0${index + 1}</span>
          <span class="quick-action__label">${escapeHtml(item.label)}</span>
          <span class="quick-action__arrow" aria-hidden="true">→</span>
        </button>
      `,
    )
    .join("");

  return `
    <section class="screen" aria-labelledby="screen-title">
      <div class="screen-header">
        <div>
          <p class="eyebrow">Quick Exit</p>
          <h1 id="screen-title" tabindex="-1">Move toward safety now.</h1>
          <p class="screen-intro">Choose the first workable action. You can pray and reflect once there is distance.</p>
        </div>
        <span class="screen-number" aria-hidden="true">!</span>
      </div>
      <div class="quick-actions" aria-label="Immediate escape actions">${actions}</div>
    </section>
  `;
}

function renderComplete() {
  const stats = loadStats();
  return `
    <section class="screen" aria-labelledby="screen-title">
      <div class="screen-header">
        <div>
          <p class="eyebrow">Reset complete</p>
          <h1 id="screen-title" tabindex="-1">You made space for faithfulness.</h1>
        </div>
        <div class="completion-mark" aria-hidden="true">✓</div>
      </div>
      <div class="completion-grid">
        <div>
          <p class="completion-copy">The feeling may not disappear at once. Your faithful choice still matters. Begin the action you chose, and let the next minute be enough.</p>
          <div class="next-action">
            <span class="field-label">Your next action</span>
            <strong>${escapeHtml(state.completedAction)}</strong>
          </div>
        </div>
        <div>
          <dl class="completion-stats" aria-label="Updated reset progress">
            <div>
              <dt>Total resets</dt>
              <dd>${stats.total}</dd>
            </div>
            <div>
              <dt>Daily streak</dt>
              <dd>${stats.streak}</dd>
            </div>
          </dl>
          <button class="button button--primary" type="button" data-action="home">
            Return to start <span class="button-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  `;
}

function render({ focus = true } = {}) {
  const renderers = {
    home: renderHome,
    pause: renderPause,
    pray: renderPray,
    pivot: renderPivot,
    quick: renderQuickExit,
    complete: renderComplete,
  };

  root.innerHTML = renderers[state.screen]();
  updateProgress();
  updateStats();

  if (focus) {
    window.requestAnimationFrame(() => {
      const title = document.querySelector("#screen-title");
      title?.focus({ preventScroll: true });
      main.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  }
}

document.addEventListener("click", (event) => {
  const actionElement = event.target.closest("[data-action]");
  if (actionElement) {
    const action = actionElement.dataset.action;
    if (action === "home") resetFlow();
    if (action === "reset") resetFlow();
    if (action === "start") startReset();
    if (action === "quick-exit") openQuickExit();
    if (action === "to-pray") goToPray();
    if (action === "to-pivot") goToPivot();
    if (action === "complete" && state.pivot) finishReset(state.pivot);
    return;
  }

  const quickAction = event.target.closest("[data-quick-action]");
  if (quickAction) {
    finishReset(quickAction.dataset.quickAction, true);
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches('input[name="struggle"]')) {
    state.struggle = event.target.value;
    document.querySelector("#reflection-root").innerHTML = renderReflection();
    const continueButton = document.querySelector("#pray-continue");
    continueButton.disabled = false;
    announce(`${reflections[state.struggle].label} selected. Scripture and prayer are now shown.`);
  }

  if (event.target.matches('input[name="pivot"]')) {
    state.pivot = event.target.value;
    const selected = pivotActions.find((item) => item.id === state.pivot);
    document.querySelector("#selection-root").innerHTML = `
      <p class="selection-note"><strong>${escapeHtml(selected.label)}.</strong> ${escapeHtml(selected.detail)}</p>
    `;
    const completeButton = document.querySelector("#complete-reset");
    completeButton.disabled = false;
    announce(`${selected.label} selected.`);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.screen !== "home") {
    event.preventDefault();
    resetFlow();
  }
});

window.addEventListener("pagehide", clearTimer);

updateStats();
render({ focus: false });
