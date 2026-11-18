import { ClipboardCheck, HandHelping, PackagePlus, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { PATHS } from '@/app/paths';
import { MovementHistory } from '@/components/inventory/MovementHistory';
import { StockAlertBadges } from '@/components/inventory/StockAlertBadges';
import { StockMovementSheet } from '@/components/inventory/StockMovementSheet';
import { LoadState } from '@/components/LoadState';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MANUAL_STOCK_MOVEMENT_TYPES, type ManualStockMovementType } from '@/domain/inventory';
import type { Product } from '@/domain/schemas';
import { useProducts } from '@/hooks/useCatalog';
import { useProductMovements } from '@/hooks/useProductMovements';
import { useStockAlerts } from '@/hooks/useStockAlerts';
import { useToday } from '@/hooks/useToday';
import { cn } from '@/lib/utils';
import { formatBusinessDay } from '@/ui/format';
import { PAGE_TITLES, PRODUCT_MESSAGES, STOCK_MOVEMENT_LABELS } from '@/ui/messages';

const MOVEMENT_ICONS: Record<ManualStockMovementType, LucideIcon> = {
  restock: PackagePlus,
  usage: HandHelping,
  adjustment: ClipboardCheck,
};

function ProductDetails({ product }: { product: Product }) {
  const today = useToday();
  const alerts = useStockAlerts();
  const movements = useProductMovements(product.id);
  const [movementType, setMovementType] = useState<ManualStockMovementType | null>(null);
  const productAlerts = alerts.data.filter((alert) => alert.productId === product.id).map((alert) => alert.type);
  const details = [
    PRODUCT_MESSAGES.minStock(product.minStock),
    product.expiresOn && PRODUCT_MESSAGES.expiresOn(formatBusinessDay(product.expiresOn)),
  ].filter(Boolean);

  return (
    <>
      <PageHeader title={product.name} hasBackButton />

      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col">
            <span className="text-base text-muted-foreground">{PRODUCT_MESSAGES.inStockLabel}</span>
            <span
              className={cn('text-5xl font-bold tabular-nums', product.quantity < 0 && 'text-expense')}
              aria-live="polite"
            >
              {product.quantity}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{details.join(' · ')}</p>
          <StockAlertBadges alerts={productAlerts} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {MANUAL_STOCK_MOVEMENT_TYPES.map((type) => {
          const Icon = MOVEMENT_ICONS[type];
          return (
            <Button
              key={type}
              size="lg"
              variant={type === 'restock' ? 'default' : 'outline'}
              onClick={() => setMovementType(type)}
            >
              <Icon aria-hidden="true" /> {STOCK_MOVEMENT_LABELS[type]}
            </Button>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{PRODUCT_MESSAGES.historyTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadState isLoading={movements.isLoading} error={movements.error} />
          {!movements.isLoading && <MovementHistory movements={movements.data} />}
        </CardContent>
      </Card>

      {movementType && (
        <StockMovementSheet product={product} type={movementType} day={today} onClose={() => setMovementType(null)} />
      )}
    </>
  );
}

export function ProductPage() {
  const { productId } = useParams();
  const products = useProducts();
  const product = products.data.find((candidate) => candidate.id === productId);

  if (product) return <ProductDetails product={product} />;

  return (
    <>
      <PageHeader title={PAGE_TITLES.product} hasBackButton />
      <LoadState isLoading={products.isLoading} error={products.error} />
      {!products.isLoading && !products.error && (
        <Card>
          <CardContent className="flex flex-col gap-3">
            <p role="status">{PRODUCT_MESSAGES.notFound}</p>
            <Button asChild variant="outline">
              <Link to={PATHS.inventory}>{PRODUCT_MESSAGES.backToInventory}</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
