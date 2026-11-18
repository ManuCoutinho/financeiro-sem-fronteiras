import { describe, expect, it } from 'vitest';
import { createFormatters, parseAmountToCents, parseDecimalInput } from './format';

const { formatCurrency, formatDecimal, formatNumber, formatDate, formatTime, formatBusinessDay } = createFormatters({
  locale: 'pt-BR',
  currency: 'BRL',
});

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

describe('formatNumber', () => {
  it('drops trailing zeros and uses a decimal comma', () => {
    expect(formatNumber(3.5)).toBe('3,5');
    expect(formatNumber(0)).toBe('0');
  });
});

describe('parseDecimalInput', () => {
  it('reads Brazilian and plain decimals', () => {
    expect(parseDecimalInput('3,5')).toEqual({ value: 3.5, fractionDigits: 1 });
    expect(parseDecimalInput('3.5')).toEqual({ value: 3.5, fractionDigits: 1 });
    expect(parseDecimalInput(' 12 ')).toEqual({ value: 12, fractionDigits: 0 });
  });

  it('treats dots before a comma, or in groups of three, as thousands', () => {
    expect(parseDecimalInput('1.234,56')?.value).toBe(1234.56);
    expect(parseDecimalInput('1.500')?.value).toBe(1500);
  });

  it('rejects text, signs and empty input', () => {
    expect(parseDecimalInput('')).toBeNull();
    expect(parseDecimalInput('abc')).toBeNull();
    expect(parseDecimalInput('-5')).toBeNull();
    expect(parseDecimalInput('1,2,3')).toBeNull();
  });
});

describe('parseAmountToCents', () => {
  it('converts typed amounts to exact cents', () => {
    expect(parseAmountToCents('60')).toBe(6000);
    expect(parseAmountToCents('59,90')).toBe(5990);
    expect(parseAmountToCents('R$ 0,1')).toBe(10);
    expect(parseAmountToCents('1.234,56')).toBe(123456);
  });

  it('rejects fractions of a cent', () => {
    expect(parseAmountToCents('1,234')).toBeNull();
  });
});

describe('formatTime', () => {
  it('shows hours and minutes', () => {
    expect(formatTime(new Date(2026, 10, 18, 9, 5))).toBe('09:05');
  });
});

describe('formatBusinessDay', () => {
  it('formats a business day without shifting it to the previous day', () => {
    expect(formatBusinessDay('2026-11-18', "EEEE, d 'de' MMMM")).toBe('quarta-feira, 18 de novembro');
    expect(formatBusinessDay('2026-11-01')).toBe('01/11/2026');
  });
});
