/**
 * App-facing API contract types.
 *
 * These mirror the payloads the `/api/*` gateway returns (today served by the
 * mock interceptor, later by the real backend). They live in the app layer — not
 * imported from `src/mocks` — so the UI has no compile-time dependency on the
 * mock fixtures. Swapping mock data for a real API requires no change here.
 */

/** Read-model shape returned by the inventory endpoints. */
export interface InventoryItem {
  sku: string;
  name?: string;
  stock: number;
}

export interface Product {
  sku: string;
  name: string;
  description: string;
  /** Decimal price, e.g. 19.99. */
  price: number;
  currency: string;
  categoryId: string;
  /** Null when the product has no image (render a placeholder). */
  imageUrl: string | null;
  stock: number;
  /** 0–5, one decimal place. */
  rating: number;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface CartItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  currency: string;
}

export type OrderStatus = 'pending' | 'placed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderLine {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  placedAt: string;
  lines: OrderLine[];
  total: number;
  currency: string;
}

/** Response returned by POST /api/orders. */
export interface PlaceOrderResponse {
  orderId: string;
  sku: string;
  quantity: number;
  status: string;
}
