import { describe, expect, it } from "vitest";
import { alternatives } from "@/lib/data/alternatives";
import { assistanceResources } from "@/lib/data/resources";
import { searchData } from "@/lib/search";

describe("result filters", () => {
  it("keeps only free options when requested", () => {
    const results = searchData(
      { zip: "33602", category: "transportation", distance: 100, filters: { free: true } },
      alternatives,
      assistanceResources,
    );
    expect(results.alternatives.length).toBeGreaterThan(0);
    expect(results.alternatives.every((item) => item.free)).toBe(true);
    expect(results.resources.every((item) => item.free)).toBe(true);
  });

  it("combines online and discounted filters", () => {
    const results = searchData(
      {
        zip: "33602",
        category: "internet-phone",
        distance: 100,
        filters: { onlineAvailable: true, discounted: true },
      },
      alternatives,
      assistanceResources,
    );
    expect(results.alternatives.every((item) => item.onlineAvailable && item.discounted)).toBe(true);
    expect(results.resources.every((item) => item.onlineAvailable && item.discounted)).toBe(true);
  });

  it("respects the selected distance", () => {
    const near = searchData(
      { zip: "33602", category: "childcare", distance: 5 },
      alternatives,
      assistanceResources,
    );
    expect(near.resources.every((item) => item.distance <= 5)).toBe(true);
  });
});
