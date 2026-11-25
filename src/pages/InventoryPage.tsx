import { AlertTriangle, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router';
import { buildProductPath, PATHS } from '@/app/paths';
import { StockAlertBadges } from '@/components/inventory/StockAlertBadges';
import { LoadState } from '@/components/LoadState';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { groupStockAlerts, STOCK_ALERT_TYPES, type StockAlertType } from '@/domain/inventory';
import type { Product } from '@/domain/schemas';
import { useProducts } from '@/hooks/useCatalog';
import { useStockAlerts } from '@/hooks/useStockAlerts';
import { formatBusinessDay } from '@/ui/format';
import { INVENTORY_MESSAGES, PAGE_TITLES, SETTINGS_MESSAGES } from '@/ui/messages';

const NO_ALERTS: StockAlertType[] = [];
const severity = (alerts: StockAlertType[]) =>
  alerts.length === 0 ? STOCK_ALERT_TYPES.length : Math.min(...alerts.map((type) => STOCK_ALERT_TYPES.indexOf(type)));

function ProductRow({ product, alerts }: { product: Product; alerts: StockAlertType[] }) {
  const details = [
    SETTINGS_MESSAGES.stockCount(product.quantity),
    product.expiresOn && INVENTORY_MESSAGES.expiresOn(formatBusinessDay(product.expiresOn)),
  ].filter(Boolean);

  return (
    <li>
      <Link
        to={buildProductPath(product.id)}
        className="flex min-h-touch items-center gap-3 rounded-xl px-2 py-3 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <span className="flex flex-1 flex-col gap-1">
          <span className="font-semibold">{product.name}</span>
          <span className="text-sm text-muted-foreground tabular-nums">{details.join(' · ')}</span>
          <StockAlertBadges alerts={alerts} />
          {!product.isActive && <Badge variant="voided">{SETTINGS_MESSAGES.hidden}</Badge>}
        </span>
        <ChevronRight aria-hidden="true" className="size-5 shrink-0" />
      </Link>
    </li>
  );
}

export function InventoryPage() {
  const products = useProducts();
  const alerts = useStockAlerts();
  const alertsByProduct = useMemo(() => groupStockAlerts(alerts.data), [alerts.data]);
  const rows = useMemo(
    () =>
      products.data
        .map((product) => ({ product, alerts: alertsByProduct.get(product.id) ?? NO_ALERTS }))
        .sort((first, second) => severity(first.alerts) - severity(second.alerts)),
    [products.data, alertsByProduct],
  );
  const isLoading = products.isLoading || alerts.isLoading;
  const error = products.error ?? alerts.error;
  const ready = !isLoading && !error;

  return (
    <>
      <PageHeader title={PAGE_TITLES.inventory} />
      <LoadState isLoading={isLoading} error={error} />

      {ready && rows.length === 0 && (
        <Card>
          <CardContent className="flex flex-col gap-3">
            <p>{INVENTORY_MESSAGES.noProducts}</p>
            <Button asChild>
              <Link to={PATHS.settings}>
                <Plus aria-hidden="true" /> {INVENTORY_MESSAGES.goToSettings}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {ready && rows.length > 0 && (
        <>
          {alertsByProduct.size > 0 ? (
            <p
              role="status"
              className="flex items-center gap-2 rounded-2xl bg-warning-soft p-4 font-semibold text-warning"
            >
              <AlertTriangle aria-hidden="true" className="size-5 shrink-0" />
              {INVENTORY_MESSAGES.needsAttention(alertsByProduct.size)}
            </p>
          ) : (
            <p
              role="status"
              className="flex items-center gap-2 rounded-2xl bg-income-soft p-4 font-semibold text-income"
            >
              <CheckCircle2 aria-hidden="true" className="size-5 shrink-0" />
              {INVENTORY_MESSAGES.allGood}
            </p>
          )}
          <Card>
            <CardContent>
              <ul className="-mx-2 flex flex-col divide-y divide-border/20">
                {rows.map(({ product, alerts: productAlerts }) => (
                  <ProductRow key={product.id} product={product} alerts={productAlerts} />
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
