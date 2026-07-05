/**
 * Shared entity shapes for the mock data layer.
 *
 * These describe the payloads the mock interceptor returns for /api/*. They are
 * intentionally framework-free so fixtures and pure helpers can be unit tested
 * with plain Jest (node environment, no Angular).
 */

/** The read-model shape the live inventory endpoints return today. */
export interface InventoryItem {
  sku: string;
  name?: string;
  stock: number;
}

export interface Product {
  sku: string;
  name: string;
  description: string;
  /** Price in minor units-free decimal (e.g. 19.99). */
  price: number;
  currency: string;
  categoryId: string;
  /** Null models a product whose image failed to load / was never uploaded. */
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

export interface Address {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  /** Null models a user with no avatar uploaded. */
  avatarUrl: string | null;
  memberSince: string;
  address: Address;
}
