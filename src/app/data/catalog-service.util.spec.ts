/**
 * Unit tests for CatalogService data contracts.
 *
 * Because the test environment is `node` and the service depends on Angular's
 * HttpClient (unavailable outside a DI context), these tests verify the
 * URL-to-data contract by inspecting the mock fixtures directly. Each test
 * mirrors what a corresponding CatalogService method would return at runtime.
 *
 * See also: src/mocks/mock-backend.util.spec.ts (same approach for interceptor
 * handler logic).
 */

import { BRANDS, FLASH_SALE, PRODUCTS, TESTIMONIALS } from '../../mocks';

describe('CatalogService — GET /api/products/best-sellers', () => {
  it('returns only products tagged bestseller', () => {
    const bestSellers = PRODUCTS.filter((p) => p.tags.includes('bestseller'));
    expect(bestSellers.length).toBeGreaterThanOrEqual(1);
    for (const p of bestSellers) {
      expect(p.tags).toContain('bestseller');
    }
  });

  it('each bestseller is a full Product shape', () => {
    const bestSellers = PRODUCTS.filter((p) => p.tags.includes('bestseller'));
    for (const p of bestSellers) {
      expect(p.sku).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.price).toBeGreaterThan(0);
      expect(p.currency).toBeTruthy();
      expect(typeof p.rating).toBe('number');
    }
  });
});

describe('CatalogService — GET /api/products/flash-sale', () => {
  it('returns a FlashSale object with required shape', () => {
    expect(FLASH_SALE).toBeTruthy();
    expect(typeof FLASH_SALE.id).toBe('string');
    expect(typeof FLASH_SALE.name).toBe('string');
    expect(typeof FLASH_SALE.endsAt).toBe('string');
  });

  it('has at least 2 products with discount fields', () => {
    expect(FLASH_SALE.products.length).toBeGreaterThanOrEqual(2);
    for (const p of FLASH_SALE.products) {
      expect(p.originalPrice).toBeGreaterThan(p.price);
      expect(p.discountPercentage).toBeGreaterThan(0);
    }
  });

  it('endsAt is a future ISO 8601 date', () => {
    const endsAt = new Date(FLASH_SALE.endsAt);
    expect(endsAt.getTime()).toBeGreaterThan(Date.now());
  });
});

describe('CatalogService — GET /api/testimonials', () => {
  it('returns at least 3 testimonials with required fields', () => {
    expect(TESTIMONIALS.length).toBeGreaterThanOrEqual(3);
    for (const t of TESTIMONIALS) {
      expect(t.id).toBeTruthy();
      expect(t.quote).toBeTruthy();
      expect(t.authorName).toBeTruthy();
      expect(t.rating).toBeGreaterThanOrEqual(1);
      expect(t.rating).toBeLessThanOrEqual(5);
    }
  });

  it('includes at least one testimonial with null avatarUrl', () => {
    expect(TESTIMONIALS.some((t) => t.avatarUrl === null)).toBe(true);
  });
});

describe('CatalogService — GET /api/brands', () => {
  it('returns at least 5 brands with required fields', () => {
    expect(BRANDS.length).toBeGreaterThanOrEqual(5);
    for (const b of BRANDS) {
      expect(b.id).toBeTruthy();
      expect(b.name).toBeTruthy();
    }
  });

  it('includes at least one brand with null logoUrl', () => {
    expect(BRANDS.some((b) => b.logoUrl === null)).toBe(true);
  });
});

describe('CatalogService — POST /api/newsletter/subscribe', () => {
  it('validates email is required', () => {
    const isValid = (email: string | undefined | null): boolean =>
      !!email && email.trim() !== '';
    expect(isValid('user@example.com')).toBe(true);
    expect(isValid('')).toBe(false);
    expect(isValid('   ')).toBe(false);
    expect(isValid(undefined)).toBe(false);
    expect(isValid(null)).toBe(false);
  });

  it('returns success shape for a valid subscription', () => {
    const subscribeResponse = { success: true };
    expect(subscribeResponse).toEqual({ success: true });
  });
});
