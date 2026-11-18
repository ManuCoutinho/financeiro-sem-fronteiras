import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NewExpense, NewSale } from '@/domain/schemas';
import { COLLECTIONS } from './collections';
import { registerExpense, registerSale, voidTransaction } from './transactions';

const batch = vi.hoisted(() => ({
  set: vi.fn(),
  update: vi.fn(),
  commit: vi.fn(() => Promise.resolve()),
}));

vi.mock('./firestore', () => ({ db: {} }));

vi.mock('firebase/firestore', () => ({
  collection: (_db: unknown, name: string) => ({ name }),
  doc: (parent: { name?: string }, name?: string, id?: string) =>
    id ? { path: `${name}/${id}`, id } : { path: `${parent.name}/new-id`, id: 'new-id' },
  increment: (value: number) => ({ increment: value }),
  serverTimestamp: () => 'server-timestamp',
  writeBatch: () => batch,
}));

const onError = vi.fn();

const sale: NewSale = {
  type: 'product',
  itemId: 'serum',
  description: 'Sérum',
  quantity: 2,
  unitPriceCents: 4000,
  discountCents: 1000,
  paymentMethod: 'credit',
  feePercent: 3.5,
  day: '2026-11-18',
};

const writtenPaths = (calls: unknown[][]) => calls.map(([ref]) => (ref as { path: string }).path);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('registerSale', () => {
  it('writes the sale, the stock decrease and the movement in one batch', () => {
    const transactionId = registerSale(sale, onError);

    expect(transactionId).toBe('new-id');
    expect(batch.commit).toHaveBeenCalledOnce();
    expect(batch.set.mock.calls[0]?.[1]).toMatchObject({
      grossCents: 8000,
      discountCents: 1000,
      feeCents: 245,
      netCents: 6755,
      isVoided: false,
      expenseCategory: null,
    });
    expect(batch.update).toHaveBeenCalledWith(
      { path: `${COLLECTIONS.products}/serum`, id: 'serum' },
      {
        quantity: { increment: -2 },
      },
    );
    expect(batch.set.mock.calls[1]?.[1]).toMatchObject({
      productId: 'serum',
      type: 'sale',
      quantity: -2,
      transactionId: 'new-id',
    });
  });

  it('does not touch the stock for a service', () => {
    registerSale({ ...sale, type: 'service', itemId: 'design' }, onError);
    expect(batch.update).not.toHaveBeenCalled();
    expect(writtenPaths(batch.set.mock.calls)).toEqual([`${COLLECTIONS.transactions}/new-id`]);
  });

  it('refuses an invalid sale before writing anything', () => {
    expect(() => registerSale({ ...sale, discountCents: 9000 }, onError)).toThrow();
    expect(batch.commit).not.toHaveBeenCalled();
  });

  it('reports a failed commit through onError', async () => {
    const failure = new Error('offline rejected');
    batch.commit.mockReturnValueOnce(Promise.reject(failure));
    registerSale(sale, onError);
    await vi.waitFor(() => expect(onError).toHaveBeenCalledWith(failure));
  });
});

describe('registerExpense', () => {
  it('stores the expense with its category and no fee', () => {
    const expense: NewExpense = {
      category: 'supplies',
      description: 'Luvas',
      amountCents: 1500,
      paymentMethod: 'cash',
      day: '2026-11-18',
    };
    registerExpense(expense, onError);

    expect(batch.set.mock.calls[0]?.[1]).toMatchObject({
      type: 'expense',
      expenseCategory: 'supplies',
      grossCents: 1500,
      feeCents: 0,
      netCents: 1500,
    });
  });
});

describe('voidTransaction', () => {
  const transaction = { id: 't1', type: 'product' as const, itemId: 'serum', quantity: 2, day: '2026-11-18' };

  it('marks the sale as voided and returns the units to the stock', () => {
    expect(voidTransaction(transaction, null, onError)).toBe('voided');
    expect(batch.update).toHaveBeenCalledWith(
      { path: `${COLLECTIONS.transactions}/t1`, id: 't1' },
      { isVoided: true, voidedAt: 'server-timestamp' },
    );
    expect(batch.update).toHaveBeenCalledWith(
      { path: `${COLLECTIONS.products}/serum`, id: 'serum' },
      {
        quantity: { increment: 2 },
      },
    );
    expect(batch.set.mock.calls[0]?.[1]).toMatchObject({ type: 'reversal', quantity: 2, transactionId: 't1' });
  });

  it('refuses to void on a closed day', () => {
    expect(voidTransaction(transaction, { isClosed: true }, onError)).toBe('dayClosed');
    expect(batch.commit).not.toHaveBeenCalled();
  });

  it('voids again once the day is reopened', () => {
    expect(voidTransaction(transaction, { isClosed: false }, onError)).toBe('voided');
  });
});
