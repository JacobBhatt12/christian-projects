import type { JournalEntry, OutputNode, Theme } from "../types";
import { randomVerse } from "../data/verses";
import { randomMission } from "../data/missions";
import { randomTestimony } from "../data/testimonies";
import { ARMOR_OF_GOD } from "../data/armor";
import { ASCII_SHIELD } from "../data/asciiArt";
import { GUIDED_PRAYER, PRAYER_CLOSING } from "../data/prayers";

export const COMMAND_NAMES = [
  "help",
  "verse",
  "mission",
  "pray",
  "armor",
  "journal",
  "testimony",
  "clear",
  "reboot",
  "about",
  "easteregg",
] as const;

export interface CommandContext {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  addJournalEntry: (text: string) => JournalEntry;
  getJournalEntries: () => JournalEntry[];
  clearJournalEntries: () => void;
}

export interface CommandResult {
  output: OutputNode[];
  clearScreen?: boolean;
  reboot?: boolean;
}

function text(value: string, tone?: "normal" | "dim" | "gold" | "bright"): OutputNode {
  return { kind: "text", text: value, tone };
}

function blank(): OutputNode {
  return { kind: "blank" };
}

function helpOutput(): OutputNode[] {
  const rows: [string, string][] = [
    ["help", "display available commands"],
    ["verse", "reveal a random scripture verse"],
    ["mission", "generate a real-world mission of kindness"],
    ["pray", "open a guided prayer prompt"],
    ["armor", "display your Armor of God status"],
    ["journal", "write and save a private faith note (local only)"],
    ["testimony", "read an encouraging testimony from the field"],
    ["clear", "clear the terminal"],
    ["reboot", "replay the boot sequence"],
    ["about", "learn what Kingdom Protocol is"],
    ["easteregg", "?????"],
  ];
  const width = Math.max(...rows.map(([c]) => c.length));
  return [
    text("AVAILABLE COMMANDS", "gold"),
    blank(),
    ...rows.map(([cmd, desc]) => text(`  ${cmd.padEnd(width + 3)}${desc}`)),
    blank(),
    text("journal write <text>   seal a note into your local journal", "dim"),
    text("journal list           read back your sealed notes", "dim"),
    text("journal clear          erase your local journal", "dim"),
    blank(),
    text("Not every door in this network is listed here.", "dim"),
  ];
}

function armorOutput(): OutputNode[] {
  return [
    { kind: "ascii", art: ASCII_SHIELD, tone: "gold" },
    text("ARMOR OF GOD — STATUS: FULLY EQUIPPED", "gold"),
    blank(),
    ...ARMOR_OF_GOD.flatMap((piece) => [
      text(`  [✓] ${piece.name}`, "bright"),
      text(`      ${piece.description}  (${piece.reference})`, "dim"),
    ]),
    blank(),
    text('"Put on the whole armour of God, that ye may be able to stand against the wiles of the devil." — Ephesians 6:11', "dim"),
  ];
}

function verseOutput(): OutputNode[] {
  return [{ kind: "verse", verse: randomVerse() }];
}

function missionOutput(): OutputNode[] {
  const mission = randomMission();
  return [
    text("MISSION GENERATED", "gold"),
    blank(),
    text(`  ${mission.title}`, "bright"),
    text(`  ${mission.detail}`),
    blank(),
    text("This transmission is real. Living it out is your call.", "dim"),
  ];
}

function testimonyOutput(): OutputNode[] {
  const testimony = randomTestimony();
  return [
    text(testimony.callsign, "gold"),
    blank(),
    text(testimony.text),
  ];
}

function prayOutput(): OutputNode[] {
  const nodes: OutputNode[] = [
    text("OPENING A GUIDED LINE OF PRAYER...", "gold"),
    blank(),
  ];
  GUIDED_PRAYER.forEach((step, i) => {
    nodes.push(text(`${i + 1}. ${step.label}`, "bright"));
    nodes.push(text(`   ${step.prompt}`));
    nodes.push(blank());
  });
  nodes.push(text(PRAYER_CLOSING, "dim"));
  return nodes;
}

function aboutOutput(): OutputNode[] {
  return [
    text("ABOUT KINGDOM PROTOCOL", "gold"),
    blank(),
    text("This is a fictional terminal built for encouragement — a quiet corner of the"),
    text("internet dressed up like a secure network for digital missionaries."),
    blank(),
    text("Nothing here is a real system, and nothing here performs real hacking,"),
    text("scanning, or intrusion of any kind. There is no target but your own heart,"),
    text("and no exploit except grace."),
    blank(),
    text("Every verse is real scripture. Every mission is a real, harmless act of"),
    text("kindness you can actually go do. Every journal entry stays on your device —"),
    text("nothing is uploaded, tracked, or shared."),
    blank(),
    text('"Go ye therefore, and teach all nations." — Matthew 28:19', "dim"),
  ];
}

