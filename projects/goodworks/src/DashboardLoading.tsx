import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export const DASHBOARD_LOAD_MS = 3000;
const stages = ["activities", "supplies", "logs"];

export function DashboardLoading({
  fullscreen = false,
}: {
  fullscreen?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const timers = stages
      .slice(1)
      .map((_, index) =>
        window.setTimeout(
          () => setStage(index + 1),
          (index + 1) * (DASHBOARD_LOAD_MS / stages.length),
        ),
      );
    return () => timers.forEach(window.clearTimeout);
  }, []);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        gsap.to(".loading-indicator-segment", {
          x: 180,
          duration: 1.15,
          repeat: -1,
          ease: "power1.inOut",
        });
        gsap.fromTo(
          ".loading-dots span",
          { opacity: 0.25 },
          {
            opacity: 1,
            duration: 0.4,
            stagger: 0.16,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          },
        );
        gsap.fromTo(
          ".loading-stage",
          { opacity: 0, y: 5 },
          {
            opacity: 1,
            y: 0,
            duration: 0.25,
            ease: "power3.out",
            clearProps: "opacity,transform",
          },
        );
      },
      root,
    );
    return () => media.revert();
  }, [stage]);
  return (
    <div
      ref={root}
      className={`dashboard-loading ${fullscreen ? "loading-fullscreen" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="loading-heading">
        <h2>Loading your dashboard</h2>
        <p className="loading-stage" key={stage}>
          Loading {stages[stage]}
          <span className="loading-dots" aria-hidden="true">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
        <div className="loading-indicator" aria-hidden="true">
          <span className="loading-indicator-segment" />
        </div>
      </div>
    </div>
  );
}
