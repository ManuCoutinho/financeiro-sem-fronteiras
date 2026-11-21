import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Transaction } from '@/services/transactions';
import { MONTH_MESSAGES } from '@/ui/messages';
import { MonthlySummaryPage } from './MonthlySummaryPage';

const TODAY = '2026-11-18';

const state = vi.hoisted(() => ({ transactions: [] as Transaction[], requestedMonths: [] as string[] }));
const download = vi.hoisted(() => ({ canShareFiles: vi.fn(() => false), shareOrDownloadTextFile: vi.fn() }));

vi.mock('@/lib/download', () => download);
vi.mock('@/hooks/useToday', () => ({ useToday: () => TODAY }));
vi.mock('@/hooks/useCatalog', () => ({
  useProducts: () => ({ data: [{ quantity: 3, costCents: 3500 }], isLoading: false, error: null }),
}));
vi.mock('@/hooks/useTransactions', () => ({
  useMonthlyTransactions: (month: string) => {
    state.requestedMonths.push(month);
    return { data: state.transactions, isLoading: false, error: null, hasPendingWrites: false };
  },
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
  paymentMethod: 'pix',
  expenseCategory: null,
  day: '2026-11-10',
  isVoided: false,
  createdAt: null,
  hasPendingWrites: false,
  ...overrides,
});

const normalize = (text: string) => text.replace(/\s/g, ' ');
const getByNormalizedText = (text: string) => screen.getAllByText(text, { normalizer: normalize });

function renderPage() {
  return render(
    <MemoryRouter>
      <MonthlySummaryPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  download.canShareFiles.mockReturnValue(false);
  state.requestedMonths = [];
  state.transactions = [
    buildTransaction({ id: 'design' }),
    buildTransaction({
      id: 'serum',
      type: 'product',
      itemId: 'serum',
      description: 'Sérum',
      grossCents: 4000,
      netCents: 4000,
    }),
    buildTransaction({
      id: 'gloves',
      type: 'expense',
      itemId: 'supplies',
      description: '',
      expenseCategory: 'supplies',
      grossCents: 1500,
      netCents: 1500,
      paymentMethod: 'cash',
    }),
    buildTransaction({ id: 'voided', grossCents: 9900, netCents: 9900, isVoided: true }),
  ];
});

afterEach(cleanup);

describe('MonthlySummaryPage', () => {
  it('shows revenue, result, average ticket and expenses (HU07)', () => {
    renderPage();
    expect(getByNormalizedText('R$ 100,00').length).toBeGreaterThan(0);
    expect(getByNormalizedText('R$ 85,00').length).toBeGreaterThan(0);
    expect(getByNormalizedText('R$ 50,00').length).toBeGreaterThan(0);
    expect(getByNormalizedText('R$ 15,00').length).toBeGreaterThan(0);
    expect(getByNormalizedText('R$ 105,00').length).toBeGreaterThan(0);
    expect(screen.getByText(MONTH_MESSAGES.saleCount(2))).toBeTruthy();
  });

  it('exports the month as CSV with readable labels and no voided entries', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: MONTH_MESSAGES.export }));

    const [fileName, csv] = download.shareOrDownloadTextFile.mock.calls[0] as [string, string];
    expect(fileName).toBe('financeiro-2026-11.csv');
    const lines = csv.split('\n');
    expect(lines).toHaveLength(4);
    expect(lines).toContain('2026-11-10;Despesa;"Material";1;Dinheiro;15,00;0,00;0,00;15,00');
  });

  it('offers to send the spreadsheet where the share sheet is available', () => {
    download.canShareFiles.mockReturnValue(true);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: MONTH_MESSAGES.share }));
    expect(download.shareOrDownloadTextFile).toHaveBeenCalledOnce();
    expect(screen.getByText(MONTH_MESSAGES.shareHint)).toBeTruthy();
  });

  it('browses previous months but not future ones', () => {
    renderPage();
    expect((screen.getByRole('button', { name: MONTH_MESSAGES.nextMonth }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: MONTH_MESSAGES.previousMonth }));
    expect(state.requestedMonths.at(-1)).toBe('2026-10');
    expect(screen.getByText('Outubro de 2026', { exact: false, normalizer: normalize })).toBeTruthy();
  });
});
