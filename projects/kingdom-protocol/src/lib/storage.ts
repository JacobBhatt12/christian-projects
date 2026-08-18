import type { JournalEntry, Settings } from "../types";

const KEYS = {
  settings: "kp:settings",
  journal: "kp:journal",
  cmdHistory: "kp:cmdHistory",
} as const;

const DEFAULT_SETTINGS: Settings = {
  muted: false,
  theme: "dark",
};

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — fail silently
  }
}

export function loadSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...safeRead<Partial<Settings>>(KEYS.settings, {}) };
}

export function saveSettings(settings: Settings): void {
  safeWrite(KEYS.settings, settings);
}

export function loadJournal(): JournalEntry[] {
  return safeRead<JournalEntry[]>(KEYS.journal, []);
}

export function saveJournal(entries: JournalEntry[]): void {
  safeWrite(KEYS.journal, entries);
}

export function loadCommandHistory(): string[] {
  return safeRead<string[]>(KEYS.cmdHistory, []);
}

export function saveCommandHistory(history: string[]): void {
  safeWrite(KEYS.cmdHistory, history.slice(-50));
}
