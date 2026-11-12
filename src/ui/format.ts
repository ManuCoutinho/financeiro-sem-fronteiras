import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { env } from '../config/env';

const CENTS_PER_UNIT = 100;
const DEFAULT_DATE_PATTERN = 'dd/MM/yyyy';

export type FormatOptions = { locale: string; currency: string };

export function createFormatters({ locale, currency }: FormatOptions) {
  const currencyFormatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
  const decimalFormatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  });

  return {
    formatCurrency: (cents: number) => currencyFormatter.format(cents / CENTS_PER_UNIT),
    formatDecimal: (cents: number) => decimalFormatter.format(cents / CENTS_PER_UNIT),
    formatDate: (date: Date, pattern = DEFAULT_DATE_PATTERN) => format(date, pattern, { locale: ptBR }),
  };
}

export const { formatCurrency, formatDecimal, formatDate } = createFormatters(env);
