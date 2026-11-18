import { useSyncExternalStore } from 'react';
import { env } from '@/config/env';
import { toBusinessDay } from '@/domain/businessDay';

const getToday = () => toBusinessDay(new Date(), env.timeZone);

// The app stays open in the background for days on the iPhone, so the day is re-read whenever it comes back.
function subscribeToVisibility(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

export const useToday = (): string => useSyncExternalStore(subscribeToVisibility, getToday);
