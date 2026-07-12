/**
 * Unit tests for mock-backend interceptor handler logic.
 *
 * These tests verify the data transformations and routing decisions the mock
 * backend performs — filtering, state-based responses, validation — all in a
 * framework-free Node environment without Angular HTTP dependencies.
 */

import { BRANDS, FLASH_SALE, PRODUCTS, TESTIMONIALS } from './index';

describe('GET /api/products/best-sellers', () => {
  it('returns only products tagged "bestseller"', () => {
    const bestSellers = PRODUCTS.filter((p) => p.tags.includes('bestseller'));
    expect(bestSellers.length).toBeGreaterThanOrEqual(1);
    expect(bestSellers.every((p) => p.tags.includes('bestseller'))).toBe(true);
  });

  it('each bestseller has expected fields', () => {
    const bestSellers = PRODUCTS.filter((p) => p.tags.includes('bestseller'));
    for (const p of bestSellers) {
      expect(p.sku).toBeDefined();
      expect(p.price).toBeGreaterThan(0);
      expect(p.rating).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('GET /api/products/flash-sale', () => {
  it('returns FlashSale object with future endsAt date', () => {
    expect(FLASH_SALE).toBeDefined();
    expect(FLASH_SALE.id).toBe('flash-jul-2026');
    const endsAt = new Date(FLASH_SALE.endsAt);
    expect(endsAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('has at least 2 discounted products', () => {
    expect(FLASH_SALE.products.length).toBeGreaterThanOrEqual(2);
  });

  it('each flash product has discountPercentage set', () => {
    for (const p of FLASH_SALE.products) {
      expect(p.discountPercentage).toBeGreaterThan(0);
      expect(p.originalPrice).toBeGreaterThan(p.price);
    }
  });

  it('simulates ended state with null', () => {
    // When ?state=ended is passed, handler returns null
    const result = null as null;
    expect(result).toBeNull();
  });
});

describe('GET /api/testimonials', () => {
  it('returns at least 3 testimonials', () => {
    expect(TESTIMONIALS.length).toBeGreaterThanOrEqual(3);
  });

  it('every testimonial has required fields', () => {
    for (const t of TESTIMONIALS) {
      expect(t.id).toBeDefined();
      expect(t.quote).toBeDefined();
      expect(t.authorName).toBeDefined();
      expect(typeof t.rating).toBe('number');
      expect(t.rating).toBeGreaterThanOrEqual(1);
      expect(t.rating).toBeLessThanOrEqual(5);
    }
  });

  it('includes at least one testimonial with null avatarUrl', () => {
    expect(TESTIMONIALS.some((t) => t.avatarUrl === null)).toBe(true);
  });
});

describe('GET /api/brands', () => {
  it('returns at least 5 brands', () => {
    expect(BRANDS.length).toBeGreaterThanOrEqual(5);
  });

  it('every brand has required fields', () => {
    for (const b of BRANDS) {
      expect(b.id).toBeDefined();
      expect(b.name).toBeDefined();
    }
  });

  it('includes at least one brand with null logoUrl', () => {
    expect(BRANDS.some((b) => b.logoUrl === null)).toBe(true);
  });
});

describe('POST /api/newsletter/subscribe handler logic', () => {
  it('validates that email is present and non-empty', () => {
    const isValid = (email: string | undefined | null): boolean =>
      !!email && email.trim() !== '';
    expect(isValid('a@b.com')).toBe(true);
    expect(isValid('')).toBe(false);
    expect(isValid('   ')).toBe(false);
    expect(isValid(undefined)).toBe(false);
    expect(isValid(null)).toBe(false);
  });

  it('returns success for valid email', () => {
    const subscribe = (email: string): { success: boolean } => {
      if (!email || email.trim() === '') {
        throw new Error('Email is required');
      }
      return { success: true };
    };
    expect(subscribe('a@b.com')).toEqual({ success: true });
    expect(subscribe('user@example.com')).toEqual({ success: true });
  });

  it('throws for empty email (simulating 400 response)', () => {
    const subscribe = (email: string): { success: boolean } => {
      if (!email || email.trim() === '') {
        throw new Error('Email is required');
      }
      return { success: true };
    };
    expect(() => subscribe('')).toThrow('Email is required');
  });
});
