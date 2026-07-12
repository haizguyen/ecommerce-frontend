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
  /** Original price before discount; null means no active discount. */
  originalPrice?: number | null;
  /** Discount percentage, e.g. 20 means "20% OFF". */
  discountPercentage?: number | null;
  /** ISO 8601 end date for the sale; null if no time constraint. */
  saleEndsAt?: string | null;
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

/** A time-limited flash sale featuring a curated set of discounted products. */
export interface FlashSale {
  id: string;
  name: string;
  /** ISO 8601 end timestamp. */
  endsAt: string;
  products: Product[];
}

/** A customer testimonial shown on the homepage. */
export interface Testimonial {
  id: string;
  /** The testimonial body text. */
  quote: string;
  authorName: string;
  /** Optional job title / role displayed below the author name. */
  authorTitle?: string;
  /** Null when the customer has no avatar (render a placeholder). */
  avatarUrl: string | null;
  /** 0–5 rating. */
  rating: number;
}

/** A brand or partner logo displayed in the brand strip. */
export interface Brand {
  id: string;
  name: string;
  /** Null when the brand has no logo (render placeholder or skip). */
  logoUrl: string | null;
}

/** Response returned by POST /api/newsletter/subscribe. */
export interface NewsletterResponse {
  success: boolean;
  /** Human-readable message, present only on error. */
  message?: string;
}
