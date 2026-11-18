export type SalePreviewInput = {
  unitPriceCents: number;
  quantity: number;
  discountCents: number;
  stockQuantity: number | null;
};

export function previewSale({ unitPriceCents, quantity, discountCents, stockQuantity }: SalePreviewInput) {
  const grossCents = unitPriceCents * quantity;
  const remainingStock = stockQuantity === null ? null : stockQuantity - quantity;
  return {
    grossCents,
    totalCents: Math.max(grossCents - discountCents, 0),
    isDiscountValid: discountCents >= 0 && discountCents <= grossCents,
    remainingStock,
    needsStockCheck: remainingStock !== null && remainingStock < 0,
  };
}

export type SalePreview = ReturnType<typeof previewSale>;
