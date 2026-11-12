export const STOCK_MOVEMENT_TYPES = ['restock', 'sale', 'adjustment', 'usage', 'reversal'] as const;
export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];

export const STOCK_ALERT_TYPES = ['negative', 'low', 'expired', 'expiringSoon'] as const;
export type StockAlertType = (typeof STOCK_ALERT_TYPES)[number];

export type StockItem = { id: string; quantity: number; minStock: number; expiresOn: Date | null };
export type StockAlert = { productId: string; type: StockAlertType };

const MS_PER_DAY = 86_400_000;

function quantityAlert(item: StockItem): StockAlertType | null {
  if (item.quantity < 0) return 'negative';
  if (item.quantity <= item.minStock) return 'low';
  return null;
}

function expirationAlert(item: StockItem, today: Date, alertDays: number): StockAlertType | null {
  if (!item.expiresOn) return null;
  const expiresAt = item.expiresOn.getTime();
  if (expiresAt < today.getTime()) return 'expired';
  if (expiresAt <= today.getTime() + alertDays * MS_PER_DAY) return 'expiringSoon';
  return null;
}

export function getStockAlerts(items: StockItem[], today: Date, alertDays: number): StockAlert[] {
  return items.flatMap((item) =>
    [quantityAlert(item), expirationAlert(item, today, alertDays)]
      .filter((type): type is StockAlertType => type !== null)
      .map((type) => ({ productId: item.id, type })),
  );
}
