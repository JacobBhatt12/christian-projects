import type { OutputNode } from "../types";
import { EasterEggBurst } from "./EasterEggBurst";

const toneStyle: Record<NonNullable<Extract<OutputNode, { kind: "text" }>["tone"]>, React.CSSProperties> = {
  normal: { color: "var(--kp-fg)" },
  dim: { color: "var(--kp-fg-dim)" },
  gold: { color: "var(--kp-gold)" },
  bright: { color: "var(--kp-fg-bright)" },
};

interface TerminalOutputLineProps {
  node: OutputNode;
}

export function TerminalOutputLine({ node }: TerminalOutputLineProps) {
  switch (node.kind) {
    case "text":
      return (
        <div className="kp-glow whitespace-pre-wrap break-words" style={toneStyle[node.tone ?? "normal"]}>
          {node.text}
        </div>
      );
    case "blank":
      return <div className="h-3" aria-hidden="true" />;
    case "ascii":
      return (
        <pre
          className="kp-glow overflow-x-auto text-[9px] leading-none sm:text-xs"
          style={{ color: node.tone === "gold" ? "var(--kp-gold)" : "var(--kp-fg)" }}
        >
          {node.art}
        </pre>
      );
    case "verse":
      return (
        <div className="my-1 border-l-2 pl-3" style={{ borderColor: "var(--kp-border)" }}>
          <div className="kp-glow italic" style={{ color: "var(--kp-fg-bright)" }}>
            &ldquo;{node.verse.text}&rdquo;
          </div>
          <div className="kp-glow-gold mt-1 text-xs tracking-widest">— {node.verse.reference}</div>
        </div>
      );
    case "glitch":
      return (
        <div className="kp-glitch kp-glow-gold text-base tracking-widest sm:text-lg" data-text={node.text}>
          {node.text}
        </div>
      );
    case "component":
      if (node.id === "easteregg") return <EasterEggBurst />;
      return null;
    default:
      return null;
  }
}
