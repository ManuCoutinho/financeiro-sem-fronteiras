import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { StockAlert } from '@/domain/inventory';
import type { Product } from '@/domain/schemas';
import { INVENTORY_MESSAGES, STOCK_ALERT_LABELS } from '@/ui/messages';
import { InventoryPage } from './InventoryPage';

const buildProduct = (id: string, name: string): Product => ({
  id,
  name,
  salePriceCents: 1000,
  costCents: 500,
  quantity: 5,
  minStock: 1,
  expiresOn: null,
  isActive: true,
  sortOrder: 0,
});

const state = vi.hoisted(() => ({ products: [] as Product[], alerts: [] as StockAlert[] }));

vi.mock('@/hooks/useCatalog', () => ({
  useProducts: () => ({ data: state.products, isLoading: false, error: null }),
}));
vi.mock('@/hooks/useStockAlerts', () => ({
  useStockAlerts: () => ({ data: state.alerts, isLoading: false, error: null }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <InventoryPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  state.products = [buildProduct('glue', 'Cola'), buildProduct('serum', 'Sérum'), buildProduct('tint', 'Henna')];
  state.alerts = [];
});

afterEach(cleanup);

describe('InventoryPage', () => {
  it('lists products with alerts first, most severe on top (HU06)', () => {
    state.alerts = [
      { productId: 'tint', type: 'low' },
      { productId: 'serum', type: 'negative' },
    ];
    renderPage();

    expect(screen.getByText(INVENTORY_MESSAGES.needsAttention(2))).toBeTruthy();
    const names = screen.getAllByRole('link').map((link) => link.querySelector('.font-semibold')?.textContent);
    expect(names).toEqual(['Sérum', 'Henna', 'Cola']);
    expect(screen.getByText(STOCK_ALERT_LABELS.negative)).toBeTruthy();
    expect(screen.getByText(STOCK_ALERT_LABELS.low)).toBeTruthy();
  });

  it('says when everything is fine', () => {
    renderPage();
    expect(screen.getByText(INVENTORY_MESSAGES.allGood)).toBeTruthy();
  });

  it('invites to register products when there are none', () => {
    state.products = [];
    renderPage();
    expect(screen.getByText(INVENTORY_MESSAGES.noProducts)).toBeTruthy();
  });
});
