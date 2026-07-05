import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import type { Cart, CartItem, Product } from './models';
import { addItem, cartCount, cartSubtotal, removeItem, setQuantity } from '../shared/cart.util';

/**
 * Cart state + data access.
 *
 * Holds the cart as reactive signal state so the header badge and cart page stay
 * in sync. It seeds once from `GET /api/cart` (served by the mock today, the real
 * gateway later) and then applies mutations locally. When the backend gains write
 * endpoints, each mutator becomes an HTTP call here — no component changes needed.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);

  private readonly items = signal<CartItem[]>([]);
  private readonly currencySig = signal<string>('AUD');
  private seeded = false;

  /** Read-only line items. */
  readonly lines = this.items.asReadonly();
  /** Total number of units in the cart (header badge). */
  readonly count = computed(() => cartCount(this.items()));
  /** Cart subtotal. */
  readonly subtotal = computed(() => cartSubtotal(this.items()));
  /** Active currency for display. */
  readonly currency = this.currencySig.asReadonly();

  /** Load the initial cart from the API once (idempotent). */
  seed(): void {
    if (this.seeded) return;
    this.seeded = true;
    this.http.get<Cart>('/api/cart').subscribe({
      next: (cart) => {
        this.items.set(cart.items);
        this.currencySig.set(cart.currency);
      },
      error: () => {
        /* leave the cart empty on failure */
      }
    });
  }

  /** Add a product to the cart (merges by SKU). */
  add(product: Product, quantity = 1): void {
    this.currencySig.set(product.currency);
    this.items.update((items) =>
      addItem(items, {
        sku: product.sku,
        name: product.name,
        quantity,
        unitPrice: product.price
      })
    );
  }

  /** Set an exact quantity for a line. */
  setQuantity(sku: string, quantity: number): void {
    this.items.update((items) => setQuantity(items, sku, quantity));
  }

  /** Remove a line. */
  remove(sku: string): void {
    this.items.update((items) => removeItem(items, sku));
  }

  /** Empty the cart. */
  clear(): void {
    this.items.set([]);
  }
}
