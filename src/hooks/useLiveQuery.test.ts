import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Listener } from '@/services/snapshots';
import { MESSAGES } from '@/ui/messages';
import { useLiveQuery } from './useLiveQuery';

function createSource() {
  let listener: Listener<string[]> | null = null;
  const unsubscribe = vi.fn();
  const subscribe = vi.fn((next: Listener<string[]>) => {
    listener = next;
    return unsubscribe;
  });
  const emit = (data: string[]) => act(() => listener?.onNext(data));
  const fail = (error: unknown) => act(() => listener?.onError(error));
  return { subscribe, unsubscribe, emit, fail };
}

const EMPTY: string[] = [];

describe('useLiveQuery', () => {
  it('is loading until the first snapshot arrives', () => {
    const source = createSource();
    const { result } = renderHook(() => useLiveQuery(source.subscribe, EMPTY));

    expect(result.current).toEqual({ data: EMPTY, isLoading: true, error: null });
    source.emit(['a']);
    expect(result.current).toEqual({ data: ['a'], isLoading: false, error: null });
  });

  it('turns errors into a user message', () => {
    const source = createSource();
    const { result } = renderHook(() => useLiveQuery(source.subscribe, EMPTY));

    source.fail({ code: 'permission-denied' });
    expect(result.current).toEqual({ data: EMPTY, isLoading: false, error: MESSAGES.permissionDenied });
  });

  it('restarts the listener and the loading state when the source changes', () => {
    const first = createSource();
    const second = createSource();
    const { result, rerender } = renderHook(({ subscribe }) => useLiveQuery(subscribe, EMPTY), {
      initialProps: { subscribe: first.subscribe },
    });
    first.emit(['old']);

    rerender({ subscribe: second.subscribe });
    expect(first.unsubscribe).toHaveBeenCalledOnce();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBe(EMPTY);

    second.emit(['new']);
    expect(result.current.data).toEqual(['new']);
  });

  it('stops listening on unmount', () => {
    const source = createSource();
    const { unmount } = renderHook(() => useLiveQuery(source.subscribe, EMPTY));
    unmount();
    expect(source.unsubscribe).toHaveBeenCalledOnce();
  });
});
