import { SlidersHorizontal } from "lucide-react";
import type { SearchInput } from "@/lib/types";

export function FilterBar({ input }: { input: SearchInput }) {
  return (
    <form action="/results" method="get" className="filter-bar print:hidden">
      <input type="hidden" name="zip" value={input.zip} />
      <input type="hidden" name="category" value={input.category} />
      <input type="hidden" name="need" value={input.need} />
      <div className="filter-heading">
        <SlidersHorizontal aria-hidden="true" size={18} />
        <span>Refine results</span>
      </div>
      <div className="filter-options">
        <label className="check-option">
          <input type="checkbox" name="free" value="true" defaultChecked={input.filters?.free} />
          <span>Free</span>
        </label>
        <label className="check-option">
          <input type="checkbox" name="discounted" value="true" defaultChecked={input.filters?.discounted} />
          <span>Discounted</span>
        </label>
        <label className="check-option">
          <input type="checkbox" name="transitAccessible" value="true" defaultChecked={input.filters?.transitAccessible} />
          <span>Public transit accessible</span>
        </label>
        <label className="check-option">
          <input type="checkbox" name="onlineAvailable" value="true" defaultChecked={input.filters?.onlineAvailable} />
          <span>Available online</span>
        </label>
      </div>
      <div className="filter-selects">
        <label>
          <span>Within</span>
          <select name="distance" defaultValue={String(input.distance ?? 25)}>
            <option value="5">5 miles</option>
            <option value="10">10 miles</option>
            <option value="25">25 miles</option>
            <option value="50">50 miles</option>
            <option value="100">100 miles</option>
          </select>
        </label>
        <label>
          <span>Sort by</span>
          <select name="sort" defaultValue={input.sort ?? "savings"}>
            <option value="savings">Estimated savings</option>
            <option value="price">Lowest price</option>
            <option value="distance">Nearest first</option>
          </select>
        </label>
        <button type="submit" className="button button-secondary">Apply filters</button>
      </div>
    </form>
  );
}
