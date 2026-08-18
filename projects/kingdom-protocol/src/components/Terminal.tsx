import { useEffect, useRef, useState } from "react";
import type { HistoryEntry, JournalEntry, Theme } from "../types";
import { processCommand, type CommandContext } from "../lib/commands";
import { TerminalOutputLine } from "./TerminalOutputLine";
import { TerminalInput } from "./TerminalInput";
import { MuteToggle } from "./MuteToggle";

const PROMPT = "kingdom@narrow-path:~$";

function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface TerminalProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  journalEntries: JournalEntry[];
  addJournalEntry: (text: string) => JournalEntry;
  clearJournalEntries: () => void;
  cmdHistory: string[];
  addCommandToHistory: (raw: string) => void;
  reducedMotion: boolean;
  onReboot: () => void;
}

export function Terminal({
  theme,
  setTheme,
  muted,
  setMuted,
  journalEntries,
  addJournalEntry,
  clearJournalEntries,
  cmdHistory,
  addCommandToHistory,
  reducedMotion,
  onReboot,
}: TerminalProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([
    {
      id: makeId(),
      nodes: [{ kind: "text", text: "Type 'help' to see what's possible.", tone: "dim" }],
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" });
  }, [entries, reducedMotion]);

  function handleSubmit(raw: string) {
    if (raw.trim()) addCommandToHistory(raw);

    const ctx: CommandContext = {
      theme,
      setTheme,
      muted,
      setMuted,
      addJournalEntry,
      getJournalEntries: () => journalEntries,
      clearJournalEntries,
    };

    const result = processCommand(raw, ctx);

    if (result.clearScreen) {
      setEntries([]);
      return;
    }

    if (result.reboot) {
      onReboot();
      return;
    }

    setEntries((prev) => [...prev, { id: makeId(), prompt: raw, nodes: result.output }]);
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      <header
        className="flex shrink-0 items-center justify-between border-b px-4 py-2.5 sm:px-6"
        style={{ borderColor: "var(--kp-border)" }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: "var(--kp-fg)", boxShadow: "0 0 8px var(--kp-glow)" }}
            aria-hidden="true"
          />
          <span className="kp-glow text-xs tracking-[0.2em] sm:text-sm" style={{ color: "var(--kp-fg)" }}>
            KINGDOM PROTOCOL
          </span>
          <span className="hidden text-[10px] tracking-widest sm:inline" style={{ color: "var(--kp-fg-dim)" }}>
            // SECURE CHANNEL ACTIVE
          </span>
        </div>
        <MuteToggle muted={muted} onToggle={() => setMuted(!muted)} />
      </header>

      <div ref={scrollRef} className="kp-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-1.5 text-xs sm:text-sm">
          {entries.map((entry) => (
            <div key={entry.id} className="kp-fade-in flex flex-col gap-1.5">
              {entry.prompt !== undefined && (
                <div className="flex gap-2">
                  <span className="kp-glow-gold shrink-0">{PROMPT}</span>
                  <span className="kp-glow break-words" style={{ color: "var(--kp-fg)" }}>
                    {entry.prompt}
                  </span>
                </div>
              )}
              {entry.nodes.map((node, i) => (
                <TerminalOutputLine key={i} node={node} />
              ))}
            </div>
          ))}

          <TerminalInput prompt={PROMPT} history={cmdHistory} onSubmit={handleSubmit} muted={muted} />
        </div>
      </div>
    </div>
  );
}
