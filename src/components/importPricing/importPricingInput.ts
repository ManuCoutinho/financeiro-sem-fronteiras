import {
  calculateMarginPercent,
  calculateTotalCostCents,
  calculateUnitCostCents,
  type ImportPurchase,
} from '@/domain/importPricing';
import { parseAmountToCents, parseDecimalInput } from '@/ui/format';
import { FORM_MESSAGES, IMPORT_PRICING_MESSAGES } from '@/ui/messages';

export const IMPORT_PRICING_FIELDS = [
  'foreignAmount',
  'exchangeRate',
  'shipping',
  'taxes',
  'quantity',
  'salePrice',
] as const;
export type ImportPricingField = (typeof IMPORT_PRICING_FIELDS)[number];
export type ImportPricingValues = Record<ImportPricingField, string>;

export const EMPTY_IMPORT_PRICING_VALUES = Object.fromEntries(
  IMPORT_PRICING_FIELDS.map((field) => [field, '']),
) as ImportPricingValues;

const WHOLE_NUMBER = /^\d+$/;

type Parsed<T> = { value: T | null; error?: string };

// Empty fields are not errors yet: the result simply waits until they are filled.
const parsePositiveDecimal = (text: string): Parsed<number> => {
  if (text.trim() === '') return { value: null };
  const parsed = parseDecimalInput(text);
  return parsed && parsed.value > 0
    ? { value: parsed.value }
    : { value: null, error: IMPORT_PRICING_MESSAGES.invalidNumber };
};

const parseOptionalCents = (text: string): Parsed<number> => {
  if (text.trim() === '') return { value: 0 };
  const cents = parseAmountToCents(text);
  return cents === null ? { value: null, error: FORM_MESSAGES.invalidAmount } : { value: cents };
};

const parseQuantity = (text: string): Parsed<number> => {
  const trimmed = text.trim();
  if (trimmed === '') return { value: null };
  return WHOLE_NUMBER.test(trimmed) && Number(trimmed) > 0
    ? { value: Number(trimmed) }
    : { value: null, error: FORM_MESSAGES.invalidPositiveNumber };
};

const parseSalePrice = (text: string): Parsed<number> => {
  if (text.trim() === '') return { value: null };
  const cents = parseAmountToCents(text);
  return cents !== null && cents > 0 ? { value: cents } : { value: null, error: FORM_MESSAGES.invalidAmount };
};

export type ImportPricingResult = {
  errors: Partial<Record<ImportPricingField, string>>;
  unitCostCents: number | null;
  totalCostCents: number | null;
  salePriceCents: number | null;
  marginPercent: number | null;
  profitCents: number | null;
};

export function evaluateImportPricing(values: ImportPricingValues): ImportPricingResult {
  const fields = {
    foreignAmount: parsePositiveDecimal(values.foreignAmount),
    exchangeRate: parsePositiveDecimal(values.exchangeRate),
    shipping: parseOptionalCents(values.shipping),
    taxes: parseOptionalCents(values.taxes),
    quantity: parseQuantity(values.quantity),
    salePrice: parseSalePrice(values.salePrice),
  };
  const errors = Object.fromEntries(
    Object.entries(fields)
      .filter(([, parsed]) => parsed.error)
      .map(([field, parsed]) => [field, parsed.error]),
  ) as ImportPricingResult['errors'];

  const { foreignAmount, exchangeRate, shipping, taxes, quantity, salePrice } = fields;
  const purchase: ImportPurchase | null =
    foreignAmount.value !== null &&
    exchangeRate.value !== null &&
    shipping.value !== null &&
    taxes.value !== null &&
    quantity.value !== null
      ? {
          foreignAmount: foreignAmount.value,
          exchangeRate: exchangeRate.value,
          shippingCents: shipping.value,
          taxesCents: taxes.value,
          quantity: quantity.value,
        }
      : null;
  const unitCostCents = purchase ? calculateUnitCostCents(purchase) : null;
  const salePriceCents = salePrice.value;
  const margin =
    unitCostCents !== null && salePriceCents !== null
      ? {
          marginPercent: calculateMarginPercent(salePriceCents, unitCostCents),
          profitCents: salePriceCents - unitCostCents,
        }
      : { marginPercent: null, profitCents: null };

  return {
    errors,
    unitCostCents,
    totalCostCents: purchase ? calculateTotalCostCents(purchase) : null,
    salePriceCents,
    ...margin,
  };
}
