import type { Transaction, TransactionType } from './cashRegister';
import type { PaymentMethod } from './money';

export type CsvRow = Transaction & { day: string; description: string; quantity: number };

export type CsvOptions = {
  delimiter: string;
  header: readonly string[];
  formatAmount: (cents: number) => string;
  typeLabels: Record<TransactionType, string>;
  paymentMethodLabels: Record<PaymentMethod, string>;
};

const UTF8_BOM = '﻿';

const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;

export function transactionsToCsv(
  rows: CsvRow[],
  { delimiter, header, formatAmount, typeLabels, paymentMethodLabels }: CsvOptions,
): string {
  const lines = rows
    .filter((row) => !row.isVoided)
    .map((row) =>
      [
        row.day,
        typeLabels[row.type],
        quote(row.description),
        row.quantity,
        paymentMethodLabels[row.paymentMethod],
        formatAmount(row.grossCents),
        formatAmount(row.discountCents),
        formatAmount(row.feeCents),
        formatAmount(row.netCents),
      ].join(delimiter),
    );
  return UTF8_BOM + [header.join(delimiter), ...lines].join('\n');
}
