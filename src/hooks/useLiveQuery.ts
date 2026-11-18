import { useEffect, useState } from 'react';
import type { Subscribe } from '@/services/snapshots';
import { toUserMessage } from '@/ui/messages';

export type LiveQuery<T> = { data: T; isLoading: boolean; error: string | null };

type Snapshot<T> = { source: Subscribe<T>; data?: T; error: string | null };

// `subscribe` must be stable (module function or useCallback): a new identity restarts the listener.
export function useLiveQuery<T>(subscribe: Subscribe<T>, initialData: T): LiveQuery<T> {
  const [snapshot, setSnapshot] = useState<Snapshot<T> | null>(null);

  useEffect(
    () =>
      subscribe({
        onNext: (data) => setSnapshot({ source: subscribe, data, error: null }),
        onError: (error) => setSnapshot({ source: subscribe, error: toUserMessage(error) }),
      }),
    [subscribe],
  );

  const isCurrent = snapshot?.source === subscribe;
  return {
    data: isCurrent && snapshot.data !== undefined ? snapshot.data : initialData,
    isLoading: !isCurrent,
    error: isCurrent ? snapshot.error : null,
  };
}
