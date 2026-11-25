import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '@/domain/schemas';
import { IMPORT_PRICING_MESSAGES } from '@/ui/messages';
import { ImportPricingPage } from './ImportPricingPage';

const serum: Product = {
  id: 'serum',
  name: 'Sérum',
  salePriceCents: 13800,
  costCents: 5000,
  quantity: 4,
  minStock: 2,
  expiresOn: null,
  isActive: true,
  sortOrder: 0,
};

const catalog = vi.hoisted(() => ({ updateProductDetails: vi.fn() }));

vi.mock('@/services/catalog', () => catalog);
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/hooks/useCatalog', () => ({
  useProducts: () => ({ data: [serum], isLoading: false, error: null }),
}));

const normalize = (text: string) => text.replace(/\s/g, ' ');
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

function renderPage() {
  return render(
    <MemoryRouter>
      <ImportPricingPage />
    </MemoryRouter>,
  );
}

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe('ImportPricingPage', () => {
  it('shows the real unit cost, the margin of the current price and saves the cost (HU08)', () => {
    renderPage();
    expect(screen.getByText(IMPORT_PRICING_MESSAGES.fillPurchase)).toBeTruthy();

    type(IMPORT_PRICING_MESSAGES.foreignAmountLabel, '100');
    type(IMPORT_PRICING_MESSAGES.exchangeRateLabel, '5,50');
    type(IMPORT_PRICING_MESSAGES.shippingLabel, '8000');
    type(IMPORT_PRICING_MESSAGES.taxesLabel, '6000');
    type(IMPORT_PRICING_MESSAGES.quantityLabel, '10');
    expect(screen.getByText('R$ 69,00', { normalizer: normalize })).toBeTruthy();

    fireEvent.change(screen.getByLabelText(IMPORT_PRICING_MESSAGES.productLabel), { target: { value: 'serum' } });
    expect((screen.getByLabelText(IMPORT_PRICING_MESSAGES.salePriceLabel) as HTMLInputElement).value).toBe('138,00');
    expect(screen.getByText('50%')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: IMPORT_PRICING_MESSAGES.saveCost }));
    expect(catalog.updateProductDetails).toHaveBeenCalledWith(
      'serum',
      {
        name: 'Sérum',
        salePriceCents: 13800,
        costCents: 6900,
        minStock: 2,
        expiresOn: null,
        isActive: true,
        sortOrder: 0,
      },
      expect.any(Function),
    );
  });

  it('flags a price below cost', () => {
    renderPage();
    type(IMPORT_PRICING_MESSAGES.foreignAmountLabel, '100');
    type(IMPORT_PRICING_MESSAGES.exchangeRateLabel, '5,50');
    type(IMPORT_PRICING_MESSAGES.quantityLabel, '10');
    type(IMPORT_PRICING_MESSAGES.salePriceLabel, '5000');
    expect(screen.getByText('-10%').className).toContain('text-expense');
  });
});
