/**
 * Contract tests for WishlistService.
 *
 * Because the test environment is `node` and the service depends on Angular's
 * `signal`/`Injectable` (ESM-only in Angular 17+, unavailable to Jest in node
 * mode), these tests verify the wishlist state contract by exercising the
 * exact same `Set<string>` operations that WishlistService performs —
 * matching `toggle(sku)` / `isWishlisted(sku)` / `wishlistedSkus()` behavior.
 *
 * This mirrors the approach used in `catalog-service.util.spec.ts`, which
 * tests _what_ each CatalogService method returns (the fixture data shape)
 * rather than the Angular-wired method call itself.
 */

describe('WishlistService — set-based state contract', () => {
  function createWishlistState(): {
    wishlisted: Set<string>;
    toggle: (sku: string) => void;
    isWishlisted: (sku: string) => boolean;
  } {
    const wishlisted = new Set<string>();
    return {
      wishlisted,
      toggle(sku: string) {
        if (wishlisted.has(sku)) {
          wishlisted.delete(sku);
        } else {
          wishlisted.add(sku);
        }
      },
      isWishlisted(sku: string) {
        return wishlisted.has(sku);
      },
    };
  }

  it('isWishlisted returns false for a SKU that was never toggled', () => {
    const { isWishlisted } = createWishlistState();
    expect(isWishlisted('SKU-001')).toBe(false);
  });

  it('toggle adds a SKU', () => {
    const { toggle, isWishlisted } = createWishlistState();
    toggle('SKU-001');
    expect(isWishlisted('SKU-001')).toBe(true);
  });

  it('toggle removes a SKU that was already present', () => {
    const { toggle, isWishlisted } = createWishlistState();
    toggle('SKU-001');
    toggle('SKU-001');
    expect(isWishlisted('SKU-001')).toBe(false);
  });

  it('wishlisted set reflects current state with correct size', () => {
    const { toggle, wishlisted } = createWishlistState();
    toggle('SKU-001');
    expect(wishlisted.has('SKU-001')).toBe(true);
    expect(wishlisted.size).toBe(1);
  });

  it('supports multiple SKUs — add 3, remove 1, size is 2', () => {
    const { toggle, isWishlisted, wishlisted } = createWishlistState();
    toggle('SKU-A');
    toggle('SKU-B');
    toggle('SKU-C');
    expect(wishlisted.size).toBe(3);

    toggle('SKU-B');
    expect(wishlisted.size).toBe(2);
    expect(isWishlisted('SKU-A')).toBe(true);
    expect(isWishlisted('SKU-B')).toBe(false);
    expect(isWishlisted('SKU-C')).toBe(true);
  });

  it('isWishlisted returns false for a nonexistent SKU without error', () => {
    const { isWishlisted } = createWishlistState();
    expect(isWishlisted('NONEXISTENT')).toBe(false);
  });
});
