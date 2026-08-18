interface MuteToggleProps {
  muted: boolean;
  onToggle: () => void;
}

export function MuteToggle({ muted, onToggle }: MuteToggleProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onToggle}
      aria-pressed={muted}
      className="flex items-center gap-2 rounded border px-2.5 py-1 text-[11px] tracking-widest uppercase transition-colors hover:opacity-80"
      style={{
        borderColor: "var(--kp-border)",
        color: "var(--kp-fg-dim)",
      }}
    >
      <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
      <span>{muted ? "Sound off" : "Sound on"}</span>
    </button>
  );
}
