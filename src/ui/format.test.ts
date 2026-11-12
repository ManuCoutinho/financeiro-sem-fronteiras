import { describe, expect, it } from 'vitest';
import { createFormatters } from './format';

const { formatCurrency, formatDecimal, formatDate } = createFormatters({ locale: 'pt-BR', currency: 'BRL' });

describe('createFormatters', () => {
  it('formats cents as Brazilian currency', () => {
    expect(formatCurrency(6900).replace(/\s/g, ' ')).toBe('R$ 69,00');
  });

  it('formats cents with a decimal comma and no grouping', () => {
    expect(formatDecimal(123456)).toBe('1234,56');
  });

  it('formats dates in Portuguese', () => {
    expect(formatDate(new Date(2026, 10, 12), "d 'de' MMMM")).toBe('12 de novembro');
  });
});
