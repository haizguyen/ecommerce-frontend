import type { Product, FlashSale, Testimonial, Brand, NewsletterResponse } from './models';

describe('Product — discount fields', () => {
  it('instantiates with all optional discount fields set', () => {
    const product: Product = {
      sku: 'SKU-DISC-001',
      name: 'Discounted Item',
      description: 'On sale now',
      price: 79.99,
      currency: 'USD',
      categoryId: 'cat-1',
      imageUrl: '/img/placeholder.png',
      stock: 10,
      rating: 4.5,
      tags: ['sale'],
      originalPrice: 99.99,
      discountPercentage: 20,
      saleEndsAt: '2026-07-20T23:59:00.000Z',
    };
    expect(product.originalPrice).toBe(99.99);
    expect(product.discountPercentage).toBe(20);
    expect(product.saleEndsAt).toBe('2026-07-20T23:59:00.000Z');
  });

  it('instantiates without any discount fields (all undefined)', () => {
    const product: Product = {
      sku: 'SKU-NO-DISC-001',
      name: 'Regular Item',
      description: 'Full price',
      price: 49.99,
      currency: 'USD',
      categoryId: 'cat-1',
      imageUrl: null,
      stock: 5,
      rating: 4.0,
      tags: [],
    };
    expect(product.originalPrice).toBeUndefined();
    expect(product.discountPercentage).toBeUndefined();
    expect(product.saleEndsAt).toBeUndefined();
  });

  it('instantiates with discount fields set to null', () => {
    const product: Product = {
      sku: 'SKU-NULL-DISC-001',
      name: 'No Discount',
      description: 'Was on sale, not anymore',
      price: 29.99,
      currency: 'USD',
      categoryId: 'cat-1',
      imageUrl: '/img/placeholder.png',
      stock: 20,
      rating: 3.5,
      tags: [],
      originalPrice: null,
      discountPercentage: null,
      saleEndsAt: null,
    };
    expect(product.originalPrice).toBeNull();
    expect(product.discountPercentage).toBeNull();
    expect(product.saleEndsAt).toBeNull();
  });
});

describe('FlashSale', () => {
  it('instantiates with required fields', () => {
    const sale: FlashSale = {
      id: 'flash-test-001',
      name: 'Test Flash Sale',
      endsAt: '2026-07-14T23:59:00.000Z',
      products: [],
    };
    expect(sale.id).toBe('flash-test-001');
    expect(sale.products).toEqual([]);
  });
});

describe('Testimonial', () => {
  it('instantiates with null avatarUrl', () => {
    const testimonial: Testimonial = {
      id: 'test-001',
      quote: 'Great product!',
      authorName: 'Jane Doe',
      avatarUrl: null,
      rating: 5,
    };
    expect(testimonial.avatarUrl).toBeNull();
    expect(testimonial.authorTitle).toBeUndefined();
  });

  it('instantiates with optional authorTitle and avatarUrl', () => {
    const testimonial: Testimonial = {
      id: 'test-002',
      quote: 'Amazing quality.',
      authorName: 'John Smith',
      authorTitle: 'Verified Buyer',
      avatarUrl: '/img/avatar.png',
      rating: 4,
    };
    expect(testimonial.authorTitle).toBe('Verified Buyer');
    expect(testimonial.avatarUrl).toBe('/img/avatar.png');
  });
});

describe('Brand', () => {
  it('instantiates with null logoUrl', () => {
    const brand: Brand = {
      id: 'brand-001',
      name: 'No-Logo Brand',
      logoUrl: null,
    };
    expect(brand.logoUrl).toBeNull();
  });
});

describe('NewsletterResponse', () => {
  it('instantiates with success true and no message', () => {
    const resp: NewsletterResponse = { success: true };
    expect(resp.success).toBe(true);
    expect(resp.message).toBeUndefined();
  });

  it('instantiates with success false and error message', () => {
    const resp: NewsletterResponse = { success: false, message: 'Invalid email' };
    expect(resp.success).toBe(false);
    expect(resp.message).toBe('Invalid email');
  });
});
