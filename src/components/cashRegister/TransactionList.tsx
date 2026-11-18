import { CloudUpload, Undo2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/services/transactions';
import { formatCurrency, formatTime } from '@/ui/format';
import {
  CASH_REGISTER_MESSAGES,
  EXPENSE_CATEGORY_LABELS,
  MESSAGES,
  PAYMENT_METHOD_LABELS,
  UNDO_MESSAGES,
} from '@/ui/messages';

type OnUndo = (transaction: Transaction) => void;

export function describeTransaction(transaction: Transaction): string {
  if (transaction.type !== 'expense') return transaction.description;
  const category = transaction.expenseCategory ? EXPENSE_CATEGORY_LABELS[transaction.expenseCategory] : '';
  return transaction.description || category;
}

function TransactionRow({ transaction, onUndo }: { transaction: Transaction; onUndo?: OnUndo }) {
  const isExpense = transaction.type === 'expense';
  const amountCents = transaction.grossCents - transaction.discountCents;
  const description = describeTransaction(transaction);
  const details = [
    transaction.createdAt && formatTime(transaction.createdAt),
    transaction.quantity > 1 && CASH_REGISTER_MESSAGES.quantityTimes(transaction.quantity),
    PAYMENT_METHOD_LABELS[transaction.paymentMethod],
  ].filter(Boolean);

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="flex flex-1 flex-col gap-0.5">
        <span className={cn('font-semibold', transaction.isVoided && 'text-voided line-through')}>{description}</span>
        <span className="text-sm text-muted-foreground">{details.join(' · ')}</span>
        {transaction.hasPendingWrites && (
          <Badge variant="warning" className="mt-1">
            <CloudUpload aria-hidden="true" /> {MESSAGES.pendingSync}
          </Badge>
        )}
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          className={cn(
            'text-lg font-bold tabular-nums',
            transaction.isVoided ? 'text-voided line-through' : isExpense ? 'text-expense' : 'text-income',
          )}
        >
          {isExpense ? '−' : '+'}
          {formatCurrency(amountCents)}
        </span>
        {transaction.isVoided && <Badge variant="voided">{CASH_REGISTER_MESSAGES.voided}</Badge>}
        {!transaction.isVoided && onUndo && (
          <Button
            variant="ghost"
            size="sm"
            aria-label={UNDO_MESSAGES.undoLabel(description)}
            onClick={() => onUndo(transaction)}
          >
            <Undo2 aria-hidden="true" /> {MESSAGES.undo}
          </Button>
        )}
      </div>
    </li>
  );
}

type TransactionListProps = { transactions: Transaction[]; onUndo?: OnUndo };

export function TransactionList({ transactions, onUndo }: TransactionListProps) {
  if (transactions.length === 0) {
    return <p className="text-muted-foreground">{CASH_REGISTER_MESSAGES.noTransactions}</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-border/20">
      {[...transactions].reverse().map((transaction) => (
        <TransactionRow key={transaction.id} transaction={transaction} onUndo={onUndo} />
      ))}
    </ul>
  );
}
