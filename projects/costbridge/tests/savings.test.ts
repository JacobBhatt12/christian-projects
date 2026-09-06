import { describe, expect, it } from "vitest";
import { calculateMonthlySavings, calculateUnitPrice } from "@/lib/savings";

describe("savings calculations", () => {
  it("calculates a comparable unit price", () => {
    expect(calculateUnitPrice(3.98, 42)).toBeCloseTo(0.09476, 5);
  });

  it("estimates monthly savings using comparable quantities", () => {
    expect(
      calculateMonthlySavings({
        price: 3.98,
        quantity: 42,
        comparisonPrice: 5.99,
        comparisonQuantity: 42,
        monthlyUses: 2,
      }),
    ).toBeCloseTo(4.02, 2);
  });

  it("never reports negative savings", () => {
    expect(
      calculateMonthlySavings({
        price: 10,
        quantity: 1,
        comparisonPrice: 8,
        comparisonQuantity: 1,
        monthlyUses: 1,
      }),
    ).toBe(0);
  });

  it("rejects invalid quantities", () => {
    expect(() => calculateUnitPrice(4, 0)).toThrow(/greater than zero/);
  });
});
