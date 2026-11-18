import { describe, expect, it } from 'vitest';
import { summarizeMonth, type MonthlyTransaction } from './monthlySummary';

const MONTH = '2026-11';

const buildTransaction = (overrides: Partial<MonthlyTransaction>): MonthlyTransaction => ({
  type: 'service',
  itemId: 'design',
  description: 'Design + henna',
  quantity: 1,
  paymentMethod: 'pix',
  isVoided: false,
  grossCents: 6000,
  discountCents: 0,
  feeCents: 0,
  netCents: 6000,
  day: '2026-11-10',
  ...overrides,
});

const summarize = (transactions: MonthlyTransaction[], products = [] as { quantity: number; costCents: number }[]) =>
  summarizeMonth({ month: MONTH, transactions, products, topItemsLimit: 2 });

describe('summarizeMonth', () => {
  it('computes revenue, expenses, result and average ticket without voided entries', () => {
    const summary = summarize([
      buildTransaction({}),
      buildTransaction({ grossCents: 4000, discountCents: 1000, netCents: 3000 }),
      buildTransaction({
        type: 'product',
        itemId: 'serum',
        description: 'Sérum',
        quantity: 2,
        paymentMethod: 'credit',
        grossCents: 8000,
        feeCents: 280,
        netCents: 7720,
      }),
      buildTransaction({ isVoided: true, grossCents: 9999, netCents: 9999 }),
      buildTransaction({ type: 'expense', itemId: '', grossCents: 1500, netCents: 1500 }),
    ]);

    expect(summary.salesCents).toBe(17000);
    expect(summary.servicesCents).toBe(9000);
    expect(summary.productsCents).toBe(8000);
    expect(summary.feesCents).toBe(280);
    expect(summary.netCents).toBe(16720);
    expect(summary.expensesCents).toBe(1500);
    expect(summary.resultCents).toBe(15220);
    expect(summary.saleCount).toBe(3);
    expect(summary.averageTicketCents).toBe(5667);
  });

  it('returns a zero average ticket for a month without sales', () => {
    expect(summarize([]).averageTicketCents).toBe(0);
  });

  it('ranks the best sellers by quantity, breaking ties by revenue', () => {
    const summary = summarize([
      buildTransaction({ itemId: 'design', quantity: 1 }),
      buildTransaction({ itemId: 'design', quantity: 1 }),
      buildTransaction({ type: 'product', itemId: 'serum', description: 'Sérum', quantity: 2, grossCents: 8000 }),
      buildTransaction({ itemId: 'lash', description: 'Cílios', quantity: 1, grossCents: 9000 }),
    ]);

    expect(summary.topItems).toEqual([
      { type: 'service', itemId: 'design', description: 'Design + henna', quantity: 2, revenueCents: 12000 },
      { type: 'product', itemId: 'serum', description: 'Sérum', quantity: 2, revenueCents: 8000 },
    ]);
  });

  it('keeps a service and a product with the same id apart', () => {
    const summary = summarize([
      buildTransaction({ itemId: 'same' }),
      buildTransaction({ type: 'product', itemId: 'same' }),
    ]);
    expect(summary.topItems).toHaveLength(2);
  });

  it('totals sales and expenses for every day of the month, including empty days', () => {
    const summary = summarize([
      buildTransaction({ day: '2026-11-01' }),
      buildTransaction({ day: '2026-11-01', type: 'expense', grossCents: 500 }),
      buildTransaction({ day: '2026-11-30', grossCents: 2000 }),
    ]);

    expect(summary.dailyTotals).toHaveLength(30);
    expect(summary.dailyTotals[0]).toEqual({ day: '2026-11-01', salesCents: 6000, expensesCents: 500 });
    expect(summary.dailyTotals[1]).toEqual({ day: '2026-11-02', salesCents: 0, expensesCents: 0 });
    expect(summary.dailyTotals[29]?.salesCents).toBe(2000);
  });

  it('values the stock at cost, ignoring negative quantities', () => {
    const summary = summarize(
      [],
      [
        { quantity: 3, costCents: 1000 },
        { quantity: -2, costCents: 500 },
      ],
    );
    expect(summary.stockValueCents).toBe(3000);
  });
});
