import { LockOpen, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { PATHS } from '@/app/paths';
import { TransactionList } from '@/components/cashRegister/TransactionList';
import { ClosingSummary } from '@/components/closing/ClosingSummary';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { summarizeCashRegister } from '@/domain/cashRegister';
import { useCashClosing } from '@/hooks/useCashClosing';
import { useToday } from '@/hooks/useToday';
import { useDailyTransactions } from '@/hooks/useTransactions';
import { notifyError } from '@/lib/notify';
import { closeCashRegister, reopenCashRegister, type CashClosing } from '@/services/cashClosings';
import type { Transaction } from '@/services/transactions';
import { formatTime } from '@/ui/format';
import { CLOSING_MESSAGES, LOADING_LABEL, PAGE_TITLES } from '@/ui/messages';

function OpenDay({ day, transactions }: { day: string; transactions: Transaction[] }) {
  const summary = summarizeCashRegister(transactions);

  const confirm = () => {
    closeCashRegister({ day, transactions }, notifyError);
    toast.success(CLOSING_MESSAGES.closed);
  };

  const expenses = transactions.filter((transaction) => transaction.type === 'expense');

  return (
    <>
      <ClosingSummary totals={summary} />
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{CLOSING_MESSAGES.expensesTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">{CLOSING_MESSAGES.expensesHint}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {expenses.length === 0 ? (
            <p className="text-muted-foreground">{CLOSING_MESSAGES.noExpenses}</p>
          ) : (
            <TransactionList transactions={expenses} />
          )}
          <Button asChild variant="outline" size="lg">
            <Link to={PATHS.newExpense}>
              <Plus aria-hidden="true" /> {CLOSING_MESSAGES.addExpense}
            </Link>
          </Button>
        </CardContent>
      </Card>
      <Button size="lg" onClick={confirm}>
        {CLOSING_MESSAGES.confirm}
      </Button>
    </>
  );
}

function ClosedDay({ day, closing }: { day: string; closing: CashClosing }) {
  const reopen = () => {
    reopenCashRegister(day, notifyError);
    toast.success(CLOSING_MESSAGES.reopened);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="income" className="text-base">
          {CLOSING_MESSAGES.closed}
        </Badge>
        {closing.closedAt && (
          <span className="text-muted-foreground">{CLOSING_MESSAGES.closedAt(formatTime(closing.closedAt))}</span>
        )}
        {closing.reopeningCount > 0 && (
          <span className="text-muted-foreground">· {CLOSING_MESSAGES.reopenings(closing.reopeningCount)}</span>
        )}
      </div>
      <ClosingSummary totals={closing} />
      <div className="flex flex-col gap-2">
        <Button variant="outline" size="lg" onClick={reopen}>
          <LockOpen aria-hidden="true" /> {CLOSING_MESSAGES.reopen}
        </Button>
        <p className="text-sm text-muted-foreground">{CLOSING_MESSAGES.reopenHint}</p>
      </div>
    </>
  );
}

export function CloseCashRegisterPage() {
  const today = useToday();
  const transactions = useDailyTransactions(today);
  const closing = useCashClosing(today);
  const error = transactions.error ?? closing.error;
  const isLoading = transactions.isLoading || closing.isLoading;

  return (
    <>
      <PageHeader title={PAGE_TITLES.closing} hasBackButton />
      {error && (
        <p role="alert" className="font-medium text-destructive">
          {error}
        </p>
      )}
      {isLoading && (
        <p role="status" className="text-muted-foreground">
          {LOADING_LABEL}
        </p>
      )}
      {!isLoading && closing.data && closing.isClosed && <ClosedDay day={today} closing={closing.data} />}
      {!isLoading && !closing.isClosed && <OpenDay key={today} day={today} transactions={transactions.data} />}
    </>
  );
}
