import { describe, expect, it } from 'vitest';
import { calculateNet } from './money';

describe('calculateNet', () => {
  it('deducts the fee rounded to the cent', () => {
    expect(calculateNet(8000, 0, 3.5)).toEqual({ feeCents: 280, netCents: 7720 });
  });

  it('applies the fee after the discount', () => {
    expect(calculateNet(10000, 1000, 2)).toEqual({ feeCents: 180, netCents: 8820 });
  });

  it('rounds half fees to the nearest cent', () => {
    expect(calculateNet(1050, 0, 5)).toEqual({ feeCents: 53, netCents: 997 });
  });

  it('keeps the full amount when the fee is zero', () => {
    expect(calculateNet(6000, 0, 0)).toEqual({ feeCents: 0, netCents: 6000 });
  });
});
