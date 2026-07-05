/**
 * Framework-free catalogue helpers (filter / search / sort). Pure so the Jest
 * suite covers them without a browser. Components call these to derive the
 * product grid from the raw list returned by CatalogService.
 */
import type { Product } from '../data/models';

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name';

export const SORT_OPTIONS: ReadonlyArray<{ key: SortKey; label: string }> = [
  { key: 'featured', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'rating', label: 'Top Rated' },
  { key: 'name', label: 'Name: A–Z' }
];

/** Keep only products in the given category. Empty/null category → all products. */
export function filterByCategory(products: Product[], categoryId: string | null): Product[] {
  if (!categoryId) return products;
  return products.filter((p) => p.categoryId === categoryId);
}

/** Case-insensitive match against name, SKU or tags. Blank query → all products. */
export function searchProducts(products: Product[], query: string): Product[] {
  const q = (query ?? '').trim().toLowerCase();
  if (q.length === 0) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );
}

/** Sort a copy of the products by the given key (never mutates the input). */
export function sortProducts(products: Product[], key: SortKey): Product[] {
  const copy = [...products];
  switch (key) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating);
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'featured':
    default:
      return copy;
  }
}

/**
 * Apply category filter, then text search, then sort — the exact pipeline the
 * product-list page uses. Returned array is always a fresh copy.
 */
export function applyCatalogQuery(
  products: Product[],
  opts: { categoryId?: string | null; query?: string; sort?: SortKey }
): Product[] {
  const byCategory = filterByCategory(products, opts.categoryId ?? null);
  const bySearch = searchProducts(byCategory, opts.query ?? '');
  return sortProducts(bySearch, opts.sort ?? 'featured');
}
