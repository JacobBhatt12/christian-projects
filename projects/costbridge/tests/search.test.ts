import { describe, expect, it } from "vitest";
import { alternatives } from "@/lib/data/alternatives";
import { assistanceResources } from "@/lib/data/resources";
import { searchData } from "@/lib/search";

describe("search", () => {
  it("matches a need within the selected category", () => {
    const results = searchData(
      { zip: "33602", category: "groceries", need: "oats", distance: 25 },
      alternatives,
      assistanceResources,
    );
    expect(results.alternatives[0]?.title).toMatch(/oats/i);
    expect(results.resources.every((resource) => resource.category === "groceries")).toBe(true);
  });

  it("falls back to useful category results when wording does not match", () => {
    const results = searchData(
      { zip: "33602", category: "healthcare", need: "unrecognized phrase", distance: 25 },
      alternatives,
      assistanceResources,
    );
    expect(results.alternatives.length).toBe(3);
    expect(results.resources.length).toBe(3);
  });

  it("sorts alternatives by lowest price", () => {
    const results = searchData(
      { zip: "33602", category: "internet-phone", distance: 100, sort: "price" },
      alternatives,
      assistanceResources,
    );
    expect(results.alternatives.map((item) => item.price)).toEqual([0, 25, 129]);
  });
});
