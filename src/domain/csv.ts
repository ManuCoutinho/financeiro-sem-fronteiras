import type { Transaction } from './cashRegister';

export type CsvRow = Transaction & { day: string; description: string; quantity: number };

export type CsvOptions = {
  delimiter: string;
  header: readonly string[];
  formatAmount: (cents: number) => string;
};

const UTF8_BOM = '\uFEFF';

const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;

export function transactionsToCsv(rows: CsvRow[], { delimiter, header, formatAmount }: CsvOptions): string {
  const lines = rows
    .filter((row) => !row.isVoided)
    .map((row) =>
      [
        row.day,
        row.type,
        quote(row.description),
        row.quantity,
        row.paymentMethod,
        formatAmount(row.grossCents),
        formatAmount(row.discountCents),
        formatAmount(row.feeCents),
        formatAmount(row.netCents),
      ].join(delimiter),
    );
  return UTF8_BOM + [header.join(delimiter), ...lines].join('\n');
}
