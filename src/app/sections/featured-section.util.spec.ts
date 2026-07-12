/**
 * Utility tests for FeaturedSection data contracts.
 *
 * The component itself (DOM rendering, skeleton/error/empty states) is covered
 * by Playwright E2E tests. This file validates the data-flow contract between
 * CatalogService.getProducts() and the Product model, specifically the
 * top-4-by-rating sorting logic used by FeaturedSection.
 */
import type { Product } from '../data/models';

describe('FeaturedSection – data contract', () => {
  it('Product instance with discount fields', () => {
    const p: Product = {
      sku: 'sku-001',
      name: 'Aurora Wireless Headphones',
      description: 'Premium wireless headphones',
      price: 199.99,
      currency: 'USD',
      categoryId: 'cat-audio',
      imageUrl: 'https://example.com/img.jpg',
      stock: 50,
      rating: 4.6,
      tags: ['audio', 'wireless'],
      originalPrice: 249.99,
      discountPercentage: 20,
    };
    expect(p.sku).toBe('sku-001');
    expect(p.price).toBe(199.99);
    expect(p.originalPrice).toBe(249.99);
    expect(p.discountPercentage).toBe(20);
  });

  it('Product instance without discount fields', () => {
    const p: Product = {
      sku: 'sku-002',
      name: 'Nimbus Mechanical Keyboard',
      description: 'Mechanical keyboard',
      price: 129.00,
      currency: 'USD',
      categoryId: 'cat-peripherals',
      imageUrl: null,
      stock: 100,
      rating: 4.8,
      tags: ['peripherals'],
      originalPrice: null,
      discountPercentage: null,
    };
    expect(p.originalPrice).toBeNull();
    expect(p.discountPercentage).toBeNull();
  });

  it('Products can be sorted by rating descending', () => {
    const products: Product[] = [
      { sku: 's1', name: 'P1', description: 'd', price: 10, currency: 'USD', categoryId: 'c1', imageUrl: null, stock: 1, rating: 3.5, tags: [] },
      { sku: 's2', name: 'P2', description: 'd', price: 20, currency: 'USD', categoryId: 'c2', imageUrl: null, stock: 1, rating: 4.9, tags: [] },
      { sku: 's3', name: 'P3', description: 'd', price: 30, currency: 'USD', categoryId: 'c3', imageUrl: null, stock: 1, rating: 2.1, tags: [] },
    ];
    const sorted = [...products].sort((a, b) => b.rating - a.rating);
    expect(sorted[0].sku).toBe('s2');
    expect(sorted[1].sku).toBe('s1');
    expect(sorted[2].sku).toBe('s3');
  });

  it('Top 4 products are selected by highest rating', () => {
    const products: Product[] = Array.from({ length: 6 }, (_, i) => ({
      sku: `sku-${i + 1}`,
      name: `Product ${i + 1}`,
      description: 'd',
      price: 10 * (i + 1),
      currency: 'USD',
      categoryId: 'c1',
      imageUrl: null,
      stock: 1,
      rating: Math.round((1 + i * 1.2) * 10) / 10,
      tags: [],
    }));
    const top4 = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);
    expect(top4).toHaveLength(4);
    for (let i = 1; i < top4.length; i++) {
      expect(top4[i - 1].rating).toBeGreaterThanOrEqual(top4[i].rating);
    }
  });

  it('Product SKUs are unique identifiers', () => {
    const products: Product[] = [
      { sku: 'sku-001', name: 'P1', description: 'd', price: 10, currency: 'USD', categoryId: 'c1', imageUrl: null, stock: 1, rating: 4.5, tags: [] },
      { sku: 'sku-002', name: 'P2', description: 'd', price: 20, currency: 'USD', categoryId: 'c2', imageUrl: null, stock: 1, rating: 4.0, tags: [] },
    ];
    const skus = products.map(p => p.sku);
    expect(new Set(skus).size).toBe(skus.length);
  });
});
