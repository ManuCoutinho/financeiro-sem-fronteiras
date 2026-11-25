import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '@/domain/schemas';
import { FORM_MESSAGES, SETTINGS_MESSAGES } from '@/ui/messages';
import { ProductSheet } from './ProductSheet';
import { ServiceSheet } from './ServiceSheet';

const catalog = vi.hoisted(() => ({
  saveService: vi.fn(() => 'new-id'),
  createProduct: vi.fn(() => 'new-id'),
  updateProductDetails: vi.fn(),
}));

vi.mock('@/services/catalog', () => catalog);
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const save = () => fireEvent.click(screen.getByRole('button', { name: SETTINGS_MESSAGES.save }));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe('ServiceSheet', () => {
  it('creates a service with the price in cents at the end of the list', async () => {
    const onClose = vi.fn();
    render(<ServiceSheet service={null} nextSortOrder={3} onClose={onClose} />);

    type(SETTINGS_MESSAGES.nameLabel, 'Design + henna');
    type(SETTINGS_MESSAGES.priceLabel, '59,90');
    save();

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(catalog.saveService).toHaveBeenCalledWith(
      { name: 'Design + henna', priceCents: 5990, isActive: true, sortOrder: 3 },
      expect.any(Function),
      undefined,
    );
  });

  it('shows the error next to the field and saves nothing', async () => {
    render(<ServiceSheet service={null} nextSortOrder={0} onClose={vi.fn()} />);

    type(SETTINGS_MESSAGES.nameLabel, 'Design');
    type(SETTINGS_MESSAGES.priceLabel, 'sessenta');
    save();

    expect(await screen.findByText(FORM_MESSAGES.invalidAmount)).toBeTruthy();
    expect(screen.getByLabelText(SETTINGS_MESSAGES.priceLabel).getAttribute('aria-invalid')).toBe('true');
    expect(catalog.saveService).not.toHaveBeenCalled();
  });
});

describe('ProductSheet', () => {
  const product: Product = {
    id: 'serum',
    name: 'Sérum',
    salePriceCents: 4000,
    costCents: 1500,
    quantity: 7,
    minStock: 2,
    expiresOn: '2027-01-31',
    isActive: true,
    sortOrder: 1,
  };

  it('creates a product with its starting stock', async () => {
    const onClose = vi.fn();
    render(<ProductSheet product={null} nextSortOrder={0} onClose={onClose} />);

    type(SETTINGS_MESSAGES.nameLabel, 'Sérum');
    type(SETTINGS_MESSAGES.salePriceLabel, '4000');
    type(SETTINGS_MESSAGES.costLabel, '1500');
    type(SETTINGS_MESSAGES.quantityLabel, '5');
    save();

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(catalog.createProduct).toHaveBeenCalledWith(
      {
        name: 'Sérum',
        salePriceCents: 4000,
        costCents: 1500,
        quantity: 5,
        minStock: 0,
        expiresOn: null,
        isActive: true,
        sortOrder: 0,
      },
      expect.any(Function),
    );
  });

  it('edits details without touching the stock quantity', async () => {
    const onClose = vi.fn();
    render(<ProductSheet product={product} nextSortOrder={9} onClose={onClose} />);

    expect(screen.queryByLabelText(SETTINGS_MESSAGES.quantityLabel)).toBeNull();
    expect(screen.getByText(SETTINGS_MESSAGES.currentStock(7))).toBeTruthy();

    type(SETTINGS_MESSAGES.salePriceLabel, '4500');
    fireEvent.click(screen.getByLabelText(SETTINGS_MESSAGES.isActiveLabel));
    save();

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(catalog.updateProductDetails).toHaveBeenCalledWith(
      'serum',
      {
        name: 'Sérum',
        salePriceCents: 4500,
        costCents: 1500,
        minStock: 2,
        expiresOn: '2027-01-31',
        isActive: false,
        sortOrder: 1,
      },
      expect.any(Function),
    );
    expect(catalog.createProduct).not.toHaveBeenCalled();
  });
});
