import { describe, expect, it } from 'vitest';
import { FORM_MESSAGES, IMPORT_PRICING_MESSAGES } from '@/ui/messages';
import { EMPTY_IMPORT_PRICING_VALUES, evaluateImportPricing } from './importPricingInput';

const HU08 = {
  ...EMPTY_IMPORT_PRICING_VALUES,
  foreignAmount: '100',
  exchangeRate: '5,50',
  shipping: '80',
  taxes: '60',
  quantity: '10',
};

describe('evaluateImportPricing', () => {
  it('waits silently while the purchase is incomplete', () => {
    expect(evaluateImportPricing(EMPTY_IMPORT_PRICING_VALUES)).toMatchObject({
      errors: {},
      unitCostCents: null,
      marginPercent: null,
    });
  });

  it('computes the unit cost and the margin of the sale price (HU08)', () => {
    expect(evaluateImportPricing({ ...HU08, salePrice: '138' })).toEqual({
      errors: {},
      unitCostCents: 6900,
      totalCostCents: 69000,
      salePriceCents: 13800,
      marginPercent: 50,
      profitCents: 6900,
    });
  });

  it('treats empty shipping and taxes as zero', () => {
    expect(evaluateImportPricing({ ...HU08, shipping: '', taxes: ' ' }).unitCostCents).toBe(5500);
  });

  it('points out invalid fields', () => {
    const { errors, unitCostCents } = evaluateImportPricing({ ...HU08, exchangeRate: 'abc', quantity: '0' });
    expect(errors).toEqual({
      exchangeRate: IMPORT_PRICING_MESSAGES.invalidNumber,
      quantity: FORM_MESSAGES.invalidPositiveNumber,
    });
    expect(unitCostCents).toBeNull();
  });
});
