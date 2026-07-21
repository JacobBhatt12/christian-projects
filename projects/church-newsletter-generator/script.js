const LINE_WIDTH = 60;

const churchNameInput = document.getElementById("church-name");
const pastorsNoteInput = document.getElementById("pastors-note");
const eventsList = document.getElementById("events-list");
const prayerList = document.getElementById("prayer-list");

const previewTitle = document.getElementById("preview-title");
const previewDate = document.getElementById("preview-date");
const previewNote = document.getElementById("preview-note");
const previewEvents = document.getElementById("preview-events");
const previewPrayer = document.getElementById("preview-prayer");
const stampDate = document.getElementById("stamp-date");

const today = new Date();

function formatLongDate(date) {
  return date.toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });
}

function formatStampDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase();
}

function addRow(container, placeholder) {
  const row = document.createElement("div");
  row.className = "list-row";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = placeholder;
  input.addEventListener("input", renderPreview);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove";
  remove.setAttribute("aria-label", "Remove this line");
  remove.textContent = "×";
  remove.addEventListener("click", () => {
    row.remove();
    renderPreview();
  });

  row.appendChild(input);
  row.appendChild(remove);
  container.appendChild(row);
  return input;
}

function collectValues(container) {
  return Array.from(container.querySelectorAll("input"))
    .map((input) => input.value.trim())
    .filter((value) => value.length > 0);
}

document.querySelectorAll("[data-add]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.add === "events" ? eventsList : prayerList;
    const placeholder =
      button.dataset.add === "events"
        ? "July 28 - Youth group cookout"
        : "Healing for the Smith family";
    addRow(target, placeholder).focus();
  });
});

function renderPreview() {
  const churchName = churchNameInput.value.trim();
  const note = pastorsNoteInput.value.trim();
  const events = collectValues(eventsList);
  const prayers = collectValues(prayerList);

  previewTitle.textContent = churchName || "Church Newsletter";

  previewNote.textContent = note || "No note this week.";
  previewNote.classList.toggle("empty", !note);

  renderListSection(previewEvents, events, "No upcoming events.");
  renderListSection(previewPrayer, prayers, "No prayer requests this week.");
}

function renderListSection(listEl, items, emptyText) {
  listEl.innerHTML = "";
  if (items.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = emptyText;
    listEl.appendChild(li);
    return;
  }
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    listEl.appendChild(li);
  });
}

function centerText(text, width) {
  if (text.length >= width) return text;
  const totalPad = width - text.length;
  const left = Math.floor(totalPad / 2);
  const right = totalPad - left;
  return " ".repeat(left) + text + " ".repeat(right);
}

function buildNewsletterText() {
  const churchName = churchNameInput.value.trim();
  const note = pastorsNoteInput.value.trim();
  const events = collectValues(eventsList);
  const prayers = collectValues(prayerList);

  const title = churchName || "Church Newsletter";
  const dateLine = formatLongDate(today);
  const rule = "=".repeat(LINE_WIDTH);

  const lines = [];
  lines.push(rule);
  lines.push(centerText(title, LINE_WIDTH));
  lines.push(centerText(dateLine, LINE_WIDTH));
  lines.push(rule);

  lines.push("");
  lines.push("PASTOR'S NOTE");
  lines.push("-".repeat(LINE_WIDTH));
  lines.push(note || "No note this week.");

  lines.push("");
  lines.push("UPCOMING EVENTS");
  lines.push("-".repeat(LINE_WIDTH));
  if (events.length) {
    events.forEach((event) => lines.push(`- ${event}`));
  } else {
    lines.push("No upcoming events.");
  }

  lines.push("");
  lines.push("PRAYER LIST");
  lines.push("-".repeat(LINE_WIDTH));
  if (prayers.length) {
    prayers.forEach((prayer) => lines.push(`- ${prayer}`));
  } else {
    lines.push("No prayer requests this week.");
  }

  lines.push("");
  lines.push(rule);

  return lines.join("\n") + "\n";
}

function downloadNewsletter() {
  const text = buildNewsletterText();
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "newsletter.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const stampBtn = document.getElementById("stamp-btn");
stampBtn.addEventListener("click", () => {
  stampBtn.classList.add("thud");
  setTimeout(() => stampBtn.classList.remove("thud"), 140);
  downloadNewsletter();
});
 
document.getElementById("print-btn").addEventListener("click", () => window.print());

churchNameInput.addEventListener("input", renderPreview);
pastorsNoteInput.addEventListener("input", renderPreview);

stampDate.textContent = formatStampDate(today);
previewDate.textContent = formatLongDate(today);

addRow(eventsList, "July 28 - Youth group cookout");
addRow(prayerList, "Healing for the Smith family");
renderPreview();
