import type { Metadata } from "next";
import { SearchForm } from "@/components/search/search-form";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <main id="main-content" className="page-shell search-page">
      <header className="page-heading">
        <p className="eyebrow">Find practical options</p>
        <h1>Start with one expense</h1>
        <p>You can change any detail on the results page. No account or exact location is required.</p>
      </header>
      <SearchForm />
    </main>
  );
}
