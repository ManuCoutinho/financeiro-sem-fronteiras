import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PATHS } from '@/app/paths';
import type { CashClosing } from '@/services/cashClosings';
import type { Transaction } from '@/services/transactions';
import { CLOSING_MESSAGES } from '@/ui/messages';
import { CloseCashRegisterPage } from './CloseCashRegisterPage';

const TODAY = '2026-11-18';

const state = vi.hoisted(() => ({ transactions: [] as Transaction[], closing: null as CashClosing | null }));
const services = vi.hoisted(() => ({ closeCashRegister: vi.fn(), reopenCashRegister: vi.fn() }));

vi.mock('@/services/cashClosings', () => services);
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/hooks/useToday', () => ({ useToday: () => TODAY }));
vi.mock('@/hooks/useTransactions', () => ({
  useDailyTransactions: () => ({ data: state.transactions, isLoading: false, error: null, hasPendingWrites: false }),
}));
vi.mock('@/hooks/useCashClosing', () => ({
  useCashClosing: () => ({
    data: state.closing,
    isLoading: false,
    error: null,
    isClosed: state.closing?.isClosed === true,
  }),
}));

const buildTransaction = (overrides: Partial<Transaction>): Transaction => ({
  id: 't',
  type: 'service',
  itemId: 'design',
  description: 'Design',
  quantity: 1,
  grossCents: 6000,
  discountCents: 0,
  feeCents: 0,
  netCents: 6000,
  paymentMethod: 'cash',
  expenseCategory: null,
  day: TODAY,
  isVoided: false,
  createdAt: null,
  hasPendingWrites: false,
  ...overrides,
});

const normalize = (text: string | null) => text?.replace(/\s/g, ' ');

function renderPage() {
  return render(
    <MemoryRouter>
      <CloseCashRegisterPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  state.transactions = [
    buildTransaction({ id: 'cash-sale' }),
    buildTransaction({ id: 'card-sale', paymentMethod: 'credit', feeCents: 210, netCents: 5790 }),
    buildTransaction({ id: 'expense', type: 'expense', grossCents: 1500, netCents: 1500 }),
  ];
  state.closing = null;
});

afterEach(cleanup);

describe('CloseCashRegisterPage', () => {
  it('computes the expected cash, shows the difference and saves the closing', () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(CLOSING_MESSAGES.openingCashLabel), { target: { value: '5000' } });

    expect(normalize(screen.getByText(CLOSING_MESSAGES.expectedCashLabel).nextSibling?.textContent ?? null)).toBe(
      'R$ 95,00',
    );
    expect((screen.getByRole('button', { name: CLOSING_MESSAGES.confirm }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(CLOSING_MESSAGES.countedCashLabel), { target: { value: '9000' } });
    expect(
      screen.getByText(CLOSING_MESSAGES.differenceShort('R$ 5,00'), { normalizer: (text) => normalize(text) ?? '' }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: CLOSING_MESSAGES.confirm }));
    expect(services.closeCashRegister).toHaveBeenCalledWith(
      { day: TODAY, transactions: state.transactions, count: { openingCashCents: 5000, countedCashCents: 9000 } },
      expect.any(Function),
    );
  });

  it('lists the day expenses as an optional step and links to add one', () => {
    renderPage();
    expect(screen.getByText(CLOSING_MESSAGES.expensesTitle)).toBeTruthy();
    expect(screen.getByText(CLOSING_MESSAGES.expensesHint)).toBeTruthy();
    expect(screen.getByRole('link', { name: CLOSING_MESSAGES.addExpense }).getAttribute('href')).toBe(PATHS.newExpense);
  });

  it('says there are no expenses yet when none were added', () => {
    state.transactions = [buildTransaction({ id: 'cash-sale' })];
    renderPage();
    expect(screen.getByText(CLOSING_MESSAGES.noExpenses)).toBeTruthy();
  });

  it('shows the saved closing and lets the day be reopened', () => {
    state.closing = {
      totalsByMethod: { pix: 0, cash: 6000, debit: 0, credit: 6000 },
      salesCents: 12000,
      feesCents: 210,
      netCents: 11790,
      servicesCents: 12000,
      productsCents: 0,
      expensesCents: 1500,
      openingCashCents: 5000,
      expectedCashCents: 9500,
      countedCashCents: 9500,
      differenceCents: 0,
      isClosed: true,
      reopeningCount: 1,
      closedAt: new Date(2026, 10, 18, 19, 30),
    };
    renderPage();

    expect(screen.getByText(CLOSING_MESSAGES.closedAt('19:30'))).toBeTruthy();
    expect(screen.getByText(CLOSING_MESSAGES.differenceBalanced)).toBeTruthy();
    expect(screen.queryByLabelText(CLOSING_MESSAGES.countedCashLabel)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: CLOSING_MESSAGES.reopen }));
    expect(services.reopenCashRegister).toHaveBeenCalledWith(TODAY, expect.any(Function));
  });
});
