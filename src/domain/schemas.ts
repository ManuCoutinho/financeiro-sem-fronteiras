import { z } from 'zod';
import { EXPENSE_CATEGORIES, SALE_TYPES, TRANSACTION_TYPES } from './cashRegister';
import { MANUAL_STOCK_MOVEMENT_TYPES, STOCK_MOVEMENT_TYPES } from './inventory';
import { PAYMENT_METHODS } from './money';

export const NAME_MAX_LENGTH = 60;
const TEXT_MAX_LENGTH = 200;
const MAX_FEE_PERCENT = 100;

const cents = z.number().int().nonnegative();
const positiveCents = z.number().int().positive();
const quantity = z.number().int().positive();
const name = z.string().trim().min(1).max(NAME_MAX_LENGTH);
const optionalText = z.string().trim().max(TEXT_MAX_LENGTH);
const id = z.string().min(1);
const isActive = z.boolean();
const sortOrder = z.number().int();
const paymentMethod = z.enum(PAYMENT_METHODS);
const feePercent = z.number().min(0).max(MAX_FEE_PERCENT);

export const businessDaySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const serviceSchema = z.object({ name, priceCents: cents, isActive, sortOrder });
export type ServiceInput = z.infer<typeof serviceSchema>;
export type Service = ServiceInput & { id: string };

export const productSchema = z.object({
  name,
  salePriceCents: cents,
  costCents: cents,
  quantity: z.number().int(),
  minStock: z.number().int().nonnegative(),
  expiresOn: businessDaySchema.nullable(),
  isActive,
  sortOrder,
});
export type ProductInput = z.infer<typeof productSchema>;
export type Product = ProductInput & { id: string };

export const businessSettingsSchema = z.object({
  name,
  feePercentByMethod: z.record(paymentMethod, feePercent),
  expirationAlertDays: z.number().int().positive(),
});
export type BusinessSettings = z.infer<typeof businessSettingsSchema>;

export const newSaleSchema = z
  .object({
    type: z.enum(SALE_TYPES),
    itemId: id,
    description: name,
    quantity,
    unitPriceCents: cents,
    discountCents: cents,
    paymentMethod,
    feePercent,
    day: businessDaySchema,
  })
  .refine((sale) => sale.discountCents <= sale.unitPriceCents * sale.quantity, { path: ['discountCents'] });
export type NewSale = z.infer<typeof newSaleSchema>;

export const newExpenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES),
  description: optionalText,
  amountCents: positiveCents,
  paymentMethod,
  day: businessDaySchema,
});
export type NewExpense = z.infer<typeof newExpenseSchema>;

export const newStockMovementSchema = z
  .object({
    productId: id,
    type: z.enum(MANUAL_STOCK_MOVEMENT_TYPES),
    quantity: z
      .number()
      .int()
      .refine((value) => value !== 0),
    reason: optionalText,
    day: businessDaySchema,
  })
  .refine((movement) => movement.type !== 'adjustment' || movement.reason.length > 0, { path: ['reason'] });
export type NewStockMovement = z.infer<typeof newStockMovementSchema>;

export const cashCountSchema = z.object({ openingCashCents: cents, countedCashCents: cents });

const signedCents = z.number().int();

export const storedTransactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  itemId: z.string(),
  description: z.string(),
  quantity,
  grossCents: cents,
  discountCents: cents,
  feeCents: signedCents,
  netCents: signedCents,
  paymentMethod,
  expenseCategory: z.enum(EXPENSE_CATEGORIES).nullable().default(null),
  day: businessDaySchema,
  isVoided: z.boolean(),
});
export type StoredTransaction = z.infer<typeof storedTransactionSchema>;

export const storedStockMovementSchema = z.object({
  productId: id,
  type: z.enum(STOCK_MOVEMENT_TYPES),
  quantity: z.number().int(),
  reason: z.string().nullable().default(null),
  transactionId: z.string().nullable().default(null),
  day: businessDaySchema,
});
export type StoredStockMovement = z.infer<typeof storedStockMovementSchema>;

export const storedCashClosingSchema = z
  .object({
    totalsByMethod: z.record(paymentMethod, signedCents),
    salesCents: signedCents,
    feesCents: signedCents,
    netCents: signedCents,
    servicesCents: signedCents,
    productsCents: signedCents,
    expensesCents: signedCents,
    openingCashCents: cents,
    expectedCashCents: signedCents,
    countedCashCents: cents,
    differenceCents: signedCents,
    isClosed: z.boolean(),
    reopenings: z.array(z.unknown()).default([]),
  })
  .transform(({ reopenings, ...closing }) => ({ ...closing, reopeningCount: reopenings.length }));
export type StoredCashClosing = z.infer<typeof storedCashClosingSchema>;
