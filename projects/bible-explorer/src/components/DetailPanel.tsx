import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { JourneyStop } from "../types";

interface DetailPanelProps {
  stop: JourneyStop | null;
  onClose: () => void;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-neutral-200 py-4 first:border-t-0 first:pt-0">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
        {label}
      </div>
      {children}
    </div>
  );
}

export default function DetailPanel({ stop, onClose }: DetailPanelProps) {
  const [showPrayer, setShowPrayer] = useState(false);

  return (
    <AnimatePresence
      onExitComplete={() => setShowPrayer(false)}
    >
      {stop && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.aside
            key="panel"
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-neutral-200 bg-white px-7 py-8 shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-start justify-between">
              <div className="text-[11px] uppercase tracking-widest text-neutral-400">
                Stop {String(stop.order).padStart(2, "0")} of 10 &middot; {stop.era}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="-mt-1 -mr-2 px-2 text-xl leading-none text-neutral-400 hover:text-neutral-800"
              >
                &times;
              </button>
            </div>

            <h2 className="mt-2 text-2xl font-bold text-neutral-900">{stop.title}</h2>
            <div className="mt-1 text-sm text-neutral-500">
              {stop.reference} &middot; {stop.location}
            </div>

            <Section label="Scripture">
              <blockquote className="border-l-2 border-neutral-900 pl-4 text-[15px] italic leading-relaxed text-neutral-700">
                "{stop.scripture}"
              </blockquote>
            </Section>

            <Section label="Context">
              <p className="text-[15px] leading-relaxed text-neutral-700">{stop.context}</p>
            </Section>

            <Section label="Why this connects">
              <p className="text-[15px] leading-relaxed text-neutral-700">{stop.connection}</p>
            </Section>

            {stop.prophecy && (
              <Section label="Prophecy & fulfillment">
                <p className="text-[15px] leading-relaxed text-neutral-700">{stop.prophecy}</p>
              </Section>
            )}

            <Section label="People & places">
              <div className="flex flex-wrap gap-1.5">
                {[...stop.people, ...stop.places].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-neutral-300 px-2.5 py-0.5 text-xs text-neutral-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Section>

            <Section label="Themes">
              <div className="flex flex-wrap gap-1.5">
                {stop.themes.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Section>

            <Section label="Reflection">
              <p className="text-[15px] leading-relaxed text-neutral-800">{stop.reflection}</p>
            </Section>

            <Section label="Prayer">
              {showPrayer ? (
                <p className="text-[15px] italic leading-relaxed text-neutral-700">
                  {stop.prayer}
                </p>
              ) : (
                <button
                  onClick={() => setShowPrayer(true)}
                  className="text-sm font-bold text-neutral-900 hover:underline"
                >
                  Show a prayer prompt
                </button>
              )}
            </Section>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
