import { useCallback } from 'react';
import type { Listener } from '@/services/snapshots';
import { subscribeProductMovements, type StockMovement } from '@/services/stock';
import { useLiveQuery, type LiveQuery } from './useLiveQuery';

const NO_MOVEMENTS: StockMovement[] = [];

export function useProductMovements(productId: string): LiveQuery<StockMovement[]> {
  const subscribe = useCallback(
    (listener: Listener<StockMovement[]>) => subscribeProductMovements(productId, listener),
    [productId],
  );
  return useLiveQuery(subscribe, NO_MOVEMENTS);
}
