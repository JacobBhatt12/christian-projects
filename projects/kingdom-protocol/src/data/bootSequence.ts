export interface BootLine {
  text: string;
  tone?: "normal" | "dim" | "gold" | "bright";
  scramble?: boolean;
  pauseAfter?: number;
}

export const BOOT_SEQUENCE: BootLine[] = [
  { text: "INITIALIZING KINGDOM PROTOCOL...", tone: "dim" },
  { text: "ESTABLISHING SECURE CHANNEL...", tone: "dim" },
  { text: "VERIFYING IDENTITY...", tone: "normal" },
  { text: "IDENTITY CONFIRMED: CHILD OF GOD", tone: "bright", scramble: true, pauseAfter: 250 },
  { text: "LOADING SPIRITUAL DEFENSES...", tone: "dim" },
  { text: "ARMOR OF GOD: EQUIPPED", tone: "gold", scramble: true, pauseAfter: 250 },
  { text: "CONNECTING TO THE NARROW PATH...", tone: "normal" },
  { text: "ROUTE FOUND: MATTHEW 7:14", tone: "dim" },
  { text: "FILTERING WORLDLY NOISE... [██████████] 100%", tone: "dim", pauseAfter: 200 },
  { text: "SIGNAL LOCKED", tone: "normal" },
  { text: "ACCESS GRANTED", tone: "bright", scramble: true, pauseAfter: 500 },
];

export const BOOT_VERSE = {
  text: "And the light shineth in darkness; and the darkness comprehended it not.",
  reference: "John 1:5",
};

export const BOOT_WELCOME = "WELCOME, AGENT. THE HARVEST IS PLENTY, THE WORKERS ARE FEW.";
