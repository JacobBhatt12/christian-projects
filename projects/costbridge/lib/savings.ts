import type { Alternative } from "@/lib/types";

export function calculateUnitPrice(price: number, quantity: number) {
  if (!Number.isFinite(price) || !Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Price and quantity must be valid, and quantity must be greater than zero.");
  }

  return price / quantity;
}

export function calculateMonthlySavings(
  alternative: Pick<
    Alternative,
    | "price"
    | "quantity"
    | "comparisonPrice"
    | "comparisonQuantity"
    | "monthlyUses"
  >,
) {
  const alternativeUnitPrice = calculateUnitPrice(
    alternative.price,
    alternative.quantity,
  );
  const comparisonUnitPrice = calculateUnitPrice(
    alternative.comparisonPrice,
    alternative.comparisonQuantity,
  );
  const savingsPerPurchase =
    (comparisonUnitPrice - alternativeUnitPrice) * alternative.quantity;

  return Math.max(0, savingsPerPurchase * Math.max(0, alternative.monthlyUses));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}
