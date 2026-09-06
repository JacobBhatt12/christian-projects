"use client";

export default function ResultsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main-content" className="page-shell error-state-page">
      <p className="eyebrow">Search is temporarily unavailable</p>
      <h1>We could not load these results</h1>
      <p>Your search details are still in the address bar. Try again in a moment.</p>
      <button type="button" className="button button-primary" onClick={reset}>Try again</button>
    </main>
  );
}
