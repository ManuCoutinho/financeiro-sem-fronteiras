import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Transaction } from '@/services/transactions';
import { UNDO_MESSAGES } from '@/ui/messages';
import { UndoDialog } from './UndoDialog';

const services = vi.hoisted(() => ({ voidTransaction: vi.fn(), reopenCashRegister: vi.fn() }));

vi.mock('@/services/transactions', () => ({ voidTransaction: services.voidTransaction }));
vi.mock('@/services/cashClosings', () => ({ reopenCashRegister: services.reopenCashRegister }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const sale: Transaction = {
  id: 't1',
  type: 'product',
  itemId: 'serum',
  description: 'Sérum',
  quantity: 2,
  grossCents: 8000,
  discountCents: 0,
  feeCents: 0,
  netCents: 8000,
  paymentMethod: 'pix',
  expenseCategory: null,
  day: '2026-11-18',
  isVoided: false,
  createdAt: null,
  hasPendingWrites: false,
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('UndoDialog', () => {
  it('voids the sale on an open day without reopening anything', () => {
    const onClose = vi.fn();
    render(<UndoDialog transaction={sale} isDayClosed={false} onClose={onClose} />);

    expect(screen.getByText(UNDO_MESSAGES.confirmSale)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: UNDO_MESSAGES.confirm }));

    expect(services.reopenCashRegister).not.toHaveBeenCalled();
    expect(services.voidTransaction).toHaveBeenCalledWith(sale, { isClosed: false }, expect.any(Function));
    expect(onClose).toHaveBeenCalled();
  });

  it('reopens a closed day before voiding (RN07)', () => {
    render(<UndoDialog transaction={sale} isDayClosed onClose={vi.fn()} />);

    expect(screen.getByText(UNDO_MESSAGES.closedDescription)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: UNDO_MESSAGES.reopenAndUndo }));

    expect(services.reopenCashRegister).toHaveBeenCalledWith('2026-11-18', expect.any(Function));
    expect(services.reopenCashRegister.mock.invocationCallOrder[0]).toBeLessThan(
      services.voidTransaction.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it('cancels without writing', () => {
    const onClose = vi.fn();
    render(<UndoDialog transaction={sale} isDayClosed={false} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: UNDO_MESSAGES.cancel }));
    expect(services.voidTransaction).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
