import { useRef, useState, type PointerEvent } from 'react';
import type { DailyTotal } from '@/domain/monthlySummary';
import { cn } from '@/lib/utils';
import { formatBusinessDay, formatCurrency } from '@/ui/format';
import { MONTH_MESSAGES } from '@/ui/messages';

const DAY_PATTERN = 'dd/MM';
const AXIS_DAY_PATTERN = 'd';

const formatDay = (day: string) => formatBusinessDay(day, DAY_PATTERN);

type Gesture = { startDay: string; wasSelected: boolean; hasMoved: boolean };

export function DailySalesChart({ dailyTotals }: { dailyTotals: DailyTotal[] }) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);

  const dayAt = (clientX: number): string | undefined => {
    const plot = plotRef.current;
    if (!plot || dailyTotals.length === 0) return undefined;
    const { left, width } = plot.getBoundingClientRect();
    if (width <= 0) return undefined;
    const index = Math.floor(((clientX - left) / width) * dailyTotals.length);
    return dailyTotals[Math.min(Math.max(index, 0), dailyTotals.length - 1)]?.day;
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const day = dayAt(event.clientX);
    if (!day) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    gesture.current = { startDay: day, wasSelected: day === selectedDay, hasMoved: false };
    setSelectedDay(day);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!gesture.current) return;
    const day = dayAt(event.clientX);
    if (!day || day === selectedDay) return;
    gesture.current.hasMoved = true;
    setSelectedDay(day);
  };

  const handlePointerUp = () => {
    // Tapping the day that is already shown goes back to the best day of the month.
    if (gesture.current?.wasSelected && !gesture.current.hasMoved) setSelectedDay(null);
    gesture.current = null;
  };

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

      {/* The whole plot is the touch target: a tap anywhere picks the nearest day and sliding a
          finger sweeps across days, since each bar is only ~10 px wide on a phone. */}
      <div
        ref={plotRef}
        aria-hidden="true"
        data-testid="daily-sales-plot"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => (gesture.current = null)}
        className="flex h-36 cursor-pointer touch-pan-y items-end border-b border-border/40 select-none"
      >
        {dailyTotals.map((total) => (
          <div
            key={total.day}
            className={cn(
              'flex h-full flex-1 items-end rounded-t-md px-px',
              total.day === selectedDay && 'bg-foreground/10',
            )}
          >
            <span
              className={cn(
                'w-full rounded-t-[4px] bg-foreground transition-opacity',
                selectedDay && total.day !== selectedDay && 'opacity-40',
              )}
              style={{ height: `${(total.salesCents / maxCents) * 100}%` }}
            />
          </div>
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
