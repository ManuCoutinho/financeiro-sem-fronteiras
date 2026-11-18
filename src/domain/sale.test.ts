import { describe, expect, it } from 'vitest';
import { previewSale } from './sale';

describe('previewSale', () => {
  it('multiplies the unit price and subtracts the discount', () => {
    expect(previewSale({ unitPriceCents: 4000, quantity: 2, discountCents: 500, stockQuantity: null })).toEqual({
      grossCents: 8000,
      totalCents: 7500,
      isDiscountValid: true,
      remainingStock: null,
      needsStockCheck: false,
    });
  });

  it('rejects a discount above the gross amount', () => {
    const preview = previewSale({ unitPriceCents: 4000, quantity: 1, discountCents: 4001, stockQuantity: null });
    expect(preview.isDiscountValid).toBe(false);
    expect(preview.totalCents).toBe(0);
  });

  it('accepts a discount equal to the gross amount', () => {
    expect(
      previewSale({ unitPriceCents: 4000, quantity: 1, discountCents: 4000, stockQuantity: null }).isDiscountValid,
    ).toBe(true);
  });

  it('flags a product sale that would leave the stock negative (RN04)', () => {
    expect(previewSale({ unitPriceCents: 4000, quantity: 3, discountCents: 0, stockQuantity: 2 })).toMatchObject({
      remainingStock: -1,
      needsStockCheck: true,
    });
    expect(previewSale({ unitPriceCents: 4000, quantity: 2, discountCents: 0, stockQuantity: 2 })).toMatchObject({
      remainingStock: 0,
      needsStockCheck: false,
    });
  });
});
