import Link from "next/link";

export default function ResourceNotFound() {
  return (
    <main id="main-content" className="page-shell error-state-page">
      <p className="eyebrow">Resource not found</p>
      <h1>This listing may have moved or been removed</h1>
      <p>Start a new search to see the resources currently available.</p>
      <Link href="/search" className="button button-primary">Start a search</Link>
    </main>
  );
}
