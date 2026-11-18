import type { ComponentType } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { FlowLayout, TabLayout } from '@/components/AppShell';
import { RequireAuth } from '@/components/RequireAuth';
import { SplashScreen } from '@/components/SplashScreen';
import { LoginPage } from '@/pages/LoginPage';
import { PATHS } from './paths';

// Screens load on demand so the login screen ships without Firestore and the other pages.
const page =
  <Name extends string>(load: () => Promise<Record<Name, ComponentType>>, name: Name) =>
  async () => ({ Component: (await load())[name] });

export const router = createBrowserRouter([
  { path: PATHS.login, element: <LoginPage /> },
  {
    element: (
      <RequireAuth>
        <Outlet />
      </RequireAuth>
    ),
    HydrateFallback: SplashScreen,
    children: [
      {
        element: <TabLayout />,
        children: [
          { path: PATHS.cashRegister, lazy: page(() => import('@/pages/CashRegisterPage'), 'CashRegisterPage') },
          { path: PATHS.inventory, lazy: page(() => import('@/pages/InventoryPage'), 'InventoryPage') },
          { path: PATHS.month, lazy: page(() => import('@/pages/MonthlySummaryPage'), 'MonthlySummaryPage') },
          { path: PATHS.settings, lazy: page(() => import('@/pages/SettingsPage'), 'SettingsPage') },
        ],
      },
      {
        element: <FlowLayout />,
        children: [
          { path: PATHS.confirmSale, lazy: page(() => import('@/pages/ConfirmSalePage'), 'ConfirmSalePage') },
          { path: PATHS.newExpense, lazy: page(() => import('@/pages/NewExpensePage'), 'NewExpensePage') },
          {
            path: PATHS.closing,
            lazy: page(() => import('@/pages/CloseCashRegisterPage'), 'CloseCashRegisterPage'),
          },
          { path: PATHS.product, lazy: page(() => import('@/pages/ProductPage'), 'ProductPage') },
          {
            path: PATHS.importPricing,
            lazy: page(() => import('@/pages/ImportPricingPage'), 'ImportPricingPage'),
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={PATHS.cashRegister} replace /> },
]);
