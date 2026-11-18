import { describe, expect, it } from 'vitest';
import { getStockAlerts, groupStockAlerts, toSignedQuantity, type StockItem } from './inventory';

const TODAY = new Date('2026-11-12T12:00:00Z');
const ALERT_DAYS = 30;

const buildItem = (overrides: Partial<StockItem>): StockItem => ({
  id: 'serum',
  quantity: 10,
  minStock: 2,
  expiresOn: null,
  ...overrides,
});

const daysFromToday = (days: number) => new Date(TODAY.getTime() + days * 86_400_000);

describe('getStockAlerts', () => {
  it('flags negative stock instead of low stock', () => {
    expect(getStockAlerts([buildItem({ quantity: -1 })], TODAY, ALERT_DAYS)).toEqual([
      { productId: 'serum', type: 'negative' },
    ]);
  });

  it('flags low stock when quantity equals the minimum', () => {
    expect(getStockAlerts([buildItem({ quantity: 2 })], TODAY, ALERT_DAYS)).toEqual([
      { productId: 'serum', type: 'low' },
    ]);
  });

  it('flags products expiring within the alert window', () => {
    expect(getStockAlerts([buildItem({ expiresOn: daysFromToday(20) })], TODAY, ALERT_DAYS)).toEqual([
      { productId: 'serum', type: 'expiringSoon' },
    ]);
  });

  it('flags expired products', () => {
    expect(getStockAlerts([buildItem({ expiresOn: daysFromToday(-1) })], TODAY, ALERT_DAYS)).toEqual([
      { productId: 'serum', type: 'expired' },
    ]);
  });

  it('combines quantity and expiration alerts', () => {
    expect(getStockAlerts([buildItem({ quantity: 1, expiresOn: daysFromToday(5) })], TODAY, ALERT_DAYS)).toEqual([
      { productId: 'serum', type: 'low' },
      { productId: 'serum', type: 'expiringSoon' },
    ]);
  });

  it('returns no alerts for healthy stock', () => {
    expect(getStockAlerts([buildItem({ expiresOn: daysFromToday(90) })], TODAY, ALERT_DAYS)).toEqual([]);
  });
});

describe('toSignedQuantity', () => {
  it('adds restocked units', () => {
    expect(toSignedQuantity('restock', 5)).toBe(5);
    expect(toSignedQuantity('restock', -5)).toBe(5);
  });

  it('removes units used in a service', () => {
    expect(toSignedQuantity('usage', 2)).toBe(-2);
  });

  it('keeps the sign chosen for an adjustment', () => {
    expect(toSignedQuantity('adjustment', -3)).toBe(-3);
    expect(toSignedQuantity('adjustment', 3)).toBe(3);
  });
});

describe('groupStockAlerts', () => {
  it('collects every alert of a product in order', () => {
    const grouped = groupStockAlerts([
      { productId: 'serum', type: 'low' },
      { productId: 'glue', type: 'expired' },
      { productId: 'serum', type: 'expiringSoon' },
    ]);
    expect(grouped.get('serum')).toEqual(['low', 'expiringSoon']);
    expect(grouped.get('glue')).toEqual(['expired']);
    expect(grouped.has('tint')).toBe(false);
  });
});
