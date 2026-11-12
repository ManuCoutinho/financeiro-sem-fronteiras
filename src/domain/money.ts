export const PAYMENT_METHODS = ['pix', 'cash', 'debit', 'credit'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

const PERCENT = 100;

export function calculateNet(grossCents: number, discountCents: number, feePercent: number) {
  const baseCents = grossCents - discountCents;
  const feeCents = Math.round((baseCents * feePercent) / PERCENT);
  return { feeCents, netCents: baseCents - feeCents };
}
