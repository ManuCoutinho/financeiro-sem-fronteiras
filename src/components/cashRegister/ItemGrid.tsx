import { Link } from 'react-router';
import { buildConfirmSalePath } from '@/app/paths';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/ui/format';

export type SaleItem = { id: string; name: string; priceCents: number; detail?: string; hasWarning?: boolean };

type ItemGridProps = { title: string; items: SaleItem[]; isDisabled: boolean };

export function ItemGrid({ title, items, isDisabled }: ItemGridProps) {
  if (items.length === 0) return null;

  return (
    <section aria-label={title} className="flex flex-col gap-2">
      <h3 className="text-base font-semibold text-muted-foreground">{title}</h3>
      <ul className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={buildConfirmSalePath(item.id)}
              aria-disabled={isDisabled || undefined}
              tabIndex={isDisabled ? -1 : undefined}
              className={cn(
                'flex min-h-24 flex-col justify-between gap-2 rounded-2xl border border-border bg-card p-3 shadow-xs transition-transform outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98]',
                isDisabled && 'pointer-events-none opacity-50',
              )}
            >
              <span className="text-base leading-tight font-semibold">{item.name}</span>
              <span className="flex flex-col">
                <span className="text-lg font-bold tabular-nums">{formatCurrency(item.priceCents)}</span>
                {item.detail && (
                  <span
                    className={cn('text-sm', item.hasWarning ? 'font-semibold text-warning' : 'text-muted-foreground')}
                  >
                    {item.detail}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
