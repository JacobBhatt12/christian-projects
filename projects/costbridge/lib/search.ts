import type {
  Alternative,
  AlternativeResult,
  AssistanceResource,
  ResourceResult,
  SearchFilters,
  SearchInput,
  SearchResults,
  SortOption,
} from "@/lib/types";
import { calculateDistanceMiles, getCoordinatesForZip } from "@/lib/location";
import { calculateMonthlySavings, calculateUnitPrice } from "@/lib/savings";

const WORD_PATTERN = /[a-z0-9]+/g;

function searchableWords(value: string) {
  return value.toLowerCase().match(WORD_PATTERN) ?? [];
}

function matchScore(query: string, fields: string[]) {
  const queryWords = searchableWords(query);
  if (queryWords.length === 0) return 1;

  const haystack = fields.join(" ").toLowerCase();
  return queryWords.reduce((score, word) => {
    if (haystack.includes(word)) return score + 2;
    const partial = searchableWords(haystack).some(
      (candidate) => candidate.startsWith(word) || word.startsWith(candidate),
    );
    return score + (partial ? 1 : 0);
  }, 0);
}

function matchesFilters(
  item: Pick<
    Alternative | AssistanceResource,
    "free" | "discounted" | "transitAccessible" | "onlineAvailable"
  >,
  filters: SearchFilters = {},
) {
  if (filters.free && !item.free) return false;
  if (filters.discounted && !item.discounted) return false;
  if (filters.transitAccessible && !item.transitAccessible) return false;
  if (filters.onlineAvailable && !item.onlineAvailable) return false;
  return true;
}

function sortAlternatives(items: AlternativeResult[], sort: SortOption) {
  return [...items].sort((a, b) => {
    if (sort === "price") return a.price - b.price;
    if (sort === "distance") {
      return (a.distance ?? Number.POSITIVE_INFINITY) -
        (b.distance ?? Number.POSITIVE_INFINITY);
    }
    return b.estimatedMonthlySavings - a.estimatedMonthlySavings;
  });
}

function sortResources(items: ResourceResult[], sort: SortOption) {
  return [...items].sort((a, b) => {
    if (sort === "price") {
      const priceDifference = Number(b.free) - Number(a.free);
      return priceDifference || a.distance - b.distance;
    }
    return a.distance - b.distance;
  });
}

export function searchData(
  input: SearchInput,
  alternatives: Alternative[],
  resources: AssistanceResource[],
): SearchResults {
  const origin = getCoordinatesForZip(input.zip);
  const maxDistance = input.distance ?? 25;
  const sort = input.sort ?? "savings";
  const need = input.need?.trim() ?? "";

  const categoryAlternatives = alternatives.filter(
    (alternative) => alternative.category === input.category,
  );
  const scoredAlternatives = categoryAlternatives.map((alternative) => ({
    alternative,
    score: matchScore(need, [
      alternative.title,
      alternative.provider,
      alternative.description,
      alternative.tradeoffs,
      ...alternative.tags,
    ]),
  }));
  const hasAlternativeMatches = scoredAlternatives.some(({ score }) => score > 0);

  const alternativeResults = scoredAlternatives
    .filter(({ alternative, score }) => {
      if (!matchesFilters(alternative, input.filters)) return false;
      return !need || !hasAlternativeMatches || score > 0;
    })
    .map(({ alternative }) => {
      const distance = alternative.location
        ? calculateDistanceMiles(origin, alternative.location)
        : null;
      return {
        ...alternative,
        distance,
        unitPrice: calculateUnitPrice(alternative.price, alternative.quantity),
        comparisonUnitPrice: calculateUnitPrice(
          alternative.comparisonPrice,
          alternative.comparisonQuantity,
        ),
        estimatedMonthlySavings: calculateMonthlySavings(alternative),
      };
    })
    .filter(
      (alternative) =>
        alternative.distance === null || alternative.distance <= maxDistance,
    );

  const categoryResources = resources.filter(
    (resource) => resource.category === input.category,
  );
  const scoredResources = categoryResources.map((resource) => ({
    resource,
    score: matchScore(need, [
      resource.organizationName,
      resource.description,
      resource.eligibility,
      ...resource.services,
      ...resource.tags,
    ]),
  }));
  const hasResourceMatches = scoredResources.some(({ score }) => score > 0);

  const resourceResults = scoredResources
    .filter(({ resource, score }) => {
      if (!matchesFilters(resource, input.filters)) return false;
      return !need || !hasResourceMatches || score > 0;
    })
    .map(({ resource }) => ({
      ...resource,
      distance: calculateDistanceMiles(origin, resource.location),
    }))
    .filter((resource) => resource.distance <= maxDistance);

  return {
    alternatives: sortAlternatives(alternativeResults, sort),
    resources: sortResources(resourceResults, sort),
  };
}
