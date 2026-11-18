import { CloudUpload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { StockMovement } from '@/services/stock';
import { formatBusinessDay, formatTime } from '@/ui/format';
import { MESSAGES, PRODUCT_MESSAGES, STOCK_MOVEMENT_LABELS } from '@/ui/messages';

const DAY_PATTERN = 'dd/MM';

function MovementRow({ movement }: { movement: StockMovement }) {
  const isIncoming = movement.quantity > 0;
  const details = [
    formatBusinessDay(movement.day, DAY_PATTERN),
    movement.createdAt && formatTime(movement.createdAt),
    movement.reason,
  ].filter(Boolean);

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="font-semibold">{STOCK_MOVEMENT_LABELS[movement.type]}</span>
        <span className="text-sm text-muted-foreground">{details.join(' · ')}</span>
        {movement.hasPendingWrites && (
          <Badge variant="warning" className="mt-1">
            <CloudUpload aria-hidden="true" /> {MESSAGES.pendingSync}
          </Badge>
        )}
      </div>
      <span className={cn('text-lg font-bold tabular-nums', isIncoming ? 'text-income' : 'text-expense')}>
        {isIncoming ? '+' : '−'}
        {Math.abs(movement.quantity)}
      </span>
    </li>
  );
}

export function MovementHistory({ movements }: { movements: StockMovement[] }) {
  if (movements.length === 0) return <p className="text-muted-foreground">{PRODUCT_MESSAGES.noMovements}</p>;

  return (
    <ul className="flex flex-col divide-y divide-border/20">
      {movements.map((movement) => (
        <MovementRow key={movement.id} movement={movement} />
      ))}
    </ul>
  );
}
