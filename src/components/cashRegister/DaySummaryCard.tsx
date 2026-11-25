import { Card, CardContent } from '@/components/ui/card';
import type { CashRegisterSummary } from '@/domain/cashRegister';
import { formatCurrency } from '@/ui/format';
import { CASH_REGISTER_MESSAGES, MESSAGES } from '@/ui/messages';

type DaySummaryCardProps = { summary: CashRegisterSummary; isAvailable?: boolean };

/** When the day could not be read, the totals show a dash instead of a misleading R$ 0,00. */
export function DaySummaryCard({ summary, isAvailable = true }: DaySummaryCardProps) {
  const show = (cents: number) => (isAvailable ? formatCurrency(cents) : MESSAGES.unavailable);
  return (
    <Card className="bg-primary text-primary-foreground">
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col">
          <span className="text-base font-medium">{CASH_REGISTER_MESSAGES.soldToday}</span>
          <span className="text-4xl font-bold tabular-nums" aria-live="polite">
            {show(summary.salesCents)}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-base">
          <div className="flex flex-col">
            <dt className="font-medium">{CASH_REGISTER_MESSAGES.netLabel}</dt>
            <dd className="font-semibold tabular-nums">{show(summary.netCents)}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="font-medium">{CASH_REGISTER_MESSAGES.expensesLabel}</dt>
            <dd className="font-semibold tabular-nums">{show(summary.expensesCents)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
