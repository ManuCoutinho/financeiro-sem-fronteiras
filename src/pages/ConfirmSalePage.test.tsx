import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildConfirmSalePath, PATHS } from '@/app/paths';
import type { Product, Service } from '@/domain/schemas';
import { MESSAGES, REJECTION_MESSAGES, SALE_MESSAGES, STOCK_ALERT_LABELS } from '@/ui/messages';
import { ConfirmSalePage } from './ConfirmSalePage';

const TODAY = '2026-11-18';

const state = vi.hoisted(() => ({
  services: [] as Service[],
  products: [] as Product[],
  isClosed: false,
}));

const transactions = vi.hoisted(() => ({
  registerSale: vi.fn<(sale: unknown, onError: (error: unknown) => void) => string>(() => 'new-id'),
  voidTransaction: vi.fn(),
  whenSavedOnDevice: vi.fn(() => Promise.resolve()),
}));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock('@/services/transactions', () => transactions);
vi.mock('sonner', () => ({ toast }));
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
  it('registers a service with one tap on the payment method and returns to the register', async () => {
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
    expect(await screen.findByText('tela do caixa')).toBeTruthy();
    expect(toast.success).toHaveBeenCalledWith(MESSAGES.saleRegistered, expect.anything());
  });

  it('says "registered" only once the sale is stored on the device', async () => {
    let finishSaving: () => void = () => undefined;
    transactions.whenSavedOnDevice.mockReturnValueOnce(new Promise<void>((resolve) => (finishSaving = resolve)));
    renderSale('design');
    fireEvent.click(screen.getByRole('button', { name: 'Pix' }));

    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.getByText(SALE_MESSAGES.saving)).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Pix' }) as HTMLButtonElement).disabled).toBe(true);

    await act(async () => finishSaving());
    expect(toast.success).toHaveBeenCalledWith(MESSAGES.saleRegistered, expect.anything());
    expect(screen.getByText('tela do caixa')).toBeTruthy();
  });

  it('stays on the sale and says so when it could not be stored', async () => {
    transactions.whenSavedOnDevice.mockRejectedValueOnce(new Error('timeout'));
    renderSale('design');
    fireEvent.click(screen.getByRole('button', { name: 'Pix' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(SALE_MESSAGES.notSavedOnDevice));
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.queryByText('tela do caixa')).toBeNull();
    expect((screen.getByRole('button', { name: 'Pix' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('tells plainly when the server turns the sale down', async () => {
    renderSale('design');
    fireEvent.click(screen.getByRole('button', { name: 'Pix' }));
    const onRejected = transactions.registerSale.mock.calls[0]?.[1] as (error: unknown) => void;

    onRejected({ code: 'permission-denied' });
    expect(toast.error).toHaveBeenCalledWith(SALE_MESSAGES.notRegistered, {
      description: REJECTION_MESSAGES.denied,
    });
    await screen.findByText('tela do caixa');
  });

  it('sells a service at its fixed price, with no discount field', () => {
    renderSale('design');
    expect(screen.queryByLabelText(SALE_MESSAGES.discountLabel)).toBeNull();
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

  it('applies a product discount with the money mask and blocks one above the total', () => {
    renderSale('serum');
    const discount = screen.getByLabelText(SALE_MESSAGES.discountLabel) as HTMLInputElement;

    fireEvent.change(discount, { target: { value: '5000' } });
    expect(discount.value).toBe('50,00');
    expect(screen.getByText(SALE_MESSAGES.discountTooHigh)).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Pix' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(discount, { target: { value: 'dez' } });
    expect(discount.value).toBe('');

    fireEvent.change(discount, { target: { value: '1000' } });
    expect(discount.value).toBe('10,00');
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
