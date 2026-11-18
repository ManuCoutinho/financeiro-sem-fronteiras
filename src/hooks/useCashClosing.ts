import { useCallback } from 'react';
import { isDayClosed } from '@/domain/cashRegister';
import { subscribeCashClosing, type CashClosing } from '@/services/cashClosings';
import type { Listener } from '@/services/snapshots';
import { useLiveQuery, type LiveQuery } from './useLiveQuery';

export type CashClosingQuery = LiveQuery<CashClosing | null> & { isClosed: boolean };

export function useCashClosing(day: string): CashClosingQuery {
  const subscribe = useCallback((listener: Listener<CashClosing | null>) => subscribeCashClosing(day, listener), [day]);
  const closing = useLiveQuery(subscribe, null);
  return { ...closing, isClosed: isDayClosed(closing.data) };
}
