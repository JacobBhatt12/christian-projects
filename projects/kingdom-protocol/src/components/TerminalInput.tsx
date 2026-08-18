import { useEffect, useRef, useState } from "react";
import { COMMAND_NAMES } from "../lib/commands";
import { playKeyTick, playEnterBeep } from "../lib/sound";
import { Cursor } from "./Cursor";

interface TerminalInputProps {
  prompt: string;
  history: string[];
  onSubmit: (value: string) => void;
  muted: boolean;
  disabled?: boolean;
}

function findGhostSuggestion(value: string): string | null {
  if (!value || value.includes(" ")) return null;
  const lower = value.toLowerCase();
  const match = COMMAND_NAMES.find((name) => name.startsWith(lower) && name !== lower);
  if (!match) return null;
  return match.slice(value.length);
}

export function TerminalInput({ prompt, history, onSubmit, muted, disabled }: TerminalInputProps) {
  const [value, setValue] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  useEffect(() => {
    function refocus(e: MouseEvent) {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) return;
      if (e.target instanceof HTMLElement && e.target.closest("button")) return;
      inputRef.current?.focus();
    }
    window.addEventListener("click", refocus);
    return () => window.removeEventListener("click", refocus);
  }, []);

  function markTyping() {
    setTyping(true);
    if (typingTimeout.current) window.clearTimeout(typingTimeout.current);
    typingTimeout.current = window.setTimeout(() => setTyping(false), 450);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const trimmed = value;
      if (!muted) playEnterBeep();
      onSubmit(trimmed);
      setValue("");
      setHistoryIndex(null);
      setDraft("");
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      if (historyIndex === null) {
        setDraft(value);
        setHistoryIndex(history.length - 1);
        setValue(history[history.length - 1]);
      } else if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1);
        setValue(history[historyIndex - 1]);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === null) return;
      if (historyIndex < history.length - 1) {
        setHistoryIndex(historyIndex + 1);
        setValue(history[historyIndex + 1]);
      } else {
        setHistoryIndex(null);
        setValue(draft);
      }
      return;
    }

    if (e.key === "Tab") {
      const ghost = findGhostSuggestion(value);
      if (ghost) {
        e.preventDefault();
        setValue(value + ghost);
      } else {
        e.preventDefault();
      }
      return;
    }

    if (e.key.length === 1 || e.key === "Backspace") {
      markTyping();
      if (!muted && e.key.length === 1) playKeyTick();
    }
  }

  const ghost = findGhostSuggestion(value);

  return (
    <div className="flex items-start gap-2 text-sm sm:text-base">
      <span className="kp-glow shrink-0" style={{ color: "var(--kp-gold)" }}>
        {prompt}
      </span>
      <div className="relative flex-1">
        <span className="kp-glow invisible whitespace-pre" aria-hidden="true">
          {value || " "}
        </span>
        <span className="pointer-events-none absolute left-0 top-0 whitespace-pre" aria-hidden="true">
          <span className="kp-glow" style={{ color: "var(--kp-fg)" }}>
            {value}
          </span>
          {focused && <Cursor className={typing ? "kp-cursor--typing" : ""} />}
          {ghost && (
            <span className="kp-glow" style={{ color: "var(--kp-fg-dim)", opacity: 0.6 }}>
              {ghost}
            </span>
          )}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          aria-label="Kingdom Protocol terminal command input"
          className="absolute inset-0 h-full w-full resize-none border-none bg-transparent outline-none"
          style={{ color: "transparent", caretColor: "transparent" }}
        />
      </div>
    </div>
  );
}
