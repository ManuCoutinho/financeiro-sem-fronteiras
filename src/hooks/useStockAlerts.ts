import { useMemo } from 'react';
import { dayToDate } from '@/domain/businessDay';
import { getStockAlerts, type StockAlert } from '@/domain/inventory';
import { useBusinessSettings, useProducts } from './useCatalog';
import type { LiveQuery } from './useLiveQuery';
import { useToday } from './useToday';

export function useStockAlerts(): LiveQuery<StockAlert[]> {
  const products = useProducts();
  const settings = useBusinessSettings();
  const today = useToday();
  const { expirationAlertDays } = settings.data;

  const alerts = useMemo(
    () =>
      getStockAlerts(
        products.data
          .filter((product) => product.isActive)
          .map((product) => ({
            id: product.id,
            quantity: product.quantity,
            minStock: product.minStock,
            expiresOn: product.expiresOn ? dayToDate(product.expiresOn) : null,
          })),
        dayToDate(today),
        expirationAlertDays,
      ),
    [products.data, today, expirationAlertDays],
  );

  return {
    data: alerts,
    isLoading: products.isLoading || settings.isLoading,
    error: products.error ?? settings.error,
  };
}
