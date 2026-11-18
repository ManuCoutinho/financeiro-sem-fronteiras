import { describe, expect, it } from 'vitest';
import { dayToDate, getMonthDays, getMonthRange, shiftMonth, toBusinessDay, toBusinessMonth } from './businessDay';

describe('toBusinessDay', () => {
  it('uses the local day of the given time zone', () => {
    const lateNightUtc = new Date('2026-11-13T02:30:00Z');
    expect(toBusinessDay(lateNightUtc, 'America/Sao_Paulo')).toBe('2026-11-12');
    expect(toBusinessDay(lateNightUtc, 'UTC')).toBe('2026-11-13');
  });
});

describe('toBusinessMonth', () => {
  it('keeps the year and month of a business day', () => {
    expect(toBusinessMonth('2026-11-12')).toBe('2026-11');
  });
});

describe('dayToDate', () => {
  it('anchors the day at UTC midnight', () => {
    expect(dayToDate('2026-11-12').toISOString()).toBe('2026-11-12T00:00:00.000Z');
  });
});

describe('getMonthDays', () => {
  it('lists every day of the month', () => {
    const days = getMonthDays('2026-11');
    expect(days).toHaveLength(30);
    expect(days[0]).toBe('2026-11-01');
    expect(days[29]).toBe('2026-11-30');
  });

  it('handles leap years', () => {
    expect(getMonthDays('2028-02')).toHaveLength(29);
    expect(getMonthDays('2027-02')).toHaveLength(28);
  });
});

describe('getMonthRange', () => {
  it('returns the first and last day of the month', () => {
    expect(getMonthRange('2026-12')).toEqual({ firstDay: '2026-12-01', lastDay: '2026-12-31' });
  });
});

describe('shiftMonth', () => {
  it('moves across year boundaries', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-11', 0)).toBe('2026-11');
  });
});
