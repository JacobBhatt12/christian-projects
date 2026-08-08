"use strict";

const STORAGE_KEY = "faithful-planner-v1";

// Application state and cached page elements
const state = loadState();
let content = { translation: "", passages: [] };
let saveMessageTimer;

const elements = {
  views: [...document.querySelectorAll("[data-view]")],
  viewButtons: [...document.querySelectorAll("[data-view-button]")],
  dailyForm: document.querySelector("#daily-form"),
  todayDate: document.querySelector("#today-date"),
  passageLoading: document.querySelector("#passage-loading"),
  passageContent: document.querySelector("#passage-content"),
  passageText: document.querySelector("#passage-text"),
  passageReference: document.querySelector("#passage-reference"),
  passageTranslation: document.querySelector("#passage-translation"),
  passageError: document.querySelector("#passage-error"),
  saveStatus: document.querySelector("#save-status"),
  completeDay: document.querySelector("#complete-day"),
  prayerForm: document.querySelector("#prayer-form"),
  prayerText: document.querySelector("#prayer-text"),
  prayerList: document.querySelector("#prayer-list"),
  prayerCount: document.querySelector("#prayer-count"),
  historyRows: document.querySelector("#history-rows"),
  historyDetail: document.querySelector("#history-detail"),
  exportButton: document.querySelector("#export-reflections"),
  appStatus: document.querySelector("#app-status")
};

initialize();

// Startup and navigation
async function initialize() {
  elements.todayDate.textContent = formatLongDate(new Date());
  bindEvents();
  showView(getViewFromHash(), false);

  try {
    const response = await fetch("content.json");
    if (!response.ok) {
      throw new Error("Passage file could not be loaded.");
    }
    content = await response.json();
    renderPassage();
  } catch (error) {
    elements.passageLoading.hidden = true;
    elements.passageError.hidden = false;
    elements.passageError.textContent = "Today’s passage could not load. Open Faithful through a local web server, then refresh the page.";
  }

  populateDailyForm();
  renderPrayers();
  renderHistory();
}

function bindEvents() {
  elements.viewButtons.forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.viewButton));
  });

  window.addEventListener("hashchange", () => showView(getViewFromHash(), false));

  elements.dailyForm.addEventListener("input", saveDailyForm);
  elements.dailyForm.addEventListener("change", saveDailyForm);

  elements.completeDay.addEventListener("click", () => {
    const day = getTodayEntry();
    day.completed = !day.completed;
    saveState();
    updateCompletionButton();
    renderHistory();
    announce(day.completed ? "Today marked complete." : "Today marked open.");
  });

  elements.prayerForm.addEventListener("submit", addPrayer);
  elements.prayerList.addEventListener("change", updatePrayerStatus);
  elements.prayerList.addEventListener("click", removePrayer);
  elements.historyRows.addEventListener("click", openHistoryEntry);
  elements.exportButton.addEventListener("click", exportReflections);
}