function unknownOutput(raw: string): OutputNode[] {
  return [
    text(`COMMAND NOT RECOGNIZED: "${raw}"`, "gold"),
    text("Type 'help' to see available commands.", "dim"),
  ];
}

function journalCommand(rest: string, ctx: CommandContext): OutputNode[] {
  const firstSpace = rest.indexOf(" ");
  const sub = (firstSpace === -1 ? rest : rest.slice(0, firstSpace)).toLowerCase();
  const subRest = firstSpace === -1 ? "" : rest.slice(firstSpace + 1).trim();

  if (!rest) {
    return [
      text("JOURNAL — a private, local record of your walk.", "gold"),
      blank(),
      text("  journal write <text>   seal a new entry"),
      text("  journal list           read your sealed entries"),
      text("  journal clear          erase your journal"),
      blank(),
      text("Entries never leave this device.", "dim"),
    ];
  }

  if (sub === "write") {
    if (!subRest) {
      return [text("Write something after 'journal write'. Example: journal write Grateful today.", "dim")];
    }
    ctx.addJournalEntry(subRest);
    return [text("ENTRY SEALED AND STORED LOCALLY.", "gold"), text(`"${subRest}"`, "dim")];
  }

  if (sub === "list") {
    const entries = ctx.getJournalEntries();
    if (entries.length === 0) {
      return [text("No entries yet. Try: journal write <text>", "dim")];
    }
    const nodes: OutputNode[] = [text(`JOURNAL — ${entries.length} SEALED ENTR${entries.length === 1 ? "Y" : "IES"}`, "gold"), blank()];
    [...entries].reverse().forEach((entry) => {
      nodes.push(text(`  [${entry.timestamp}]`, "dim"));
      nodes.push(text(`  ${entry.text}`, "bright"));
      nodes.push(blank());
    });
    return nodes;
  }

  if (sub === "clear") {
    ctx.clearJournalEntries();
    return [text("JOURNAL ERASED. A clean page.", "gold")];
  }

  return [text(`Unknown journal command: "${sub}". Try: journal write / list / clear`, "dim")];
}

function lightModeOutput(ctx: CommandContext): OutputNode[] {
  const goingLight = ctx.theme !== "light";
  ctx.setTheme(goingLight ? "light" : "dark");
  if (goingLight) {
    return [
      { kind: "glitch", text: "LET THERE BE LIGHT" },
      blank(),
      text('"And God said, Let there be light: and there was light." — Genesis 1:3', "gold"),
      blank(),
      text("THEME: RADIANT", "gold"),
    ];
  }
  return [
    text("RETURNING TO THE QUIET DARK, WHERE THE LIGHT STILL SHINES.", "gold"),
    blank(),
    text('"And the light shineth in darkness; and the darkness comprehended it not." — John 1:5', "dim"),
  ];
}

export function processCommand(rawInput: string, ctx: CommandContext): CommandResult {
  const trimmed = rawInput.trim();
  if (!trimmed) return { output: [] };

  const firstSpace = trimmed.indexOf(" ");
  const cmd = (firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace)).toLowerCase();
  const rest = firstSpace === -1 ? "" : trimmed.slice(firstSpace + 1).trim();

  switch (cmd) {
    case "help":
      return { output: helpOutput() };
    case "verse":
      return { output: verseOutput() };
    case "mission":
      return { output: missionOutput() };
    case "pray":
      return { output: prayOutput() };
    case "armor":
      return { output: armorOutput() };
    case "testimony":
      return { output: testimonyOutput() };
    case "about":
      return { output: aboutOutput() };
    case "journal":
      return { output: journalCommand(rest, ctx) };
    case "clear":
      return { output: [], clearScreen: true };
    case "reboot":
      return { output: [], reboot: true };
    case "easteregg":
      return {
        output: [text("UNLOCKING HIDDEN SEQUENCE...", "gold"), { kind: "component", id: "easteregg" }],
      };
    case "lettherebelight":
      return { output: lightModeOutput(ctx) };
    case "mute":
      ctx.setMuted(true);
      return { output: [text("AUDIO MUTED.", "dim")] };
    case "unmute":
      ctx.setMuted(false);
      return { output: [text("AUDIO ENABLED.", "dim")] };
    default:
      return { output: unknownOutput(trimmed) };
  }
}
