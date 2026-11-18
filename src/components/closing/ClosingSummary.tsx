import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CashRegisterSummary } from '@/domain/cashRegister';
import { PAYMENT_METHODS } from '@/domain/money';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/ui/format';
import { CLOSING_MESSAGES, PAYMENT_METHOD_LABELS } from '@/ui/messages';

type Totals = Omit<CashRegisterSummary, 'expectedCashCents'>;

// Avoids showing "-R$ 0,00" for deductions that did not happen.
const asDeduction = (cents: number) => (cents === 0 ? 0 : -cents);

function Row({ label, cents, isStrong = false }: { label: string; cents: number; isStrong?: boolean }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-3', isStrong && 'text-lg font-bold')}>
      <dt>{label}</dt>
      <dd className="font-semibold tabular-nums">{formatCurrency(cents)}</dd>
    </div>
  );
}

export function ClosingSummary({ totals }: { totals: Totals }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{CLOSING_MESSAGES.byMethodTitle}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="flex flex-col gap-2">
          {PAYMENT_METHODS.map((method) => (
            <Row key={method} label={PAYMENT_METHOD_LABELS[method]} cents={totals.totalsByMethod[method]} />
          ))}
        </dl>
        <dl className="flex flex-col gap-2 border-t border-border/20 pt-4">
          <Row label={CLOSING_MESSAGES.salesLabel} cents={totals.salesCents} />
          <Row label={CLOSING_MESSAGES.feesLabel} cents={asDeduction(totals.feesCents)} />
          <Row label={CLOSING_MESSAGES.netLabel} cents={totals.netCents} />
          <Row label={CLOSING_MESSAGES.expensesLabel} cents={asDeduction(totals.expensesCents)} />
          <Row label={CLOSING_MESSAGES.resultLabel} cents={totals.netCents - totals.expensesCents} isStrong />
        </dl>
      </CardContent>
    </Card>
  );
}

export function CashDifference({ differenceCents }: { differenceCents: number }) {
  const amount = formatCurrency(Math.abs(differenceCents));
  const text =
    differenceCents === 0
      ? CLOSING_MESSAGES.differenceBalanced
      : differenceCents > 0
        ? CLOSING_MESSAGES.differenceOver(amount)
        : CLOSING_MESSAGES.differenceShort(amount);

  return (
    <div
      aria-live="polite"
      className={cn(
        'flex items-baseline justify-between gap-3 rounded-xl p-3 text-lg font-bold',
        differenceCents === 0 ? 'bg-income-soft text-income' : 'bg-warning-soft text-warning',
      )}
    >
      <span>{CLOSING_MESSAGES.differenceLabel}</span>
      <span className="tabular-nums">{text}</span>
    </div>
  );
}
