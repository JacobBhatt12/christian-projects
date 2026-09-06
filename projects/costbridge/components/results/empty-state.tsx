import Link from "next/link";
import { SearchX } from "lucide-react";

export function EmptyState({ type }: { type: "alternatives" | "resources" }) {
  return (
    <div className="empty-state">
      <SearchX aria-hidden="true" size={28} />
      <div>
        <h3>No {type === "alternatives" ? "lower-cost options" : "community resources"} match these filters</h3>
        <p>Try a wider distance, remove a filter, or use a more general need such as “food” or “transportation.”</p>
        <Link href="/search" className="text-link">Start a new search</Link>
      </div>
    </div>
  );
}
