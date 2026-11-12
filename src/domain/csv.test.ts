import { describe, expect, it } from 'vitest';
import { transactionsToCsv, type CsvRow } from './csv';

const row: CsvRow = {
  day: '2026-11-12',
  type: 'product',
  description: 'Sérum "importado"',
  quantity: 2,
  paymentMethod: 'credit',
  isVoided: false,
  grossCents: 8000,
  discountCents: 0,
  feeCents: 280,
  netCents: 7720,
};

const options = {
  delimiter: ';',
  header: ['day', 'type'],
  formatAmount: (cents: number) => (cents / 100).toFixed(2).replace('.', ','),
};

describe('transactionsToCsv', () => {
  it('starts with a BOM and the header', () => {
    expect(transactionsToCsv([], options)).toBe('\uFEFFday;type');
  });

  it('escapes quotes and formats amounts', () => {
    const [, line] = transactionsToCsv([row], options).split('\n');
    expect(line).toBe('2026-11-12;product;"Sérum ""importado""";2;credit;80,00;0,00;2,80;77,20');
  });

  it('skips voided transactions', () => {
    expect(transactionsToCsv([{ ...row, isVoided: true }], options).split('\n')).toHaveLength(1);
  });
});