function showView(viewName, updateHash = true) {
  const validView = ["today", "prayer", "history"].includes(viewName) ? viewName : "today";

  elements.views.forEach((view) => {
    view.hidden = view.dataset.view !== validView;
  });

  elements.viewButtons.forEach((button) => {
    if (button.dataset.viewButton === validView) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  if (updateHash && window.location.hash !== `#${validView}`) {
    history.pushState(null, "", `#${validView}`);
  }

  if (validView === "history") {
    renderHistory();
  }
}

function getViewFromHash() {
  return window.location.hash.replace("#", "") || "today";
}

function getTodayEntry() {
  const key = toDateKey(new Date());
  if (!state.days[key]) {
    state.days[key] = createEmptyDay();
  }
  return state.days[key];
}

function createEmptyDay() {
  return {
    passageId: "",
    teaching: "",
    area: "",
    commitment: "",
    noticedGod: "",
    fellShort: "",
    neededGrace: "",
    completed: false,
    updatedAt: ""
  };
}

// Daily Scripture and reflection
function renderPassage() {
  if (!Array.isArray(content.passages) || content.passages.length === 0) {
    elements.passageLoading.hidden = true;
    elements.passageError.hidden = false;
    elements.passageError.textContent = "No passages are available in content.json.";
    return;
  }

  const day = getTodayEntry();
  let passage = content.passages.find((item) => item.id === day.passageId);

  if (!passage) {
    passage = content.passages[dayNumber(new Date()) % content.passages.length];
    day.passageId = passage.id;
    saveState();
  }

  elements.passageText.textContent = `“${passage.text}”`;
  elements.passageReference.textContent = passage.reference;
  elements.passageTranslation.textContent = content.translation;
  elements.passageLoading.hidden = true;
  elements.passageContent.hidden = false;
}

function populateDailyForm() {
  const day = getTodayEntry();
  const fields = ["teaching", "commitment", "noticedGod", "fellShort", "neededGrace"];

  fields.forEach((name) => {
    const field = elements.dailyForm.elements.namedItem(name);
    field.value = day[name] || "";
  });

  const selectedArea = [...elements.dailyForm.elements.area].find((radio) => radio.value === day.area);
  if (selectedArea) {
    selectedArea.checked = true;
  }

  updateCompletionButton();
}

function saveDailyForm() {
  const day = getTodayEntry();
  const data = new FormData(elements.dailyForm);

  day.teaching = cleanText(data.get("teaching"));
  day.area = cleanText(data.get("area"));
  day.commitment = cleanText(data.get("commitment"));
  day.noticedGod = cleanText(data.get("noticedGod"));
  day.fellShort = cleanText(data.get("fellShort"));
  day.neededGrace = cleanText(data.get("neededGrace"));
  day.updatedAt = new Date().toISOString();

  saveState();
  showSavedMessage();
}

function showSavedMessage() {
  window.clearTimeout(saveMessageTimer);
  elements.saveStatus.textContent = "Saved on this device.";
  saveMessageTimer = window.setTimeout(() => {
    elements.saveStatus.textContent = "Changes save on this device.";
  }, 1800);
}

function updateCompletionButton() {
  const completed = getTodayEntry().completed;
  elements.completeDay.textContent = completed ? "Reopen today" : "Mark today complete";
  elements.completeDay.setAttribute("aria-pressed", String(completed));
}

// Prayer list
function addPrayer(event) {
  event.preventDefault();
  const text = elements.prayerText.value.trim();
  if (!text) return;

  state.prayers.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    answered: false,
    createdDate: toDateKey(new Date()),
    answeredDate: ""
  });

  saveState();
  elements.prayerForm.reset();
  renderPrayers();
  elements.prayerText.focus();
  announce("Prayer added.");
}

function renderPrayers() {
  const openCount = state.prayers.filter((prayer) => !prayer.answered).length;
  elements.prayerCount.textContent = `${openCount} open`;

  if (state.prayers.length === 0) {
    elements.prayerList.innerHTML = '<p class="empty-copy">Your prayer list is empty. Add a need when you are ready.</p>';
    return;
  }

  elements.prayerList.innerHTML = state.prayers.map((prayer) => {
    const status = prayer.answered
      ? `Answered ${escapeHtml(formatShortDate(fromDateKey(prayer.answeredDate)))}`
      : `Added ${escapeHtml(formatShortDate(fromDateKey(prayer.createdDate)))}`;

    return `
      <div class="prayer-item${prayer.answered ? " answered" : ""}">
        <input type="checkbox" data-prayer-toggle="${prayer.id}" ${prayer.answered ? "checked" : ""} aria-label="Mark prayer answered">
        <div>
          <p>${escapeHtml(prayer.text)}</p>
          <small>${status}</small>
        </div>
        <button class="text-button" type="button" data-prayer-remove="${prayer.id}" aria-label="Remove prayer">Remove</button>
      </div>`;
  }).join("");
}

function updatePrayerStatus(event) {
  const id = event.target.dataset.prayerToggle;
  if (!id) return;

  const prayer = state.prayers.find((item) => item.id === id);
  if (!prayer) return;

  prayer.answered = event.target.checked;
  prayer.answeredDate = prayer.answered ? toDateKey(new Date()) : "";
  saveState();
  renderPrayers();
  announce(prayer.answered ? "Prayer marked answered." : "Prayer marked open.");
}

function removePrayer(event) {
  const button = event.target.closest("[data-prayer-remove]");
  if (!button) return;

  state.prayers = state.prayers.filter((prayer) => prayer.id !== button.dataset.prayerRemove);
  saveState();
  renderPrayers();
  announce("Prayer removed.");
}

