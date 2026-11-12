const CENTS_PER_UNIT = 100;
const PERCENT = 100;

export type ImportPurchase = {
  foreignAmount: number;
  exchangeRate: number;
  shippingCents: number;
  taxesCents: number;
  quantity: number;
};

export function calculateUnitCostCents(purchase: ImportPurchase): number {
  const purchaseCents = Math.round(purchase.foreignAmount * purchase.exchangeRate * CENTS_PER_UNIT);
  return Math.round((purchaseCents + purchase.shippingCents + purchase.taxesCents) / purchase.quantity);
}

export const calculateMarginPercent = (salePriceCents: number, costCents: number) =>
  ((salePriceCents - costCents) / salePriceCents) * PERCENT;
