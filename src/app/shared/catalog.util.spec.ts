import {
  filterByCategory,
  searchProducts,
  sortProducts,
  applyCatalogQuery
} from './catalog.util';
import type { Product } from '../data/models';

function product(overrides: Partial<Product>): Product {
  return {
    sku: 'SKU-X',
    name: 'Thing',
    description: '',
    price: 10,
    currency: 'AUD',
    categoryId: 'audio',
    imageUrl: null,
    stock: 5,
    rating: 4,
    tags: [],
    ...overrides
  };
}

const PRODUCTS: Product[] = [
  product({ sku: 'A', name: 'Alpha Headphones', categoryId: 'audio', price: 30, rating: 4.2, tags: ['bestseller'] }),
  product({ sku: 'B', name: 'Bravo Keyboard', categoryId: 'peripherals', price: 10, rating: 4.9, tags: ['new'] }),
  product({ sku: 'C', name: 'Charlie Monitor', categoryId: 'displays', price: 20, rating: 4.5, tags: [] })
];

describe('filterByCategory', () => {
  it('returns all products for null category', () => {
    expect(filterByCategory(PRODUCTS, null)).toHaveLength(3);
  });

  it('filters to a single category', () => {
    const result = filterByCategory(PRODUCTS, 'audio');
    expect(result.map((p) => p.sku)).toEqual(['A']);
  });
});

describe('searchProducts', () => {
  it('returns all products for a blank query', () => {
    expect(searchProducts(PRODUCTS, '   ')).toHaveLength(3);
  });

  it('matches on name, sku and tags case-insensitively', () => {
    expect(searchProducts(PRODUCTS, 'keyboard').map((p) => p.sku)).toEqual(['B']);
    expect(searchProducts(PRODUCTS, 'a').length).toBeGreaterThan(0);
    expect(searchProducts(PRODUCTS, 'bestseller').map((p) => p.sku)).toEqual(['A']);
  });

  it('returns nothing when there is no match', () => {
    expect(searchProducts(PRODUCTS, 'zzz')).toEqual([]);
  });
});

describe('sortProducts', () => {
  it('sorts by price ascending and descending', () => {
    expect(sortProducts(PRODUCTS, 'price-asc').map((p) => p.sku)).toEqual(['B', 'C', 'A']);
    expect(sortProducts(PRODUCTS, 'price-desc').map((p) => p.sku)).toEqual(['A', 'C', 'B']);
  });

  it('sorts by rating and name', () => {
    expect(sortProducts(PRODUCTS, 'rating').map((p) => p.sku)).toEqual(['B', 'C', 'A']);
    expect(sortProducts(PRODUCTS, 'name').map((p) => p.sku)).toEqual(['A', 'B', 'C']);
  });

  it('does not mutate the input array', () => {
    const original = [...PRODUCTS];
    sortProducts(PRODUCTS, 'price-asc');
    expect(PRODUCTS).toEqual(original);
  });
});

describe('applyCatalogQuery', () => {
  it('applies category, search and sort together', () => {
    const result = applyCatalogQuery(PRODUCTS, { categoryId: null, query: 'o', sort: 'price-asc' });
    // 'o' matches "Headphones", "Keyboard", "Monitor" → sorted by price asc.
    expect(result.map((p) => p.sku)).toEqual(['B', 'C', 'A']);
  });
});
