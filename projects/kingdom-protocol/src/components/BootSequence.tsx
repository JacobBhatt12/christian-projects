import { useEffect, useRef, useState } from "react";
import { BOOT_SEQUENCE, BOOT_VERSE, BOOT_WELCOME, type BootLine } from "../data/bootSequence";
import { ASCII_CROSS, ASCII_KINGDOM_BANNER } from "../data/asciiArt";
import { scrambleFrame } from "../lib/scramble";
import { playEnterBeep, playAccessChime } from "../lib/sound";
import { Cursor } from "./Cursor";

interface BootSequenceProps {
  onComplete: () => void;
  reducedMotion: boolean;
  muted: boolean;
}

type Stage = "banner" | "log" | "cross" | "verse" | "welcome" | "done";

const toneColor: Record<NonNullable<BootLine["tone"]>, string> = {
  normal: "var(--kp-fg)",
  dim: "var(--kp-fg-dim)",
  gold: "var(--kp-gold)",
  bright: "var(--kp-fg-bright)",
};

function sleep(ms: number, cancelledRef: { current: boolean }): Promise<void> {
  return new Promise((resolve) => {
    const id = window.setTimeout(resolve, ms);
    if (cancelledRef.current) {
      window.clearTimeout(id);
      resolve();
    }
  });
}

export function BootSequence({ onComplete, reducedMotion, muted }: BootSequenceProps) {
  const [completedLines, setCompletedLines] = useState<BootLine[]>([]);
  const [activeLine, setActiveLine] = useState<{ text: string; tone: NonNullable<BootLine["tone"]> } | null>(null);
  const [stage, setStage] = useState<Stage>("banner");
  const doneRef = useRef(false);
  const cancelRef = useRef<() => void>(() => {});

  useEffect(() => {
    // Each effect invocation gets its own cancellation flag rather than a
    // shared ref, so React StrictMode's dev-only mount/cleanup/mount replay
    // can't resurrect a stale run by resetting a flag the new run also reads.
    const cancelledRef = { current: false };
    cancelRef.current = () => {
      cancelledRef.current = true;
    };

    async function typeLine(line: BootLine) {
      const tone = line.tone ?? "normal";
      if (reducedMotion) {
        setActiveLine({ text: line.text, tone });
        await sleep(70, cancelledRef);
        setCompletedLines((prev) => [...prev, line]);
        setActiveLine(null);
        return;
      }

      if (line.scramble) {
        const frames = 10;
        for (let f = 1; f <= frames; f += 1) {
          if (cancelledRef.current) return;
          const revealCount = Math.round((line.text.length * f) / frames);
          setActiveLine({ text: scrambleFrame(line.text, revealCount), tone });
          await sleep(28, cancelledRef);
        }
        setActiveLine({ text: line.text, tone });
      } else {
        for (let i = 1; i <= line.text.length; i += 1) {
          if (cancelledRef.current) return;
          setActiveLine({ text: line.text.slice(0, i), tone });
          await sleep(14, cancelledRef);
        }
      }
      setCompletedLines((prev) => [...prev, line]);
      setActiveLine(null);
      await sleep(line.pauseAfter ?? 120, cancelledRef);
    }

    async function run() {
      await sleep(reducedMotion ? 100 : 500, cancelledRef);
      if (cancelledRef.current) return;
      setStage("log");

      for (const line of BOOT_SEQUENCE) {
        if (cancelledRef.current) return;
        if (!muted && line.text === "VERIFYING IDENTITY...") playEnterBeep();
        await typeLine(line);
      }
      if (cancelledRef.current) return;
      if (!muted) playAccessChime();

      await sleep(reducedMotion ? 60 : 400, cancelledRef);
      if (cancelledRef.current) return;
      setStage("cross");

      await sleep(reducedMotion ? 60 : 650, cancelledRef);
      if (cancelledRef.current) return;
      setStage("verse");

      await sleep(reducedMotion ? 120 : 1600, cancelledRef);
      if (cancelledRef.current) return;
      setStage("welcome");

      await sleep(reducedMotion ? 200 : 1500, cancelledRef);
      if (cancelledRef.current) return;
      setStage("done");
      finish();
    }

    function finish() {
      if (doneRef.current) return;
      doneRef.current = true;
      onComplete();
    }

    void run();

    return () => {
      cancelledRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  function skip() {
    if (doneRef.current) return;
    cancelRef.current();
    doneRef.current = true;
    onComplete();
  }

  useEffect(() => {
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="kp-scroll flex h-full w-full flex-col justify-center gap-3 overflow-y-auto px-5 py-10 sm:px-10"
      style={{ color: "var(--kp-fg)" }}
      role="status"
      aria-live="polite"
      onClick={skip}
    >
      <pre
        className="kp-glow mx-auto text-[7px] leading-tight sm:text-[10px] md:text-xs kp-fade-in"
        style={{ color: "var(--kp-gold)" }}
        aria-hidden="true"
      >
        {ASCII_KINGDOM_BANNER}
      </pre>

      <div className="mx-auto flex w-full max-w-xl flex-col gap-1 text-xs sm:text-sm">
        {completedLines.map((line, i) => (
          <div key={i} className="kp-glow" style={{ color: toneColor[line.tone ?? "normal"] }}>
            {line.text}
          </div>
        ))}
        {activeLine && (
          <div className="kp-glow" style={{ color: toneColor[activeLine.tone] }}>
            {activeLine.text}
            <Cursor />
          </div>
        )}
      </div>

      {(stage === "cross" || stage === "verse" || stage === "welcome") && (
        <div className="kp-fade-in mx-auto w-full max-w-lg overflow-x-auto px-2">
          <pre
            className="kp-glow mx-auto w-max text-[6px] leading-none sm:text-[9px]"
            style={{ color: "var(--kp-fg)" }}
            aria-hidden="true"
          >
            {ASCII_CROSS}
          </pre>
        </div>
      )}

      {(stage === "verse" || stage === "welcome") && (
        <div className="kp-fade-in mx-auto max-w-md text-center text-xs italic sm:text-sm" style={{ color: "var(--kp-fg-bright)" }}>
          &ldquo;{BOOT_VERSE.text}&rdquo;
          <div className="mt-1 not-italic kp-glow-gold">— {BOOT_VERSE.reference}</div>
        </div>
      )}

      {stage === "welcome" && (
        <div className="kp-fade-in kp-glow mx-auto text-center text-[10px] tracking-widest sm:text-xs" style={{ color: "var(--kp-fg-dim)" }}>
          {BOOT_WELCOME}
        </div>
      )}

      <div
        className="fixed bottom-4 right-4 text-[10px] tracking-widest opacity-60 sm:bottom-6 sm:right-6"
        style={{ color: "var(--kp-fg-dim)" }}
      >
        PRESS ANY KEY TO SKIP
      </div>
    </div>
  );
}
