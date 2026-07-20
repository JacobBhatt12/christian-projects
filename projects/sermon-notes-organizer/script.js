const STORAGE_KEY = "sermonNotes";

const form = document.getElementById("note-form");
const dateInput = document.getElementById("note-date");
const speakerInput = document.getElementById("note-speaker");
const topicInput = document.getElementById("note-topic");
const textInput = document.getElementById("note-text");
const searchInput = document.getElementById("search-input");
const notesList = document.getElementById("notes-list");
const emptyMessage = document.getElementById("empty-message");
const noteCount = document.getElementById("note-count");

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Could not read saved sermon notes:", err);
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function highlight(text, keyword) {
  const safe = escapeHtml(text);
  if (!keyword) return safe;

  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(${escapedKeyword})`, "gi");
  return safe.replace(pattern, "<mark>$1</mark>");
}

function renderNotes() {
  const notes = loadNotes();
  const keyword = searchInput.value.trim().toLowerCase();

  const matches = keyword
    ? notes.filter(
        (note) =>
          note.speaker.toLowerCase().includes(keyword) ||
          note.topic.toLowerCase().includes(keyword) ||
          note.text.toLowerCase().includes(keyword)
      )
    : notes;

  const sorted = [...matches].sort((a, b) => b.date.localeCompare(a.date));

  notesList.innerHTML = "";

  if (notes.length === 0) {
    emptyMessage.hidden = false;
    emptyMessage.textContent = "No sermon notes yet. Add one above.";
  } else if (sorted.length === 0) {
    emptyMessage.hidden = false;
    emptyMessage.textContent = `No notes found for "${searchInput.value.trim()}".`;
  } else {
    emptyMessage.hidden = true;
  }

  for (const note of sorted) {
    const item = document.createElement("li");
    item.className = "note-card";
    item.innerHTML = `
      <div class="note-card-header">
        <span class="note-topic">${highlight(note.topic, keyword)}</span>
        <span class="note-meta">${formatDate(note.date)} - ${highlight(note.speaker, keyword)}</span>
      </div>
      <p class="note-text">${highlight(note.text, keyword)}</p>
      <button class="note-delete" data-id="${note.id}">Delete</button>
    `;
    notesList.appendChild(item);
  }

  noteCount.textContent = keyword
    ? `(${sorted.length} of ${notes.length})`
    : notes.length
    ? `(${notes.length})`
    : "";
}

function addNote(event) {
  event.preventDefault();

  const notes = loadNotes();
  const newId = notes.length ? Math.max(...notes.map((n) => n.id)) + 1 : 1;

  notes.push({
    id: newId,
    date: dateInput.value,
    speaker: speakerInput.value.trim(),
    topic: topicInput.value.trim(),
    text: textInput.value.trim(),
  });

  saveNotes(notes);
  form.reset();
  dateInput.value = new Date().toISOString().slice(0, 10);
  speakerInput.focus();
  renderNotes();
}

function deleteNote(id) {
  const notes = loadNotes().filter((note) => note.id !== id);
  saveNotes(notes);
  renderNotes();
}

form.addEventListener("submit", addNote);
searchInput.addEventListener("input", renderNotes);

notesList.addEventListener("click", (event) => {
  if (event.target.matches(".note-delete")) {
    const id = Number(event.target.dataset.id);
    deleteNote(id);
  }
});

dateInput.value = new Date().toISOString().slice(0, 10);
renderNotes();

