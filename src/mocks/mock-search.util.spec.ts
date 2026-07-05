import { PRODUCTS } from './products.mock';
import {
  decrementStock,
  matchesQuery,
  searchInventory,
  toInventoryItem
} from './mock-search.util';
import type { InventoryItem } from './types';

const INVENTORY: InventoryItem[] = PRODUCTS.map(toInventoryItem);

describe('toInventoryItem', () => {
  it('projects a product onto the inventory read-model shape', () => {
    const item = toInventoryItem(PRODUCTS[0]);
    expect(item).toEqual({ sku: PRODUCTS[0].sku, name: PRODUCTS[0].name, stock: PRODUCTS[0].stock });
  });
});

describe('matchesQuery', () => {
  const item: InventoryItem = { sku: 'SKU-001', name: 'Aurora Wireless Headphones', stock: 42 };

  it('matches on name, case-insensitively', () => {
    expect(matchesQuery(item, 'aurora')).toBe(true);
    expect(matchesQuery(item, 'HEADPHONES')).toBe(true);
  });

  it('matches on SKU', () => {
    expect(matchesQuery(item, 'sku-001')).toBe(true);
  });

  it('does not match unrelated text or a blank query', () => {
    expect(matchesQuery(item, 'keyboard')).toBe(false);
    expect(matchesQuery(item, '   ')).toBe(false);
  });
});

describe('searchInventory', () => {
  it('returns [] for a blank query (nothing shown)', () => {
    expect(searchInventory('', INVENTORY)).toEqual([]);
    expect(searchInventory('   ', INVENTORY)).toEqual([]);
  });

  it('returns [] when nothing matches (empty state)', () => {
    expect(searchInventory('does-not-exist-xyz', INVENTORY)).toEqual([]);
  });

  it('finds a known product by name', () => {
    const results = searchInventory('keyboard', INVENTORY);
    expect(results.map((r) => r.sku)).toContain('SKU-002');
  });

  it('finds by partial SKU', () => {
    const results = searchInventory('SKU-00', INVENTORY);
    expect(results.length).toBeGreaterThan(1);
  });
});

describe('decrementStock', () => {
  it('subtracts the ordered quantity', () => {
    expect(decrementStock(10, 3)).toBe(7);
  });

  it('never drops below zero', () => {
    expect(decrementStock(2, 5)).toBe(0);
  });

  it('ignores negative quantities', () => {
    expect(decrementStock(5, -3)).toBe(5);
  });
});
