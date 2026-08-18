interface CRTFrameProps {
  reducedMotion: boolean;
}

export function CRTFrame({ reducedMotion }: CRTFrameProps) {
  return (
    <>
      <div className={`kp-crt ${reducedMotion ? "" : "kp-flicker"}`} aria-hidden="true" />
      <div className="kp-crt-curve" aria-hidden="true" />
      <svg
        className="kp-noise"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <filter id="kp-noise-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#kp-noise-filter)" />
      </svg>
    </>
  );
}
