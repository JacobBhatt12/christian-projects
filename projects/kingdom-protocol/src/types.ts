export type Theme = "dark" | "light";

export interface Verse {
  reference: string;
  text: string;
}

export interface Mission {
  title: string;
  detail: string;
}

export interface Testimony {
  callsign: string;
  text: string;
}

export interface ArmorPiece {
  name: string;
  reference: string;
  description: string;
}

export interface JournalEntry {
  id: string;
  timestamp: string;
  text: string;
}

export interface Settings {
  muted: boolean;
  theme: Theme;
}

export type OutputNode =
  | { kind: "text"; text: string; tone?: "normal" | "dim" | "gold" | "bright" }
  | { kind: "verse"; verse: Verse }
  | { kind: "ascii"; art: string; tone?: "normal" | "gold" }
  | { kind: "glitch"; text: string }
  | { kind: "link"; text: string; url: string }
  | { kind: "blank" };

export interface HistoryEntry {
  id: string;
  prompt?: string;
  nodes: OutputNode[];
}
