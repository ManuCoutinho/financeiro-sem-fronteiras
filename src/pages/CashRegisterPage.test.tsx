import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildConfirmSalePath, PATHS } from '@/app/paths';
import type { Product, Service } from '@/domain/schemas';
import type { Transaction } from '@/services/transactions';
import { CASH_REGISTER_MESSAGES, MESSAGES } from '@/ui/messages';
import { CashRegisterPage } from './CashRegisterPage';

const TODAY = '2026-11-25';

type Query<T> = { data: T; isLoading: boolean; error: string | null };
const ready = <T,>(data: T): Query<T> => ({ data, isLoading: false, error: null });

const state = vi.hoisted(() => ({
  services: null as unknown as Query<Service[]>,
  products: null as unknown as Query<Product[]>,
  transactions: null as unknown as Query<Transaction[]>,
  isClosed: false,
}));

vi.mock('@/hooks/useToday', () => ({ useToday: () => TODAY }));
vi.mock('@/hooks/useCatalog', () => ({
  useServices: () => state.services,
  useProducts: () => state.products,
}));
vi.mock('@/hooks/useTransactions', () => ({ useDailyTransactions: () => state.transactions }));
vi.mock('@/hooks/useCashClosing', () => ({
  useCashClosing: () => ({ data: null, isLoading: false, error: null, isClosed: state.isClosed }),
}));

const design: Service = { id: 'design', name: 'Design', priceCents: 5000, isActive: true, sortOrder: 0 };
const product = (id: string, name: string, quantity: number): Product => ({
  id,
  name,
  salePriceCents: 30000,
  costCents: 10000,
  quantity,
  minStock: 1,
  expiresOn: null,
  isActive: true,
  sortOrder: 0,
});
const sale: Transaction = {
  id: 'sale',
  type: 'service',
  itemId: 'design',
  description: 'Design',
  quantity: 1,
  grossCents: 5000,
  discountCents: 0,
  feeCents: 0,
  netCents: 5000,
  paymentMethod: 'pix',
  expenseCategory: null,
  day: TODAY,
  isVoided: false,
  createdAt: new Date(2026, 10, 25, 10, 0),
  hasPendingWrites: false,
};

const normalize = (text: string) => text.replace(/\s/g, ' ');

function renderPage() {
  return render(
    <MemoryRouter>
      <CashRegisterPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  state.services = ready([design]);
  state.products = ready([product('perfume', 'Perfume Lattafa', 2), product('cilios', 'Cola de cílios', 0)]);
  state.transactions = ready([]);
  state.isClosed = false;
});

afterEach(cleanup);

describe('CashRegisterPage', () => {
  it('names the sale area as an action and has no separate expense button', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: CASH_REGISTER_MESSAGES.quickSaleTitle })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /Gastei|Novo gasto/ })).toBeNull();
    expect(screen.getByRole('link', { name: CASH_REGISTER_MESSAGES.closeRegister }).getAttribute('href')).toBe(
      PATHS.closing,
    );
  });

  it('shows a registered sale in the day list and in the totals', () => {
    state.transactions = ready([sale]);
    renderPage();
    expect(screen.queryByText(CASH_REGISTER_MESSAGES.noTransactions)).toBeNull();
    expect(screen.getAllByText('R$ 50,00', { normalizer: normalize }).length).toBeGreaterThan(0);
  });

  it('never shows "no entries" or R$ 0,00 next to a read error', () => {
    state.transactions = { data: [], isLoading: false, error: MESSAGES.unexpectedError };
    renderPage();
    expect(screen.getByText(MESSAGES.unexpectedError)).toBeTruthy();
    expect(screen.getByRole('button', { name: MESSAGES.retry })).toBeTruthy();
    expect(screen.queryByText(CASH_REGISTER_MESSAGES.noTransactions)).toBeNull();
    expect(screen.queryByText('R$ 0,00', { normalizer: normalize })).toBeNull();
  });

  it('does not ask to register items when the catalog could not be read', () => {
    state.services = { data: [], isLoading: false, error: MESSAGES.unexpectedError };
    state.products = ready([]);
    renderPage();
    expect(screen.queryByText(CASH_REGISTER_MESSAGES.noItems)).toBeNull();
  });

  it('sells products from a searchable stock list', () => {
    renderPage();
    expect(screen.queryByText('Perfume Lattafa')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: CASH_REGISTER_MESSAGES.pickProduct }));
    const picker = screen.getByRole('dialog', { name: CASH_REGISTER_MESSAGES.productPickerTitle });
    fireEvent.change(within(picker).getByLabelText(CASH_REGISTER_MESSAGES.searchProductLabel), {
      target: { value: 'CILIOS' },
    });

    expect(within(picker).queryByText('Perfume Lattafa')).toBeNull();
    const link = within(picker).getByRole('link', { name: /Cola de cílios/ });
    expect(link.getAttribute('href')).toBe(buildConfirmSalePath('cilios'));

    fireEvent.change(within(picker).getByLabelText(CASH_REGISTER_MESSAGES.searchProductLabel), {
      target: { value: 'xyz' },
    });
    expect(within(picker).getByText(CASH_REGISTER_MESSAGES.noProductMatch)).toBeTruthy();
  });

  it('blocks new sales once the day is closed', () => {
    state.isClosed = true;
    renderPage();
    expect(
      (screen.getByRole('button', { name: CASH_REGISTER_MESSAGES.pickProduct }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});
