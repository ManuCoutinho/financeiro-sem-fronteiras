import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { FlowLayout, TabLayout } from '@/components/AppShell';
import { RequireAuth } from '@/components/RequireAuth';
import { LoginPage } from '@/pages/LoginPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
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
          { path: PATHS.cashRegister, element: <PlaceholderPage title={PAGE_TITLES.cashRegister} /> },
          { path: PATHS.inventory, element: <PlaceholderPage title={PAGE_TITLES.inventory} /> },
          { path: PATHS.month, element: <PlaceholderPage title={PAGE_TITLES.month} /> },
          { path: PATHS.settings, element: <SettingsPage /> },
        ],
      },
      {
        element: <FlowLayout />,
        children: [
          { path: PATHS.confirmSale, element: <PlaceholderPage title={PAGE_TITLES.confirmSale} hasBackButton /> },
          { path: PATHS.newExpense, element: <PlaceholderPage title={PAGE_TITLES.newExpense} hasBackButton /> },
          { path: PATHS.closing, element: <PlaceholderPage title={PAGE_TITLES.closing} hasBackButton /> },
          { path: PATHS.product, element: <PlaceholderPage title={PAGE_TITLES.product} hasBackButton /> },
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
