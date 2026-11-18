import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { FlowLayout, TabLayout } from '@/components/AppShell';
import { RequireAuth } from '@/components/RequireAuth';
import { CashRegisterPage } from '@/pages/CashRegisterPage';
import { CloseCashRegisterPage } from '@/pages/CloseCashRegisterPage';
import { ConfirmSalePage } from '@/pages/ConfirmSalePage';
import { InventoryPage } from '@/pages/InventoryPage';
import { LoginPage } from '@/pages/LoginPage';
import { MonthlySummaryPage } from '@/pages/MonthlySummaryPage';
import { NewExpensePage } from '@/pages/NewExpensePage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { ProductPage } from '@/pages/ProductPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PAGE_TITLES } from '@/ui/messages';
import { PATHS } from './paths';

export const router = createBrowserRouter([
  { path: PATHS.login, element: <LoginPage /> },
  {
    element: (
      <RequireAuth>
        <Outlet />
      </RequireAuth>
    ),
    children: [
      {
        element: <TabLayout />,
        children: [
          { path: PATHS.cashRegister, element: <CashRegisterPage /> },
          { path: PATHS.inventory, element: <InventoryPage /> },
          { path: PATHS.month, element: <MonthlySummaryPage /> },
          { path: PATHS.settings, element: <SettingsPage /> },
        ],
      },
      {
        element: <FlowLayout />,
        children: [
          { path: PATHS.confirmSale, element: <ConfirmSalePage /> },
          { path: PATHS.newExpense, element: <NewExpensePage /> },
          { path: PATHS.closing, element: <CloseCashRegisterPage /> },
          { path: PATHS.product, element: <ProductPage /> },
          {
            path: PATHS.importPricing,
            element: <PlaceholderPage title={PAGE_TITLES.importPricing} hasBackButton />,
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={PATHS.cashRegister} replace /> },
]);
