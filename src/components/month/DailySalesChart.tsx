import { useState } from 'react';
import type { DailyTotal } from '@/domain/monthlySummary';
import { cn } from '@/lib/utils';
import { formatBusinessDay, formatCurrency } from '@/ui/format';
import { MONTH_MESSAGES } from '@/ui/messages';

const DAY_PATTERN = 'dd/MM';
const AXIS_DAY_PATTERN = 'd';

const formatDay = (day: string) => formatBusinessDay(day, DAY_PATTERN);

export function DailySalesChart({ dailyTotals }: { dailyTotals: DailyTotal[] }) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const bestDay = dailyTotals.reduce<DailyTotal | null>(
    (best, total) => (total.salesCents > (best?.salesCents ?? 0) ? total : best),
    null,
  );
  const maxCents = bestDay?.salesCents ?? 0;
  const selected = dailyTotals.find((total) => total.day === selectedDay);
  const firstDay = dailyTotals[0];
  const lastDay = dailyTotals.at(-1);

  if (!bestDay) return <p className="text-muted-foreground">{MONTH_MESSAGES.noSales}</p>;

  return (
    <div className="flex flex-col gap-3">
      <p aria-live="polite" className="min-h-6 font-semibold tabular-nums">
        {selected
          ? MONTH_MESSAGES.selectedDay(formatDay(selected.day), formatCurrency(selected.salesCents))
          : MONTH_MESSAGES.bestDay(formatDay(bestDay.day), formatCurrency(bestDay.salesCents))}
      </p>

      <div aria-hidden="true" className="flex h-36 items-end gap-0.5 border-b border-border/40">
        {dailyTotals.map((total) => (
          <button
            key={total.day}
            type="button"
            tabIndex={-1}
            onClick={() => setSelectedDay(total.day === selectedDay ? null : total.day)}
            className="flex h-full flex-1 items-end"
          >
            <span
              className={cn(
                'w-full rounded-t-[4px] bg-foreground transition-opacity',
                selectedDay && total.day !== selectedDay && 'opacity-40',
              )}
              style={{ height: `${(total.salesCents / maxCents) * 100}%` }}
            />
          </button>
        ))}
      </div>
      {firstDay && lastDay && (
        <div aria-hidden="true" className="flex justify-between text-sm text-muted-foreground tabular-nums">
          <span>{formatBusinessDay(firstDay.day, AXIS_DAY_PATTERN)}</span>
          <span>{formatBusinessDay(lastDay.day, AXIS_DAY_PATTERN)}</span>
        </div>
      )}
      <p aria-hidden="true" className="text-sm text-muted-foreground">
        {MONTH_MESSAGES.dailyHint}
      </p>

      <table className="sr-only">
        <caption>{MONTH_MESSAGES.dailyTitle}</caption>
        <thead>
          <tr>
            <th scope="col">{MONTH_MESSAGES.dayColumn}</th>
            <th scope="col">{MONTH_MESSAGES.amountColumn}</th>
          </tr>
        </thead>
        <tbody>
          {dailyTotals
            .filter((total) => total.salesCents > 0)
            .map((total) => (
              <tr key={total.day}>
                <td>{formatDay(total.day)}</td>
                <td>{formatCurrency(total.salesCents)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
