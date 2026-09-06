import type { Metadata } from "next";
import { SavedList } from "@/components/saved/saved-list";

export const metadata: Metadata = { title: "Saved resources" };

export default function SavedPage() {
  return (
    <main id="main-content" className="page-shell saved-page">
      <header className="page-heading">
        <p className="eyebrow">Your shortlist</p>
        <h1>Saved resources</h1>
        <p>Saved items are connected to this browser, not an account. Clearing local site data removes access to this list.</p>
      </header>
      <SavedList />
    </main>
  );
}