// Seven-day history and text export
function renderHistory() {
  const dates = lastSevenDates();

  elements.historyRows.innerHTML = dates.map((date) => {
    const key = toDateKey(date);
    const day = state.days[key];
    const passage = day ? content.passages.find((item) => item.id === day.passageId) : null;
    const hasEntry = day && dayHasContent(day);

    return `
      <tr>
        <td><strong>${escapeHtml(formatHistoryDate(date))}</strong></td>
        <td>${escapeHtml(passage ? passage.reference : "Not recorded")}</td>
        <td>${escapeHtml(day?.area || "Not chosen")}</td>
        <td>${day?.completed ? "Complete" : "Open"}</td>
        <td><button class="text-button" type="button" data-history-date="${key}" ${hasEntry ? "" : "disabled"}>View</button></td>
      </tr>`;
  }).join("");
}

function openHistoryEntry(event) {
  const button = event.target.closest("[data-history-date]");
  if (!button) return;

  const key = button.dataset.historyDate;
  const day = state.days[key];
  if (!day) return;

  const passage = content.passages.find((item) => item.id === day.passageId);
  const item = (label, value) => `
    <section>
      <h3>${escapeHtml(label)}</h3>
      <p>${escapeHtml(value || "No entry")}</p>
    </section>`;

  elements.historyDetail.innerHTML = `
    <h2>${escapeHtml(formatLongDate(fromDateKey(key)))}</h2>
    <p class="eyebrow">${escapeHtml(passage?.reference || "Passage not recorded")} · ${escapeHtml(day.area || "No daily area chosen")}</p>
    <div class="history-detail-grid">
      ${item("What it taught me", day.teaching)}
      ${item("Practical commitment", day.commitment)}
      ${item("Where I noticed God", day.noticedGod)}
      ${item("Where I fell short", day.fellShort)}
      ${item("Grace for tomorrow", day.neededGrace)}
    </div>`;

  elements.historyDetail.scrollIntoView({ behavior: "auto", block: "start" });
}

function exportReflections() {
  const entries = Object.entries(state.days)
    .filter(([, day]) => dayHasContent(day))
    .sort(([a], [b]) => b.localeCompare(a));

  if (entries.length === 0) {
    announce("There are no reflections to export yet.");
    return;
  }

  const text = entries.map(([dateKey, day]) => {
    const passage = content.passages.find((item) => item.id === day.passageId);
    return [
      "FAITHFUL",
      formatLongDate(fromDateKey(dateKey)),
      passage ? passage.reference : "Passage not recorded",
      "",
      "WHAT IT TAUGHT ME",
      day.teaching || "No entry",
      "",
      "TODAY'S PRACTICE",
      day.area || "No daily area chosen",
      day.commitment || "No commitment recorded",
      "",
      "EVENING REFLECTION",
      `Where did I notice God?\n${day.noticedGod || "No entry"}`,
      `\nWhere did I fall short?\n${day.fellShort || "No entry"}`,
      `\nWhat grace do I need tomorrow?\n${day.neededGrace || "No entry"}`,
      "",
      "============================================================",
      ""
    ].join("\n");
  }).join("\n");

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `faithful-reflections-${toDateKey(new Date())}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  announce("Reflections exported as a text file.");
}

function dayHasContent(day) {
  return Boolean(
    day.teaching || day.area || day.commitment || day.noticedGod ||
    day.fellShort || day.neededGrace || day.completed
  );
}

// Local storage
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      days: saved?.days && typeof saved.days === "object" ? saved.days : {},
      prayers: Array.isArray(saved?.prayers) ? saved.prayers : []
    };
  } catch (error) {
    return { days: {}, prayers: [] };
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    elements.saveStatus.textContent = "This browser could not save your changes.";
    announce("This browser could not save your changes.");
  }
}

function announce(message) {
  elements.appStatus.textContent = "";
  window.setTimeout(() => {
    elements.appStatus.textContent = message;
  }, 20);
}

// Dates, text, and formatting
function lastSevenDates() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - index);
    return date;
  });
}

function dayNumber(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function formatHistoryDate(date) {
  return new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(date);
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

