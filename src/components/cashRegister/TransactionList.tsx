import { CloudUpload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/services/transactions';
import { formatCurrency, formatTime } from '@/ui/format';
import { CASH_REGISTER_MESSAGES, EXPENSE_CATEGORY_LABELS, MESSAGES, PAYMENT_METHOD_LABELS } from '@/ui/messages';

function describe(transaction: Transaction): string {
  if (transaction.type !== 'expense') return transaction.description;
  const category = transaction.expenseCategory ? EXPENSE_CATEGORY_LABELS[transaction.expenseCategory] : '';
  return transaction.description || category;
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isExpense = transaction.type === 'expense';
  const amountCents = transaction.grossCents - transaction.discountCents;
  const details = [
    transaction.createdAt && formatTime(transaction.createdAt),
    transaction.quantity > 1 && CASH_REGISTER_MESSAGES.quantityTimes(transaction.quantity),
    PAYMENT_METHOD_LABELS[transaction.paymentMethod],
  ].filter(Boolean);

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="flex flex-1 flex-col gap-0.5">
        <span className={cn('font-semibold', transaction.isVoided && 'text-voided line-through')}>
          {describe(transaction)}
        </span>
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
      </div>
    </li>
  );
}

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <p className="text-muted-foreground">{CASH_REGISTER_MESSAGES.noTransactions}</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-border/20">
      {[...transactions].reverse().map((transaction) => (
        <TransactionRow key={transaction.id} transaction={transaction} />
      ))}
    </ul>
  );
}
