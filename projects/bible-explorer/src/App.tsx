import { useMemo, useState } from "react";
import { lambOfGodJourney } from "./data/lambOfGod";
import JourneyGraph from "./components/JourneyGraph";
import DetailPanel from "./components/DetailPanel";

function App() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());

  const openStop = useMemo(
    () => lambOfGodJourney.find((s) => s.id === openId) ?? null,
    [openId],
  );

  const handleOpen = (id: string) => {
    setOpenId(id);
    setVisited((prev) => new Set(prev).add(id));
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-neutral-200 px-6 py-8 text-center sm:px-10">
        <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">
          A Bible Explorer &middot; Journey One
        </div>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900 sm:text-4xl">
          The Lamb of God
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm italic text-neutral-500">
          Trace the promise. Follow the thread. See the whole story.
        </p>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <p className="mx-auto mb-6 max-w-2xl text-center text-sm leading-relaxed text-neutral-500">
          Ten moments, Genesis to Revelation, one image running through all of them. Scroll sideways and click a stop to open it up. 
        </p>

        <JourneyGraph visited={visited} onOpen={handleOpen} />

        <div className="mt-4 text-center text-xs text-neutral-400">
          {visited.size} of {lambOfGodJourney.length} stoped opened
        </div>
      </main>

      <footer className="border-t border-neutral-200 px-6 py-6 text-center text-xs text-neutral-400">
        Scripture quotations are from the King James Version (public domain).
      </footer>

      <DetailPanel stop={openStop} onClose={() => setOpenId(null)} />
        </div>
      
  );
}
export default App; 
