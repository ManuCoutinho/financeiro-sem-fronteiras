import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { env } from '../config/env';

const CENTS_PER_UNIT = 100;
const DEFAULT_DATE_PATTERN = 'dd/MM/yyyy';
const TIME_PATTERN = 'HH:mm';
const MAX_CENT_DIGITS = 2;
const MAX_INPUT_FRACTION_DIGITS = 2;
// Up to R$ 999.999.999,99, far beyond any price in the studio.
const MAX_MONEY_DIGITS = 11;

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
  const moneyInputFormatter = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return {
    /** Money field text for a stored value: 2550 → "25,50", 123456 → "1.234,56". */
    formatMoneyInput: (cents: number) => moneyInputFormatter.format(cents / CENTS_PER_UNIT),
    /**
     * Money mask: only digits count and the value fills from the cents, as in banking apps.
     * Typing 2, 5, 5, 0 shows "0,02", "0,25", "2,55", "25,50".
     */
    maskMoneyInput: (text: string) => {
      const digits = text.replace(/\D/g, '').replace(/^0+/, '').slice(0, MAX_MONEY_DIGITS);
      return digits === '' ? '' : moneyInputFormatter.format(Number(digits) / CENTS_PER_UNIT);
    },
    formatCurrency: (cents: number) => currencyFormatter.format(cents / CENTS_PER_UNIT),
    formatDecimal: (cents: number) => decimalFormatter.format(cents / CENTS_PER_UNIT),
    formatNumber: (value: number) => numberFormatter.format(value),
    formatDate: (date: Date, pattern = DEFAULT_DATE_PATTERN) => format(date, pattern, { locale: ptBR }),
    formatTime: (date: Date) => format(date, TIME_PATTERN, { locale: ptBR }),
    // parseISO reads a bare day as local midnight, so the label never shifts to the previous day.
    formatBusinessDay: (day: string, pattern = DEFAULT_DATE_PATTERN) =>
      format(parseISO(day), pattern, { locale: ptBR }),
  };
}

export const {
  formatCurrency,
  formatDecimal,
  formatNumber,
  formatDate,
  formatTime,
  formatBusinessDay,
  formatMoneyInput,
  maskMoneyInput,
} = createFormatters(env);

const MAX_PERCENT_INTEGER_DIGITS = 3;

/**
 * Percent mask for whole percentages as people say them ("3,5" means 3.5%): digits and one comma,
 * at most two decimals. A dot is read as the comma.
 */
export function maskPercentInput(text: string): string {
  const [whole = '', ...fraction] = text
    .replaceAll('.', ',')
    .replace(/[^\d,]/g, '')
    .split(',');
  const integer = whole.replace(/^0+(?=\d)/, '').slice(0, MAX_PERCENT_INTEGER_DIGITS);
  if (fraction.length === 0) return integer;
  return `${integer || '0'},${fraction.join('').slice(0, MAX_INPUT_FRACTION_DIGITS)}`;
}

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
