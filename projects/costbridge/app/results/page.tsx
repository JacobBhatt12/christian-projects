import type { Metadata } from "next";
import Link from "next/link";
import { PencilLine } from "lucide-react";
import { PrintButton } from "@/components/actions/print-button";
import { AlternativeRow } from "@/components/results/alternative-row";
import { EmptyState } from "@/components/results/empty-state";
import { FilterBar } from "@/components/results/filter-bar";
import { ResourceRow } from "@/components/results/resource-row";
import { Notice } from "@/components/ui/notice";
import { categoryMap } from "@/lib/data/categories";
import { getCoordinatesForZip } from "@/lib/location";
import { searchData } from "@/lib/search";
import { getSearchData } from "@/lib/server/repository";
import type { SearchInput } from "@/lib/types";
import { searchSchema } from "@/lib/validation";

export const metadata: Metadata = { title: "Search results" };

type ResultsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function checked(value: string | string[] | undefined) {
  const item = first(value);
  return item === "true" || item === "1" || item === "on";
}

export default async function ResultsPage(props: ResultsPageProps) {
  const params = await props.searchParams;
  const parsed = searchSchema.safeParse({
    zip: first(params.zip),
    category: first(params.category),
    need: first(params.need) ?? "",
    distance: first(params.distance) ?? 25,
    sort: first(params.sort) ?? "savings",
    free: checked(params.free),
    discounted: checked(params.discounted),
    transitAccessible: checked(params.transitAccessible),
    onlineAvailable: checked(params.onlineAvailable),
  });

  if (!parsed.success) {
    return (
      <main id="main-content" className="page-shell error-state-page">
        <p className="eyebrow">Search needs one correction</p>
        <h1>We could not read those search details</h1>
        <p>Use a 5-digit ZIP code, choose a category, and try again.</p>
        <Link href="/search" className="button button-primary">Return to search</Link>
      </main>
    );
  }

  const input: SearchInput = {
    zip: parsed.data.zip,
    category: parsed.data.category,
    need: parsed.data.need,
    distance: parsed.data.distance,
    sort: parsed.data.sort,
    filters: {
      free: parsed.data.free,
      discounted: parsed.data.discounted,
      transitAccessible: parsed.data.transitAccessible,
      onlineAvailable: parsed.data.onlineAvailable,
    },
  };
  const data = await getSearchData();
  const results = searchData(input, data.alternatives, data.resources);
  const category = categoryMap.get(input.category);
  const coordinates = getCoordinatesForZip(input.zip);
  const headingNeed = input.need ? `“${input.need}”` : category?.name.toLowerCase();

  return (
    <main id="main-content" className="results-page">
      <header className="results-heading">
        <div>
          <p className="eyebrow">Results near {input.zip}</p>
          <h1>Options for {headingNeed}</h1>
          <p>{results.alternatives.length} lower-cost options and {results.resources.length} community programs</p>
        </div>
        <div className="heading-actions print:hidden">
          <Link href="/search" className="button button-secondary"><PencilLine aria-hidden="true" size={18} /> Change search</Link>
          <PrintButton />
        </div>
      </header>

      <div className="results-notices">
        {data.source === "sample" ? (
          <Notice tone="warning"><strong>Development data:</strong> These sample listings and prices are fictional. Confirm details before relying on them.</Notice>
        ) : null}
        {coordinates.estimated ? (
          <Notice>We do not have local coordinates for this ZIP in the development dataset, so distances are rough estimates.</Notice>
        ) : null}
      </div>

      <FilterBar input={input} />

      <section className="results-section" aria-labelledby="alternatives-heading">
        <div className="results-section-heading">
          <div>
            <p className="section-index">01</p>
            <h2 id="alternatives-heading">Cheaper alternatives</h2>
          </div>
          <p>Prices are examples. Monthly savings depend on quantity and typical use.</p>
        </div>
        <div className="result-list">
          {results.alternatives.length > 0
            ? results.alternatives.map((alternative) => <AlternativeRow key={alternative.id} alternative={alternative} />)
            : <EmptyState type="alternatives" />}
        </div>
      </section>

      <section className="results-section community-section" aria-labelledby="resources-heading">
        <div className="results-section-heading">
          <div>
            <p className="section-index">02</p>
            <h2 id="resources-heading">Community assistance</h2>
          </div>
          <p>Programs make their own eligibility decisions. CostBridge cannot promise approval.</p>
        </div>
        <div className="result-list">
          {results.resources.length > 0
            ? results.resources.map((resource) => <ResourceRow key={resource.id} resource={resource} zip={input.zip} />)
            : <EmptyState type="resources" />}
        </div>
      </section>
    </main>
  );
}
