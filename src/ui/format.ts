import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { env } from '../config/env';

const CENTS_PER_UNIT = 100;
const DEFAULT_DATE_PATTERN = 'dd/MM/yyyy';
const MAX_CENT_DIGITS = 2;
const MAX_INPUT_FRACTION_DIGITS = 2;

export type FormatOptions = { locale: string; currency: string };

export function createFormatters({ locale, currency }: FormatOptions) {
  const currencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
  const decimalFormatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  });
  const numberFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: MAX_INPUT_FRACTION_DIGITS,
    useGrouping: false,
  });

  return {
    formatCurrency: (cents: number) => currencyFormatter.format(cents / CENTS_PER_UNIT),
    formatDecimal: (cents: number) => decimalFormatter.format(cents / CENTS_PER_UNIT),
    formatNumber: (value: number) => numberFormatter.format(value),
    formatDate: (date: Date, pattern = DEFAULT_DATE_PATTERN) => format(date, pattern, { locale: ptBR }),
  };
}

export const { formatCurrency, formatDecimal, formatNumber, formatDate } = createFormatters(env);

const THOUSANDS_ONLY = /^\d{1,3}(\.\d{3})+$/;
const PLAIN_DECIMAL = /^\d+(\.(\d+))?$/;

// Accepts what people type on a Brazilian keyboard: "60", "59,90", "1.234,56" and also "59.90".
export function parseDecimalInput(text: string): { value: number; fractionDigits: number } | null {
  const compact = text.replace(/\s|R\$/g, '');
  const normalized = compact.includes(',')
    ? compact.replaceAll('.', '').replace(',', '.')
    : THOUSANDS_ONLY.test(compact)
      ? compact.replaceAll('.', '')
      : compact;
  const match = PLAIN_DECIMAL.exec(normalized);
  if (!match) return null;
  return { value: Number(normalized), fractionDigits: match[2]?.length ?? 0 };
}

export function parseAmountToCents(text: string): number | null {
  const parsed = parseDecimalInput(text);
  if (!parsed || parsed.fractionDigits > MAX_CENT_DIGITS) return null;
  return Math.round(parsed.value * CENTS_PER_UNIT);
}
