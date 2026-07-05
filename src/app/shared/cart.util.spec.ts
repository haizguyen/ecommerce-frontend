import {
  lineTotal,
  cartCount,
  cartSubtotal,
  addItem,
  setQuantity,
  removeItem
} from './cart.util';
import type { CartItem } from '../data/models';

const ITEMS: CartItem[] = [
  { sku: 'A', name: 'Alpha', quantity: 1, unitPrice: 199.99 },
  { sku: 'B', name: 'Bravo', quantity: 2, unitPrice: 129.0 }
];

describe('lineTotal', () => {
  it('multiplies quantity by unit price', () => {
    expect(lineTotal(ITEMS[0])).toBe(199.99);
    expect(lineTotal(ITEMS[1])).toBe(258.0);
  });
});

describe('cartCount', () => {
  it('sums quantities', () => {
    expect(cartCount(ITEMS)).toBe(3);
    expect(cartCount([])).toBe(0);
  });
});

describe('cartSubtotal', () => {
  it('sums line totals, rounded to cents', () => {
    expect(cartSubtotal(ITEMS)).toBe(457.99);
    expect(cartSubtotal([])).toBe(0);
  });
});

describe('addItem', () => {
  it('appends a new line', () => {
    const result = addItem(ITEMS, { sku: 'C', name: 'Charlie', quantity: 1, unitPrice: 10 });
    expect(result).toHaveLength(3);
    expect(result[2].sku).toBe('C');
  });

  it('merges into an existing line by SKU', () => {
    const result = addItem(ITEMS, { sku: 'A', name: 'Alpha', quantity: 2, unitPrice: 199.99 });
    expect(result).toHaveLength(2);
    expect(result.find((i) => i.sku === 'A')!.quantity).toBe(3);
  });

  it('does not mutate the input', () => {
    const before = JSON.parse(JSON.stringify(ITEMS));
    addItem(ITEMS, { sku: 'A', name: 'Alpha', quantity: 5, unitPrice: 199.99 });
    expect(ITEMS).toEqual(before);
  });
});

describe('setQuantity', () => {
  it('sets an exact quantity clamped to at least 1', () => {
    expect(setQuantity(ITEMS, 'B', 5).find((i) => i.sku === 'B')!.quantity).toBe(5);
    expect(setQuantity(ITEMS, 'B', 0).find((i) => i.sku === 'B')!.quantity).toBe(1);
  });
});

describe('removeItem', () => {
  it('removes the matching line', () => {
    const result = removeItem(ITEMS, 'A');
    expect(result.map((i) => i.sku)).toEqual(['B']);
  });
});
