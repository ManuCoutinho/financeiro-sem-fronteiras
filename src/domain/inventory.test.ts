import { describe, expect, it } from 'vitest';
import { getStockAlerts, type StockItem } from './inventory';

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
