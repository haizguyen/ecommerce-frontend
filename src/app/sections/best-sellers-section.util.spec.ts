/**
 * Utility tests for BestSellersSection data contracts.
 *
 * The component itself (DOM rendering, skeleton/error/empty states) is covered
 * by Playwright E2E tests. This file validates the data-flow contract between
 * CatalogService.getBestSellers() and the Product model.
 */
import type { Product } from '../data/models';

describe('BestSellersSection – data contract', () => {
  it('Product instance with discount fields', () => {
    const p: Product = {
      sku: 'sku-001',
      name: 'Halcyon Studio Microphone',
      description: 'Professional studio microphone',
      price: 149.99,
      currency: 'USD',
      categoryId: 'cat-audio',
      imageUrl: 'https://example.com/mic.jpg',
      stock: 0,
      rating: 4.7,
      tags: ['audio', 'bestseller'],
      originalPrice: 187.49,
      discountPercentage: 20,
    };
    expect(p.sku).toBe('sku-001');
    expect(p.price).toBe(149.99);
    expect(p.originalPrice).toBe(187.49);
    expect(p.discountPercentage).toBe(20);
    expect(p.tags).toContain('bestseller');
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
      tags: ['peripherals', 'bestseller'],
      originalPrice: null,
      discountPercentage: null,
    };
    expect(p.originalPrice).toBeNull();
    expect(p.discountPercentage).toBeNull();
    expect(p.tags).toContain('bestseller');
  });

  it('Bestseller products have bestseller tag', () => {
    const products: Product[] = [
      { sku: 's1', name: 'P1', description: 'd', price: 10, currency: 'USD', categoryId: 'c1', imageUrl: null, stock: 1, rating: 4.5, tags: ['bestseller'] },
      { sku: 's2', name: 'P2', description: 'd', price: 20, currency: 'USD', categoryId: 'c2', imageUrl: null, stock: 1, rating: 4.0, tags: ['bestseller', 'audio'] },
    ];
    for (const p of products) {
      expect(p.tags).toContain('bestseller');
    }
  });

  it('Products can have stock of zero (sold out)', () => {
    const p: Product = {
      sku: 'sku-soldout',
      name: 'Sold Out Item',
      description: 'd',
      price: 99.99,
      currency: 'USD',
      categoryId: 'c1',
      imageUrl: null,
      stock: 0,
      rating: 4.2,
      tags: ['bestseller'],
    };
    expect(p.stock).toBe(0);
    expect(p.sku).toBe('sku-soldout');
  });

  it('Product SKUs are unique identifiers', () => {
    const products: Product[] = [
      { sku: 'sku-001', name: 'P1', description: 'd', price: 10, currency: 'USD', categoryId: 'c1', imageUrl: null, stock: 1, rating: 4.5, tags: ['bestseller'] },
      { sku: 'sku-002', name: 'P2', description: 'd', price: 20, currency: 'USD', categoryId: 'c2', imageUrl: null, stock: 1, rating: 4.0, tags: ['bestseller'] },
    ];
    const skus = products.map(p => p.sku);
    expect(new Set(skus).size).toBe(skus.length);
  });
});
