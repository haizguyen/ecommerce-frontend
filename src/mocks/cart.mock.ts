import type { Cart } from './types';

/**
 * A populated cart fixture (typical case). For the empty-cart state, request
 * `/api/cart?state=empty` from the mock interceptor.
 */
export const CART: Cart = {
  id: 'cart-1001',
  items: [
    { sku: 'SKU-001', name: 'Aurora Wireless Headphones', quantity: 1, unitPrice: 199.99 },
    { sku: 'SKU-002', name: 'Nimbus Mechanical Keyboard', quantity: 2, unitPrice: 129.0 }
  ],
  subtotal: 457.99,
  currency: 'AUD'
};

/** Empty cart fixture — for reviewing the empty state. */
export const EMPTY_CART: Cart = {
  id: 'cart-empty',
  items: [],
  subtotal: 0,
  currency: 'AUD'
};
