import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PATHS } from '@/app/paths';
import { EXPENSE_MESSAGES } from '@/ui/messages';
import { NewExpensePage } from './NewExpensePage';

const TODAY = '2026-11-18';
const state = vi.hoisted(() => ({ isClosed: false }));
const transactions = vi.hoisted(() => ({ registerExpense: vi.fn(() => 'new-id'), voidTransaction: vi.fn() }));

vi.mock('@/services/transactions', () => transactions);
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/hooks/useToday', () => ({ useToday: () => TODAY }));
vi.mock('@/hooks/useCashClosing', () => ({
  useCashClosing: () => ({ data: null, isLoading: false, error: null, isClosed: state.isClosed }),
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[PATHS.newExpense]}>
      <Routes>
        <Route path={PATHS.newExpense} element={<NewExpensePage />} />
        <Route path={PATHS.cashRegister} element={<p>tela do caixa</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

const save = () => fireEvent.click(screen.getByRole('button', { name: EXPENSE_MESSAGES.save }));

beforeEach(() => {
  vi.clearAllMocks();
  state.isClosed = false;
});

afterEach(cleanup);

describe('NewExpensePage', () => {
  it('asks for the category, amount and payment method', async () => {
    renderPage();
    save();

    expect(await screen.findByText(EXPENSE_MESSAGES.chooseCategory)).toBeTruthy();
    expect(screen.getByText(EXPENSE_MESSAGES.invalidAmount)).toBeTruthy();
    expect(screen.getByText(EXPENSE_MESSAGES.choosePayment)).toBeTruthy();
    expect(transactions.registerExpense).not.toHaveBeenCalled();
  });

  it('registers the expense in cents and returns to the register', async () => {
    renderPage();
    fireEvent.click(screen.getByLabelText('Material'));
    fireEvent.change(screen.getByLabelText(EXPENSE_MESSAGES.amountLabel), { target: { value: '15,90' } });
    fireEvent.change(screen.getByLabelText(EXPENSE_MESSAGES.descriptionLabel), { target: { value: ' Luvas ' } });
    fireEvent.click(screen.getByLabelText('Dinheiro'));
    save();

    await waitFor(() => expect(screen.getByText('tela do caixa')).toBeTruthy());
    expect(transactions.registerExpense).toHaveBeenCalledWith(
      { category: 'supplies', description: 'Luvas', amountCents: 1590, paymentMethod: 'cash', day: TODAY },
      expect.any(Function),
    );
  });

  it('does not register expenses on a closed day', () => {
    state.isClosed = true;
    renderPage();
    expect(screen.getByText(EXPENSE_MESSAGES.dayClosed)).toBeTruthy();
    expect(screen.queryByRole('button', { name: EXPENSE_MESSAGES.save })).toBeNull();
  });
});
