import { useCallback } from 'react';
import { getMonthRange } from '@/domain/businessDay';
import type { Listener } from '@/services/snapshots';
import { subscribeTransactions, type DayRange, type Transaction } from '@/services/transactions';
import { useLiveQuery, type LiveQuery } from './useLiveQuery';

const NO_TRANSACTIONS: Transaction[] = [];

export type TransactionsQuery = LiveQuery<Transaction[]> & { hasPendingWrites: boolean };

function useTransactionsBetween({ firstDay, lastDay }: DayRange): TransactionsQuery {
  const subscribe = useCallback(
    (listener: Listener<Transaction[]>) => subscribeTransactions({ firstDay, lastDay }, listener),
    [firstDay, lastDay],
  );
  const transactions = useLiveQuery(subscribe, NO_TRANSACTIONS);
  return { ...transactions, hasPendingWrites: transactions.data.some((transaction) => transaction.hasPendingWrites) };
}

export const useDailyTransactions = (day: string) => useTransactionsBetween({ firstDay: day, lastDay: day });

export const useMonthlyTransactions = (month: string) => useTransactionsBetween(getMonthRange(month));
