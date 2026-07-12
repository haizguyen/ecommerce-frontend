import { Injectable, signal } from '@angular/core';

/**
 * Signal-based wishlist state.
 *
 * In-memory only — no API backing.  Toggling is optimistic; the UI flips
 * instantly and the set persists across route navigation within the session.
 * Follows the same pattern as `CartService` (`cart.service.ts:15-74`):
 * module-level `signal` → `asReadonly()` → `update()` mutator.
 */
@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly wishlisted = signal<Set<string>>(new Set());

  /** Read-only set of wishlisted SKUs. */
  readonly wishlistedSkus = this.wishlisted.asReadonly();

  /**
   * Toggle a SKU in the wishlist.
   * Adds the SKU if absent, removes it if present.
   */
  toggle(sku: string): void {
    this.wishlisted.update((set) => {
      const next = new Set(set);
      if (next.has(sku)) {
        next.delete(sku);
      } else {
        next.add(sku);
      }
      return next;
    });
  }

  /** Whether the given SKU is currently wishlisted. */
  isWishlisted(sku: string): boolean {
    return this.wishlisted().has(sku);
  }
}
