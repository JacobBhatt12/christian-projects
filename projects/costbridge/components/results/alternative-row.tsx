import { CircleDollarSign, MapPin, ShoppingBasket } from "lucide-react";
import { SaveButton } from "@/components/actions/save-button";
import { ShareButton } from "@/components/actions/share-button";
import { StatusLabel } from "@/components/ui/status-label";
import { formatCurrency } from "@/lib/savings";
import type { AlternativeResult } from "@/lib/types";

export function AlternativeRow({ alternative }: { alternative: AlternativeResult }) {
  return (
    <article className="result-row alternative-row">
      <div className="result-row-main">
        <div className="result-kicker">
          <StatusLabel status="sample" isSample={alternative.isSample} />
          {alternative.onlineAvailable ? <span>Available online</span> : null}
        </div>
        <h3>{alternative.title}</h3>
        <p className="provider-line"><ShoppingBasket aria-hidden="true" size={16} /> {alternative.provider}</p>
        <p className="result-description">{alternative.description}</p>
        <dl className="price-comparison">
          <div>
            <dt>Lower-cost option</dt>
            <dd>{formatCurrency(alternative.price)}</dd>
            <span>{formatCurrency(alternative.unitPrice)} per {alternative.unit}</span>
          </div>
          <div>
            <dt>{alternative.comparisonLabel}</dt>
            <dd>{formatCurrency(alternative.comparisonPrice)}</dd>
            <span>{formatCurrency(alternative.comparisonUnitPrice)} per {alternative.unit}</span>
          </div>
        </dl>
        <details className="tradeoff-details">
          <summary>Important tradeoffs</summary>
          <p>{alternative.tradeoffs}</p>
        </details>
        <div className="result-actions print:hidden">
          <SaveButton itemType="alternative" itemId={alternative.id} />
          <ShareButton title={alternative.title} />
        </div>
      </div>
      <aside className="result-figure" aria-label="Savings estimate">
        <CircleDollarSign aria-hidden="true" size={22} />
        <span className="figure-label">Estimated monthly savings</span>
        <strong>{formatCurrency(alternative.estimatedMonthlySavings)}</strong>
        {alternative.distance !== null ? (
          <span className="distance-line"><MapPin aria-hidden="true" size={15} /> About {alternative.distance.toFixed(1)} mi</span>
        ) : (
          <span className="distance-line">Online option</span>
        )}
      </aside>
    </article>
  );
}
