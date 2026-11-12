import { describe, expect, it } from 'vitest';
import { summarizeCashRegister, type Transaction } from './cashRegister';

const buildTransaction = (overrides: Partial<Transaction>): Transaction => ({
  type: 'service',
  paymentMethod: 'pix',
  isVoided: false,
  grossCents: 0,
  discountCents: 0,
  feeCents: 0,
  netCents: 0,
  ...overrides,
});

describe('summarizeCashRegister', () => {
  it('totals by payment method, skips voided entries and computes expected cash', () => {
    const summary = summarizeCashRegister(
      [
        buildTransaction({ grossCents: 6000, netCents: 6000 }),
        buildTransaction({ type: 'product', paymentMethod: 'credit', grossCents: 8000, feeCents: 280, netCents: 7720 }),
        buildTransaction({ paymentMethod: 'cash', grossCents: 4000, netCents: 4000 }),
        buildTransaction({ grossCents: 5000, netCents: 5000, isVoided: true }),
        buildTransaction({ type: 'expense', paymentMethod: 'cash', grossCents: 1500, netCents: 1500 }),
      ],
      5000,
    );

    expect(summary.totalsByMethod).toEqual({ pix: 6000, cash: 4000, debit: 0, credit: 8000 });
    expect(summary.salesCents).toBe(18000);
    expect(summary.feesCents).toBe(280);
    expect(summary.netCents).toBe(17720);
    expect(summary.servicesCents).toBe(10000);
    expect(summary.productsCents).toBe(8000);
    expect(summary.expensesCents).toBe(1500);
    expect(summary.expectedCashCents).toBe(7500);
  });

  it('subtracts discounts from received amounts', () => {
    const summary = summarizeCashRegister([
      buildTransaction({ grossCents: 6000, discountCents: 1000, netCents: 5000 }),
    ]);
    expect(summary.salesCents).toBe(5000);
    expect(summary.totalsByMethod.pix).toBe(5000);
  });

  it('returns zeroed totals for an empty day', () => {
    const summary = summarizeCashRegister([], 2000);
    expect(summary.salesCents).toBe(0);
    expect(summary.expectedCashCents).toBe(2000);
  });
});
