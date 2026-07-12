/**
 * Utility tests for FlashSaleSection data contracts and countdown logic.
 *
 * Component-level rendering (DOM states) is covered by Playwright E2E tests.
 * This file validates the FlashSale model shape and the pure countdown
 * formatter exported from flash-sale-section.component.ts.
 */
import type { FlashSale, Product } from '../data/models';
import { formatCountdown } from './flash-sale-section.util';

describe('FlashSaleSection – data contract', () => {
  const productTemplate: Product = {
    sku: 'sku-fs-1',
    name: 'Flash Product',
    description: 'On sale now',
    price: 49.99,
    currency: 'USD',
    categoryId: 'cat-1',
    imageUrl: null,
    stock: 10,
    rating: 4.3,
    tags: ['sale'],
    originalPrice: 99.99,
    discountPercentage: 50,
  };

  it('instantiates FlashSale with required fields', () => {
    const sale: FlashSale = {
      id: 'flash-001',
      name: 'Summer Blowout',
      endsAt: '2026-07-14T23:59:00.000Z',
      products: [productTemplate],
    };
    expect(sale.id).toBe('flash-001');
    expect(sale.name).toBe('Summer Blowout');
    expect(sale.endsAt).toBe('2026-07-14T23:59:00.000Z');
    expect(sale.products).toHaveLength(1);
    expect(sale.products[0].sku).toBe('sku-fs-1');
  });

  it('FlashSale can have empty products array', () => {
    const sale: FlashSale = {
      id: 'flash-002',
      name: 'Empty Sale',
      endsAt: '2026-07-14T23:59:00.000Z',
      products: [],
    };
    expect(sale.products).toHaveLength(0);
  });
});

describe('FlashSaleSection – formatCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('formats active sale under 24 hours as HH:MM:SS', () => {
    // Set "now" to a known time, endsAt 3h 45m 12s in the future
    const now = new Date('2026-07-14T12:00:00.000Z');
    jest.setSystemTime(now);
    const endsAt = '2026-07-14T15:45:12.000Z';
    expect(formatCountdown(endsAt)).toEqual({ text: '03:45:12', ended: false });
  });

  it('formats active sale at exactly 24 hours as HH:MM:SS', () => {
    const now = new Date('2026-07-14T00:00:00.000Z');
    jest.setSystemTime(now);
    const endsAt = '2026-07-15T00:00:00.000Z';
    expect(formatCountdown(endsAt)).toEqual({ text: '24:00:00', ended: false });
  });

  it('formats sale over 24 hours as D:HH:MM:SS', () => {
    const now = new Date('2026-07-12T00:00:00.000Z');
    jest.setSystemTime(now);
    // 2 days, 12 hours, 30 minutes, 0 seconds in the future
    const endsAt = '2026-07-14T12:30:00.000Z';
    expect(formatCountdown(endsAt)).toEqual({ text: '2:12:30:00', ended: false });
  });

  it('returns ended=true for past endsAt', () => {
    const now = new Date('2026-07-14T12:00:00.000Z');
    jest.setSystemTime(now);
    const endsAt = '2026-07-14T11:59:59.000Z';
    expect(formatCountdown(endsAt)).toEqual({ text: 'Ended', ended: true });
  });

  it('returns ended=true when diff is exactly 0', () => {
    const now = new Date('2026-07-14T12:00:00.000Z');
    jest.setSystemTime(now);
    const endsAt = '2026-07-14T12:00:00.000Z';
    expect(formatCountdown(endsAt)).toEqual({ text: 'Ended', ended: true });
  });

  it('pads single-digit hours, minutes, seconds', () => {
    const now = new Date('2026-07-14T12:00:00.000Z');
    jest.setSystemTime(now);
    const endsAt = '2026-07-14T12:03:05.000Z';
    expect(formatCountdown(endsAt)).toEqual({ text: '00:03:05', ended: false });
  });
});
