import { ASCII_DOVE, ASCII_LIGHT_BURST, ASCII_CROSS } from "../data/asciiArt";

export function EasterEggBurst() {
  return (
    <div className="my-2 flex flex-col items-center gap-2 text-center">
      <pre
        className="kp-egg-item kp-glow-gold kp-egg-pulse text-[9px] leading-none sm:text-xs"
        style={{ animationDelay: "0ms" }}
      >
        {ASCII_LIGHT_BURST}
      </pre>
      <pre
        className="kp-egg-item kp-glow text-[9px] leading-none sm:text-xs"
        style={{ animationDelay: "260ms" }}
      >
        {ASCII_DOVE}
      </pre>
      <div className="kp-egg-item w-full max-w-md overflow-x-auto px-2" style={{ animationDelay: "520ms" }}>
        <pre className="kp-glow mx-auto w-max text-[6px] leading-none sm:text-[9px]">{ASCII_CROSS}</pre>
      </div>
      <div className="kp-egg-item kp-glow-gold max-w-sm text-xs sm:text-sm" style={{ animationDelay: "780ms" }}>
        &ldquo;But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness,
        goodness, faith, meekness, temperance.&rdquo; — Galatians 5:22-23
      </div>
    </div>
  );
}
