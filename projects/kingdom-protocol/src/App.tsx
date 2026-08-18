import { useEffect, useState } from "react";
import { BootSequence } from "./components/BootSequence";
import { Terminal } from "./components/Terminal";
import { CRTFrame } from "./components/CRTFrame";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { loadSettings, saveSettings, loadJournal, saveJournal, loadCommandHistory, saveCommandHistory } from "./lib/storage";
import type { JournalEntry, Settings, Theme } from "./types";

function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const [bootKey, setBootKey] = useState(0);
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [journal, setJournal] = useState<JournalEntry[]>(() => loadJournal());
  const [cmdHistory, setCmdHistory] = useState<string[]>(() => loadCommandHistory());
  const [flash, setFlash] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveJournal(journal);
  }, [journal]);

  useEffect(() => {
    saveCommandHistory(cmdHistory);
  }, [cmdHistory]);

  function setTheme(theme: Theme) {
    setSettings((prev) => {
      if (prev.theme !== "light" && theme === "light" && !reducedMotion) {
        setFlash(true);
        window.setTimeout(() => setFlash(false), 1400);
      }
      return { ...prev, theme };
    });
  }

  function setMuted(muted: boolean) {
    setSettings((prev) => ({ ...prev, muted }));
  }

  function addJournalEntry(text: string): JournalEntry {
    const entry: JournalEntry = { id: makeId(), timestamp: new Date().toLocaleString(), text };
    setJournal((prev) => [...prev, entry]);
    return entry;
  }

  function clearJournalEntries() {
    setJournal([]);
  }

  function addCommandToHistory(raw: string) {
    setCmdHistory((prev) => [...prev, raw]);
  }

  function handleReboot() {
    setBooted(false);
    setBootKey((k) => k + 1);
  }

  return (
    <div
      data-theme={settings.theme === "light" ? "light" : undefined}
      className="relative h-full w-full overflow-hidden"
      style={{ background: "var(--kp-bg)" }}
    >
      <CRTFrame reducedMotion={reducedMotion} />
      {flash && <div className="kp-flash" aria-hidden="true" />}

      {!booted ? (
        <BootSequence key={bootKey} onComplete={() => setBooted(true)} reducedMotion={reducedMotion} muted={settings.muted} />
      ) : (
        <Terminal
          theme={settings.theme}
          setTheme={setTheme}
          muted={settings.muted}
          setMuted={setMuted}
          journalEntries={journal}
          addJournalEntry={addJournalEntry}
          clearJournalEntries={clearJournalEntries}
          cmdHistory={cmdHistory}
          addCommandToHistory={addCommandToHistory}
          reducedMotion={reducedMotion}
          onReboot={handleReboot}
        />
      )}
    </div>
  );
}
