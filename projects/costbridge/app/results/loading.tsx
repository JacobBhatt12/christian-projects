export default function ResultsLoading() {
  return (
    <main id="main-content" className="results-page" aria-busy="true" aria-label="Loading search results">
      <div className="skeleton skeleton-heading" />
      <div className="skeleton skeleton-filter" />
      <div className="skeleton skeleton-row" />
      <div className="skeleton skeleton-row" />
      <span className="sr-only">Loading search results…</span>
    </main>
  );
}
