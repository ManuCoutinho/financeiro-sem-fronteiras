import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildConfirmSalePath, PATHS } from '@/app/paths';
import type { Product, Service } from '@/domain/schemas';
import { FORM_MESSAGES, SALE_MESSAGES, STOCK_ALERT_LABELS } from '@/ui/messages';
import { ConfirmSalePage } from './ConfirmSalePage';

const TODAY = '2026-11-18';

const state = vi.hoisted(() => ({
  services: [] as Service[],
  products: [] as Product[],
  isClosed: false,
}));

const transactions = vi.hoisted(() => ({ registerSale: vi.fn(() => 'new-id'), voidTransaction: vi.fn() }));

vi.mock('@/services/transactions', () => transactions);
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/hooks/useToday', () => ({ useToday: () => TODAY }));
vi.mock('@/hooks/useCashClosing', () => ({
  useCashClosing: () => ({ data: null, isLoading: false, error: null, isClosed: state.isClosed }),
}));
vi.mock('@/hooks/useCatalog', () => ({
  useServices: () => ({ data: state.services, isLoading: false, error: null }),
  useProducts: () => ({ data: state.products, isLoading: false, error: null }),
  useBusinessSettings: () => ({
    data: {
      name: 'Studio',
      feePercentByMethod: { pix: 0, cash: 0, debit: 1.99, credit: 3.5 },
      expirationAlertDays: 30,
    },
    isLoading: false,
    error: null,
  }),
}));

const design: Service = { id: 'design', name: 'Design + henna', priceCents: 6000, isActive: true, sortOrder: 0 };
const serum: Product = {
  id: 'serum',
  name: 'Sérum',
  salePriceCents: 4000,
  costCents: 1500,
  quantity: 1,
  minStock: 0,
  expiresOn: null,
  isActive: true,
  sortOrder: 0,
};

function renderSale(itemId: string) {
  return render(
    <MemoryRouter initialEntries={[buildConfirmSalePath(itemId)]}>
      <Routes>
        <Route path={PATHS.confirmSale} element={<ConfirmSalePage />} />
        <Route path={PATHS.cashRegister} element={<p>tela do caixa</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  state.services = [design];
  state.products = [serum];
  state.isClosed = false;
});

afterEach(cleanup);

describe('ConfirmSalePage', () => {
  it('registers a service with one tap on the payment method and returns to the register', () => {
    renderSale('design');
    fireEvent.click(screen.getByRole('button', { name: 'Pix' }));

    expect(transactions.registerSale).toHaveBeenCalledWith(
      {
        type: 'service',
        itemId: 'design',
        description: 'Design + henna',
        quantity: 1,
        unitPriceCents: 6000,
        discountCents: 0,
        paymentMethod: 'pix',
        feePercent: 0,
        day: TODAY,
      },
      expect.any(Function),
    );
    expect(screen.getByText('tela do caixa')).toBeTruthy();
  });

  it('warns when a product sale leaves the stock negative, but still sells (RN04)', () => {
    renderSale('serum');
    expect(screen.queryByText(STOCK_ALERT_LABELS.negative)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: SALE_MESSAGES.increaseQuantity }));
    expect(screen.getByText(STOCK_ALERT_LABELS.negative)).toBeTruthy();
    expect(screen.getByText(SALE_MESSAGES.stockCheck(-1))).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Crédito/ }));
    expect(transactions.registerSale).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'product', quantity: 2, paymentMethod: 'credit', feePercent: 3.5 }),
      expect.any(Function),
    );
  });

  it('applies a discount and blocks one above the total', () => {
    renderSale('design');
    const discount = screen.getByLabelText(SALE_MESSAGES.discountLabel);

    fireEvent.change(discount, { target: { value: '70' } });
    expect(screen.getByText(SALE_MESSAGES.discountTooHigh)).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Pix' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(discount, { target: { value: 'dez' } });
    expect(screen.getByText(FORM_MESSAGES.invalidAmount)).toBeTruthy();

    fireEvent.change(discount, { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pix' }));
    expect(transactions.registerSale).toHaveBeenCalledWith(
      expect.objectContaining({ discountCents: 1000 }),
      expect.any(Function),
    );
  });

  it('does not sell on a closed day', () => {
    state.isClosed = true;
    renderSale('design');
    expect(screen.getByText(SALE_MESSAGES.dayClosed)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Pix' })).toBeNull();
  });

  it('explains when the item no longer exists or is hidden', () => {
    state.services = [{ ...design, isActive: false }];
    renderSale('design');
    expect(screen.getByText(SALE_MESSAGES.itemNotFound)).toBeTruthy();
  });
});
