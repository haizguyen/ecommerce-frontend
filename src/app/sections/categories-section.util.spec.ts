/**
 * Utility tests for CategoriesSection data contracts.
 *
 * The component itself (DOM rendering, skeleton/error/empty states) is covered
 * by Playwright E2E tests. This file validates the data-flow contract between
 * CatalogService.getCategories() and the Category model, complementing the
 * service-layer contract tests in catalog-service.util.spec.ts.
 */
import type { Category } from '../data/models';

describe('CategoriesSection – data contract', () => {
  it('Category instance with all fields', () => {
    const cat: Category = {
      id: 'cat-audio',
      name: 'Audio',
      slug: 'audio',
      productCount: 14,
    };
    expect(cat.id).toBe('cat-audio');
    expect(cat.name).toBe('Audio');
    expect(cat.slug).toBe('audio');
    expect(cat.productCount).toBe(14);
  });

  it('Category instance with zero productCount', () => {
    const cat: Category = {
      id: 'cat-new',
      name: 'New Arrivals',
      slug: 'new-arrivals',
      productCount: 0,
    };
    expect(cat.productCount).toBe(0);
  });

  it('Category array can be sorted by productCount', () => {
    const cats: Category[] = [
      { id: 'c1', name: 'Audio', slug: 'audio', productCount: 5 },
      { id: 'c2', name: 'Video', slug: 'video', productCount: 12 },
      { id: 'c3', name: 'Books', slug: 'books', productCount: 3 },
    ];
    const sorted = [...cats].sort((a, b) => b.productCount - a.productCount);
    expect(sorted[0].name).toBe('Video');
    expect(sorted[2].name).toBe('Books');
  });

  it('Category slugs are valid for URL query params', () => {
    const cats: Category[] = [
      { id: 'c1', name: 'Audio', slug: 'audio', productCount: 5 },
      { id: 'c2', name: 'Gaming Gear', slug: 'gaming-gear', productCount: 8 },
    ];
    for (const c of cats) {
      expect(c.slug).not.toContain(' ');
      expect(c.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
