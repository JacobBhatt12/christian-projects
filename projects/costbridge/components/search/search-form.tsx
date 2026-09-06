import { ArrowRight, LockKeyhole } from "lucide-react";
import { categories } from "@/lib/data/categories";
import type { CategorySlug } from "@/lib/types";

type SearchFormProps = {
  compact?: boolean;
  defaults?: {
    zip?: string;
    category?: CategorySlug;
    need?: string;
  };
};

export function SearchForm({ compact = false, defaults = {} }: SearchFormProps) {
  return (
    <form action="/results" method="get" className={compact ? "search-form compact" : "search-form"}>
      <div className="form-step">
        <div className="step-number" aria-hidden="true">1</div>
        <div className="step-content">
          <label htmlFor="zip" className="field-label">What is your ZIP code?</label>
          <p id="zip-help" className="field-help">Used only to estimate distance. We do not ask for precise location.</p>
          <input
            id="zip"
            name="zip"
            className="text-input zip-input"
            inputMode="numeric"
            autoComplete="postal-code"
            pattern="[0-9]{5}"
            maxLength={5}
            placeholder="33602"
            defaultValue={defaults.zip}
            aria-describedby="zip-help"
            required
          />
        </div>
      </div>

      <fieldset className="form-step">
        <legend className="sr-only">Choose an expense category</legend>
        <div className="step-number" aria-hidden="true">2</div>
        <div className="step-content">
          <p className="field-label" aria-hidden="true">Choose an expense</p>
          <div className="category-options">
            {categories.map((category) => (
              <label key={category.slug} className="category-option">
                <input
                  type="radio"
                  name="category"
                  value={category.slug}
                  defaultChecked={(defaults.category ?? "groceries") === category.slug}
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <div className="form-step">
        <div className="step-number" aria-hidden="true">3</div>
        <div className="step-content">
          <label htmlFor="need" className="field-label">What are you trying to lower or find?</label>
          <p id="need-help" className="field-help">For example: oats, rent, electric bill, bus pass, or dental care.</p>
          <input
            id="need"
            name="need"
            className="text-input"
            maxLength={120}
            placeholder="Type an item, service, or need"
            defaultValue={defaults.need}
            aria-describedby="need-help"
            required
          />
        </div>
      </div>

      <div className="search-submit-row">
        <p className="search-privacy"><LockKeyhole aria-hidden="true" size={16} /> Search without an account</p>
        <button type="submit" className="button button-primary">
          Find lower-cost options <ArrowRight aria-hidden="true" size={18} />
        </button>
      </div>
    </form>
  );
}
