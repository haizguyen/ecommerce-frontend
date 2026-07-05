/**
 * Framework-free helpers backing the mock inventory endpoints. Kept pure and in
 * a `*.util.ts` file so the Jest suite (`npm run test:ci`) can cover them
 * without a browser or Angular, matching the existing quantity.util pattern.
 */
import type { InventoryItem, Product } from './types';

/** Project a product onto the inventory read-model shape. */
export function toInventoryItem(p: Product): InventoryItem {
  return { sku: p.sku, name: p.name, stock: p.stock };
}

/** Case-insensitive match of a query against a product's name or SKU. */
export function matchesQuery(item: InventoryItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return false;
  const name = (item.name ?? '').toLowerCase();
  return name.includes(q) || item.sku.toLowerCase().includes(q);
}

/**
 * Search inventory by name or SKU. Returns [] for a blank query (so the UI
 * shows nothing) and [] when nothing matches (so it shows its empty state).
 */
export function searchInventory(query: string, items: InventoryItem[]): InventoryItem[] {
  const q = (query ?? '').trim();
  if (q.length === 0) return [];
  return items.filter((item) => matchesQuery(item, q));
}

/** Decrement stock by an order quantity, never dropping below zero. */
export function decrementStock(stock: number, quantity: number): number {
  return Math.max(0, stock - Math.max(0, quantity));
}
