import { env } from '@/config/env';
import { PAYMENT_METHODS } from '@/domain/money';
import type { BusinessSettings, Product, Service } from '@/domain/schemas';
import { subscribeBusinessSettings, subscribeProducts, subscribeServices } from '@/services/catalog';
import { useLiveQuery, type LiveQuery } from './useLiveQuery';

const NO_SERVICES: Service[] = [];
const NO_PRODUCTS: Product[] = [];

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  name: env.appName,
  feePercentByMethod: Object.fromEntries(
    PAYMENT_METHODS.map((method) => [method, 0]),
  ) as BusinessSettings['feePercentByMethod'],
  expirationAlertDays: env.expirationAlertDays,
};

export const useServices = (): LiveQuery<Service[]> => useLiveQuery(subscribeServices, NO_SERVICES);

export const useProducts = (): LiveQuery<Product[]> => useLiveQuery(subscribeProducts, NO_PRODUCTS);

export function useBusinessSettings(): LiveQuery<BusinessSettings> {
  const settings = useLiveQuery(subscribeBusinessSettings, null);
  return { ...settings, data: settings.data ?? DEFAULT_BUSINESS_SETTINGS };
}
