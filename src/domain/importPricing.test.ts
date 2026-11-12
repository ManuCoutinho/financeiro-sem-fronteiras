import { describe, expect, it } from 'vitest';
import { calculateMarginPercent, calculateUnitCostCents } from './importPricing';

describe('calculateUnitCostCents', () => {
  it('includes exchange rate, shipping and taxes (HU08)', () => {
    expect(
      calculateUnitCostCents({
        foreignAmount: 100,
        exchangeRate: 5.5,
        shippingCents: 8000,
        taxesCents: 6000,
        quantity: 10,
      }),
    ).toBe(6900);
  });
});

describe('calculateMarginPercent', () => {
  it('returns the margin over the sale price', () => {
    expect(calculateMarginPercent(13800, 6900)).toBe(50);
  });
});
