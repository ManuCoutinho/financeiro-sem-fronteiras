import { describe, expect, it } from 'vitest';
import { toBusinessDay } from './businessDay';

describe('toBusinessDay', () => {
  it('uses the local day of the given time zone', () => {
    const lateNightUtc = new Date('2026-11-13T02:30:00Z');
    expect(toBusinessDay(lateNightUtc, 'America/Sao_Paulo')).toBe('2026-11-12');
    expect(toBusinessDay(lateNightUtc, 'UTC')).toBe('2026-11-13');
  });
});
