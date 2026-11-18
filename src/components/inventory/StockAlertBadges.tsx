import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { StockAlertType } from '@/domain/inventory';
import { STOCK_ALERT_LABELS } from '@/ui/messages';

const ALERT_VARIANTS: Record<StockAlertType, 'expense' | 'warning'> = {
  negative: 'expense',
  expired: 'expense',
  low: 'warning',
  expiringSoon: 'warning',
};

export function StockAlertBadges({ alerts }: { alerts: readonly StockAlertType[] }) {
  if (alerts.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {alerts.map((type) => (
        <Badge key={type} variant={ALERT_VARIANTS[type]}>
          <AlertTriangle aria-hidden="true" /> {STOCK_ALERT_LABELS[type]}
        </Badge>
      ))}
    </div>
  );
}
