import { TESTIMONIALS } from './testimonials.mock';
import { BRANDS } from './brands.mock';
import { PRODUCTS, FLASH_SALE } from './products.mock';

describe('TESTIMONIALS', () => {
  it('has at least 3 entries', () => {
    expect(TESTIMONIALS.length).toBeGreaterThanOrEqual(3);
  });

  it('has at least one testimonial with null avatarUrl', () => {
    expect(TESTIMONIALS.some((t) => t.avatarUrl === null)).toBe(true);
  });

  it('has valid shapes: all have id, quote, authorName, rating', () => {
    for (const t of TESTIMONIALS) {
      expect(t.id).toBeTruthy();
      expect(t.quote).toBeTruthy();
      expect(t.authorName).toBeTruthy();
      expect(t.rating).toBeGreaterThanOrEqual(1);
      expect(t.rating).toBeLessThanOrEqual(5);
    }
  });
});

describe('BRANDS', () => {
  it('has at least 5 entries', () => {
    expect(BRANDS.length).toBeGreaterThanOrEqual(5);
  });

  it('has at least 2 brands with null logoUrl', () => {
    expect(BRANDS.filter((b) => b.logoUrl === null).length).toBeGreaterThanOrEqual(2);
  });

  it('has valid shapes: all have id and name', () => {
    for (const b of BRANDS) {
      expect(b.id).toBeTruthy();
      expect(b.name).toBeTruthy();
    }
  });
});

describe('FLASH_SALE', () => {
  it('has a valid future ISO date string for endsAt', () => {
    expect(FLASH_SALE.endsAt).toBeTruthy();
    const parsed = new Date(FLASH_SALE.endsAt).getTime();
    expect(Number.isNaN(parsed)).toBe(false);
    expect(parsed).toBeGreaterThan(Date.now());
  });

  it('has at least 2 products', () => {
    expect(FLASH_SALE.products.length).toBeGreaterThanOrEqual(2);
  });

  it('has all required fields', () => {
    expect(FLASH_SALE.id).toBeTruthy();
    expect(FLASH_SALE.name).toBeTruthy();
  });

  it('every flash sale product has a discount', () => {
    for (const p of FLASH_SALE.products) {
      expect(p.discountPercentage).toBeGreaterThan(0);
      expect(p.originalPrice).toBeGreaterThan(p.price);
    }
  });
});

describe('PRODUCTS — discount fields', () => {
  const sku001 = PRODUCTS.find((p) => p.sku === 'SKU-001');
  const sku003 = PRODUCTS.find((p) => p.sku === 'SKU-003');

  it('SKU-001 has originalPrice 249.99 and discountPercentage 20', () => {
    expect(sku001).toBeDefined();
    expect(sku001!.originalPrice).toBe(249.99);
    expect(sku001!.discountPercentage).toBe(20);
  });

  it('SKU-003 has originalPrice 1799.00 and discountPercentage 17', () => {
    expect(sku003).toBeDefined();
    expect(sku003!.originalPrice).toBe(1799.0);
    expect(sku003!.discountPercentage).toBe(17);
  });

  it('SKU-003 has a saleEndsAt date in the future', () => {
    expect(sku003).toBeDefined();
    expect(sku003!.saleEndsAt).toBe('2026-07-20T23:59:00.000Z');
    const parsed = new Date(sku003!.saleEndsAt!).getTime();
    expect(Number.isNaN(parsed)).toBe(false);
    expect(parsed).toBeGreaterThan(Date.now());
  });

  it('at least 2 products have bestseller tag', () => {
    const bestsellers = PRODUCTS.filter((p) => p.tags.includes('bestseller'));
    expect(bestsellers.length).toBeGreaterThanOrEqual(2);
  });
});
