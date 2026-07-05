/**
 * Framework-free cart maths and immutable line-item operations. Pure so the Jest
 * suite covers them without Angular; CartService wraps them with signal state.
 */
import type { CartItem } from '../data/models';

/** Total for a single line. */
export function lineTotal(item: CartItem): number {
  return round2(item.quantity * item.unitPrice);
}

/** Sum of quantities across all lines (drives the header cart badge). */
export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

/** Sum of every line total. */
export function cartSubtotal(items: CartItem[]): number {
  return round2(items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0));
}

/**
 * Add `quantity` of an item, merging into an existing line by SKU. Returns a new
 * array (never mutates). Quantities are clamped to a minimum of 1.
 */
export function addItem(items: CartItem[], item: CartItem): CartItem[] {
  const qty = Math.max(1, Math.floor(item.quantity));
  const existing = items.find((i) => i.sku === item.sku);
  if (existing) {
    return items.map((i) => (i.sku === item.sku ? { ...i, quantity: i.quantity + qty } : i));
  }
  return [...items, { ...item, quantity: qty }];
}

/** Set an exact quantity for a line (clamped to ≥1). Returns a new array. */
export function setQuantity(items: CartItem[], sku: string, quantity: number): CartItem[] {
  const qty = Math.max(1, Math.floor(quantity));
  return items.map((i) => (i.sku === sku ? { ...i, quantity: qty } : i));
}

/** Remove a line by SKU. Returns a new array. */
export function removeItem(items: CartItem[], sku: string): CartItem[] {
  return items.filter((i) => i.sku !== sku);
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
