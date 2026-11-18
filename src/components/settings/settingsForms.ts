import { z } from 'zod';
import { PAYMENT_METHODS } from '@/domain/money';
import { NAME_MAX_LENGTH, type BusinessSettings, type Product, type Service } from '@/domain/schemas';
import { formatDecimal, formatNumber, parseAmountToCents, parseDecimalInput } from '@/ui/format';
import { FORM_MESSAGES } from '@/ui/messages';

const MAX_PERCENT = 100;
const WHOLE_NUMBER = /^\d+$/;
const BUSINESS_DAY = /^\d{4}-\d{2}-\d{2}$/;

const name = z
  .string()
  .trim()
  .min(1, { error: FORM_MESSAGES.required })
  .max(NAME_MAX_LENGTH, { error: FORM_MESSAGES.tooLong });

const amount = z.string().transform((text, context) => {
  const cents = parseAmountToCents(text);
  if (cents !== null) return cents;
  context.addIssue({ code: 'custom', message: FORM_MESSAGES.invalidAmount });
  return z.NEVER;
});

const percent = z.string().transform((text, context) => {
  const parsed = parseDecimalInput(text);
  if (parsed && parsed.value <= MAX_PERCENT) return parsed.value;
  context.addIssue({ code: 'custom', message: FORM_MESSAGES.invalidPercent });
  return z.NEVER;
});

const wholeNumber = z
  .string()
  .trim()
  .regex(WHOLE_NUMBER, { error: FORM_MESSAGES.invalidWholeNumber })
  .transform(Number);

const positiveWholeNumber = wholeNumber.refine((value) => value > 0, { error: FORM_MESSAGES.invalidPositiveNumber });

const optionalDay = z
  .string()
  .refine((text) => text === '' || BUSINESS_DAY.test(text), { error: FORM_MESSAGES.invalidDate })
  .transform((text) => (text === '' ? null : text));

export const serviceFormSchema = z.object({ name, price: amount, isActive: z.boolean() });
export type ServiceFormValues = z.input<typeof serviceFormSchema>;

export const toServiceFormValues = (service: Service | null): ServiceFormValues => ({
  name: service?.name ?? '',
  price: service ? formatDecimal(service.priceCents) : '',
  isActive: service?.isActive ?? true,
});

export const productFormSchema = z.object({
  name,
  salePrice: amount,
  cost: amount,
  quantity: wholeNumber,
  minStock: wholeNumber,
  expiresOn: optionalDay,
  isActive: z.boolean(),
});
export type ProductFormValues = z.input<typeof productFormSchema>;

export const toProductFormValues = (product: Product | null): ProductFormValues => ({
  name: product?.name ?? '',
  salePrice: product ? formatDecimal(product.salePriceCents) : '',
  cost: product ? formatDecimal(product.costCents) : '',
  quantity: String(Math.max(product?.quantity ?? 0, 0)),
  minStock: String(product?.minStock ?? 0),
  expiresOn: product?.expiresOn ?? '',
  isActive: product?.isActive ?? true,
});

export const businessFormSchema = z.object({
  name,
  feePercentByMethod: z.record(z.enum(PAYMENT_METHODS), percent),
  expirationAlertDays: positiveWholeNumber,
});
export type BusinessFormValues = z.input<typeof businessFormSchema>;

export const toBusinessFormValues = (settings: BusinessSettings): BusinessFormValues => ({
  name: settings.name,
  feePercentByMethod: Object.fromEntries(
    PAYMENT_METHODS.map((method) => [method, formatNumber(settings.feePercentByMethod[method])]),
  ) as BusinessFormValues['feePercentByMethod'],
  expirationAlertDays: String(settings.expirationAlertDays),
});
