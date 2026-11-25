import { LockOpen, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { PATHS } from '@/app/paths';
import { TransactionList } from '@/components/cashRegister/TransactionList';
import { CashDifference, ClosingSummary } from '@/components/closing/ClosingSummary';
import { MoneyField } from '@/components/MoneyField';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buildCashClosing } from '@/domain/cashRegister';
import { useCashClosing } from '@/hooks/useCashClosing';
import { useToday } from '@/hooks/useToday';
import { useDailyTransactions } from '@/hooks/useTransactions';
import { notifyError } from '@/lib/notify';
import { closeCashRegister, reopenCashRegister, type CashClosing } from '@/services/cashClosings';
import type { Transaction } from '@/services/transactions';
import { formatCurrency, formatMoneyInput, formatTime, parseAmountToCents } from '@/ui/format';
import { CLOSING_MESSAGES, FORM_MESSAGES, LOADING_LABEL, PAGE_TITLES } from '@/ui/messages';

const parseOptionalAmount = (text: string) => (text.trim() === '' ? 0 : parseAmountToCents(text));

type OpenDayProps = { day: string; transactions: Transaction[]; previousClosing: CashClosing | null };

function OpenDay({ day, transactions, previousClosing }: OpenDayProps) {
  const [openingText, setOpeningText] = useState(() =>
    previousClosing ? formatMoneyInput(previousClosing.openingCashCents) : '',
  );
  const [countedText, setCountedText] = useState('');

  const openingCashCents = parseOptionalAmount(openingText);
  const countedCashCents = countedText.trim() === '' ? null : parseAmountToCents(countedText);
  const closing = buildCashClosing(transactions, {
    openingCashCents: openingCashCents ?? 0,
    countedCashCents: countedCashCents ?? 0,
  });
  const isCountValid = openingCashCents !== null && countedCashCents !== null;

  const confirm = () => {
    if (openingCashCents === null || countedCashCents === null) return;
    closeCashRegister({ day, transactions, count: { openingCashCents, countedCashCents } }, notifyError);
    toast.success(CLOSING_MESSAGES.closed);
  };

  const expenses = transactions.filter((transaction) => transaction.type === 'expense');

  return (
    <>
      <ClosingSummary totals={closing} />
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
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{CLOSING_MESSAGES.drawerTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <MoneyField
            label={CLOSING_MESSAGES.openingCashLabel}
            hint={CLOSING_MESSAGES.openingCashHint}
            value={openingText}
            onChange={(event) => setOpeningText(event.target.value)}
            error={openingCashCents === null ? FORM_MESSAGES.invalidAmount : undefined}
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3 text-lg font-bold">
              <span>{CLOSING_MESSAGES.expectedCashLabel}</span>
              <span className="tabular-nums">{formatCurrency(closing.expectedCashCents)}</span>
            </div>
            <p className="text-sm text-muted-foreground">{CLOSING_MESSAGES.expectedCashHint}</p>
          </div>
          <MoneyField
            label={CLOSING_MESSAGES.countedCashLabel}
            hint={CLOSING_MESSAGES.countedCashHint}
            value={countedText}
            onChange={(event) => setCountedText(event.target.value)}
            error={countedText.trim() !== '' && countedCashCents === null ? FORM_MESSAGES.invalidAmount : undefined}
          />
          {isCountValid && <CashDifference differenceCents={closing.differenceCents} />}
          <Button size="lg" disabled={!isCountValid} onClick={confirm}>
            {CLOSING_MESSAGES.confirm}
          </Button>
        </CardContent>
      </Card>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{CLOSING_MESSAGES.drawerTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <dl className="flex flex-col gap-2">
            {[
              { label: CLOSING_MESSAGES.openingCashLabel, cents: closing.openingCashCents },
              { label: CLOSING_MESSAGES.expectedCashLabel, cents: closing.expectedCashCents },
              { label: CLOSING_MESSAGES.countedCashLabel, cents: closing.countedCashCents },
            ].map(({ label, cents }) => (
              <div key={label} className="flex items-baseline justify-between gap-3">
                <dt>{label}</dt>
                <dd className="font-semibold tabular-nums">{formatCurrency(cents)}</dd>
              </div>
            ))}
          </dl>
          <CashDifference differenceCents={closing.differenceCents} />
        </CardContent>
      </Card>
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
      {!isLoading && !closing.isClosed && (
        <OpenDay key={today} day={today} transactions={transactions.data} previousClosing={closing.data} />
      )}
    </>
  );
}
