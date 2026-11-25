import { describe, expect, it } from 'vitest';
import { createFormatters, maskPercentInput, parseAmountToCents, parseDecimalInput } from './format';

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

describe('money and percent masks', () => {
  const { maskMoneyInput, formatMoneyInput } = createFormatters({ locale: 'pt-BR', currency: 'BRL' });

  it('fills the money value from the cents, as in banking apps', () => {
    expect(['2', '25', '255', '2550'].map(maskMoneyInput)).toEqual(['0,02', '0,25', '2,55', '25,50']);
    expect(maskMoneyInput('123456')).toBe('1.234,56');
  });

  it('ignores anything that is not a digit and keeps the result readable by the parser', () => {
    expect(maskMoneyInput('R$ 15,90')).toBe('15,90');
    expect(maskMoneyInput('abc')).toBe('');
    expect(maskMoneyInput('000')).toBe('');
    expect(parseAmountToCents(maskMoneyInput('123456'))).toBe(123456);
  });

  it('formats a stored value for a money field', () => {
    expect(formatMoneyInput(6900)).toBe('69,00');
    expect(parseAmountToCents(formatMoneyInput(150000))).toBe(150000);
  });

  it('keeps whole percentages with up to two decimals', () => {
    expect(maskPercentInput('3,5')).toBe('3,5');
    expect(maskPercentInput('3.49')).toBe('3,49');
    expect(maskPercentInput('3,499')).toBe('3,49');
    expect(maskPercentInput('04')).toBe('4');
    expect(maskPercentInput(',5')).toBe('0,5');
    expect(maskPercentInput('2%a')).toBe('2');
    expect(maskPercentInput('1,2,3')).toBe('1,23');
  });
});
