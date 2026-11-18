import { describe, expect, it } from 'vitest';
import {
  businessSettingsSchema,
  newExpenseSchema,
  newSaleSchema,
  newStockMovementSchema,
  productSchema,
  serviceSchema,
} from './schemas';

const validSale = {
  type: 'product',
  itemId: 'serum',
  description: 'Sérum',
  quantity: 2,
  unitPriceCents: 4000,
  discountCents: 0,
  paymentMethod: 'credit',
  feePercent: 3.5,
  day: '2026-11-18',
};

describe('serviceSchema', () => {
  it('trims the name and rejects an empty one', () => {
    expect(serviceSchema.parse({ name: '  Design ', priceCents: 6000, isActive: true, sortOrder: 0 }).name).toBe(
      'Design',
    );
    expect(serviceSchema.safeParse({ name: '   ', priceCents: 6000, isActive: true, sortOrder: 0 }).success).toBe(
      false,
    );
  });

  it('rejects prices with fractions of a cent', () => {
    expect(serviceSchema.safeParse({ name: 'Design', priceCents: 60.5, isActive: true, sortOrder: 0 }).success).toBe(
      false,
    );
  });
});

describe('productSchema', () => {
  const product = {
    name: 'Sérum',
    salePriceCents: 4000,
    costCents: 1500,
    quantity: -1,
    minStock: 2,
    expiresOn: null,
    isActive: true,
    sortOrder: 0,
  };

  it('accepts negative stock, which offline sales can cause', () => {
    expect(productSchema.safeParse(product).success).toBe(true);
  });

  it('expects the expiration as a business day', () => {
    expect(productSchema.safeParse({ ...product, expiresOn: '2027-01-31' }).success).toBe(true);
    expect(productSchema.safeParse({ ...product, expiresOn: '31/01/2027' }).success).toBe(false);
  });
});

describe('businessSettingsSchema', () => {
  it('requires a fee for every payment method', () => {
    const settings = {
      name: 'Studio',
      feePercentByMethod: { pix: 0, cash: 0, debit: 1.5 },
      expirationAlertDays: 30,
    };
    expect(businessSettingsSchema.safeParse(settings).success).toBe(false);
    expect(
      businessSettingsSchema.safeParse({
        ...settings,
        feePercentByMethod: { ...settings.feePercentByMethod, credit: 3 },
      }).success,
    ).toBe(true);
  });
});

describe('newSaleSchema', () => {
  it('accepts a valid sale', () => {
    expect(newSaleSchema.safeParse(validSale).success).toBe(true);
  });

  it('rejects expenses, zero quantities and discounts above the total', () => {
    expect(newSaleSchema.safeParse({ ...validSale, type: 'expense' }).success).toBe(false);
    expect(newSaleSchema.safeParse({ ...validSale, quantity: 0 }).success).toBe(false);
    expect(newSaleSchema.safeParse({ ...validSale, discountCents: 8001 }).success).toBe(false);
    expect(newSaleSchema.safeParse({ ...validSale, discountCents: 8000 }).success).toBe(true);
  });
});

describe('newExpenseSchema', () => {
  it('requires a known category and a positive amount', () => {
    const expense = {
      category: 'supplies',
      description: '',
      amountCents: 1500,
      paymentMethod: 'cash',
      day: '2026-11-18',
    };
    expect(newExpenseSchema.safeParse(expense).success).toBe(true);
    expect(newExpenseSchema.safeParse({ ...expense, category: 'party' }).success).toBe(false);
    expect(newExpenseSchema.safeParse({ ...expense, amountCents: 0 }).success).toBe(false);
  });
});

describe('newStockMovementSchema', () => {
  const movement = { productId: 'serum', type: 'restock', quantity: 5, reason: '', day: '2026-11-18' };

  it('rejects a zero quantity', () => {
    expect(newStockMovementSchema.safeParse({ ...movement, quantity: 0 }).success).toBe(false);
  });

  it('requires a reason for adjustments only', () => {
    expect(newStockMovementSchema.safeParse(movement).success).toBe(true);
    expect(newStockMovementSchema.safeParse({ ...movement, type: 'adjustment', quantity: -1 }).success).toBe(false);
    expect(
      newStockMovementSchema.safeParse({ ...movement, type: 'adjustment', quantity: -1, reason: 'Quebrou' }).success,
    ).toBe(true);
  });
});
