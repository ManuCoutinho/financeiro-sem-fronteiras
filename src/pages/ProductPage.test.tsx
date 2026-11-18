import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PATHS } from '@/app/paths';
import type { Product } from '@/domain/schemas';
import type { StockMovement } from '@/services/stock';
import { PRODUCT_MESSAGES, STOCK_ALERT_LABELS, STOCK_MOVEMENT_LABELS } from '@/ui/messages';
import { ProductPage } from './ProductPage';

const TODAY = '2026-11-18';

const serum: Product = {
  id: 'serum',
  name: 'Sérum',
  salePriceCents: 8990,
  costCents: 3500,
  quantity: 2,
  minStock: 2,
  expiresOn: null,
  isActive: true,
  sortOrder: 0,
};

const state = vi.hoisted(() => ({ movements: [] as StockMovement[] }));
const stock = vi.hoisted(() => ({ registerStockMovement: vi.fn() }));

vi.mock('@/services/stock', () => stock);
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/hooks/useToday', () => ({ useToday: () => TODAY }));
vi.mock('@/hooks/useCatalog', () => ({
  useProducts: () => ({ data: [serum], isLoading: false, error: null }),
}));
vi.mock('@/hooks/useStockAlerts', () => ({
  useStockAlerts: () => ({ data: [{ productId: 'serum', type: 'low' }], isLoading: false, error: null }),
}));
vi.mock('@/hooks/useProductMovements', () => ({
  useProductMovements: () => ({ data: state.movements, isLoading: false, error: null }),
}));

function renderPage(productId = 'serum') {
  return render(
    <MemoryRouter initialEntries={[`/inventory/${productId}`]}>
      <Routes>
        <Route path={PATHS.product} element={<ProductPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

const save = () => fireEvent.click(screen.getByRole('button', { name: PRODUCT_MESSAGES.save }));

beforeEach(() => {
  vi.clearAllMocks();
  state.movements = [
    {
      id: 'm1',
      productId: 'serum',
      type: 'sale',
      quantity: -1,
      reason: null,
      transactionId: 't1',
      day: TODAY,
      createdAt: null,
      hasPendingWrites: false,
    },
  ];
});

afterEach(cleanup);

describe('ProductPage', () => {
  it('shows the quantity, alerts and history', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Sérum' })).toBeTruthy();
    expect(screen.getByText(STOCK_ALERT_LABELS.low)).toBeTruthy();
    expect(screen.getByText(STOCK_MOVEMENT_LABELS.sale)).toBeTruthy();
    expect(screen.getByText('−1')).toBeTruthy();
  });

  it('registers a restock (HU05)', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: STOCK_MOVEMENT_LABELS.restock }));
    fireEvent.change(screen.getByLabelText(PRODUCT_MESSAGES.quantityLabel), { target: { value: '10' } });
    save();

    await waitFor(() =>
      expect(stock.registerStockMovement).toHaveBeenCalledWith(
        { productId: 'serum', type: 'restock', quantity: 10, reason: '', day: TODAY },
        expect.any(Function),
      ),
    );
  });

  it('records an adjustment as the difference from the counted quantity', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: STOCK_MOVEMENT_LABELS.adjustment }));
    fireEvent.change(screen.getByLabelText(PRODUCT_MESSAGES.countedLabel), { target: { value: '1' } });
    save();
    expect(await screen.findByText(PRODUCT_MESSAGES.reasonRequired)).toBeTruthy();

    fireEvent.change(screen.getByLabelText(PRODUCT_MESSAGES.reasonLabel), { target: { value: 'Avaria' } });
    save();
    await waitFor(() =>
      expect(stock.registerStockMovement).toHaveBeenCalledWith(
        { productId: 'serum', type: 'adjustment', quantity: -1, reason: 'Avaria', day: TODAY },
        expect.any(Function),
      ),
    );
  });

  it('tells when the product does not exist', () => {
    renderPage('missing');
    expect(screen.getByText(PRODUCT_MESSAGES.notFound)).toBeTruthy();
  });
});
