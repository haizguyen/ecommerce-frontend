import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';

import {
  BRANDS,
  CART,
  CATEGORIES,
  EMPTY_CART,
  FLASH_SALE,
  ORDERS,
  PRODUCTS,
  TESTIMONIALS,
  USER_PROFILE,
  decrementStock,
  searchInventory,
  toInventoryItem
} from '../../mocks';
import type { InventoryItem } from '../../mocks';

/**
 * Mock backend interceptor.
 *
 * When the `mock` build configuration is active (see app.config.ts), this
 * interceptor answers every /api/* request from local fixtures — no request
 * ever leaves the browser. Non-/api requests (e.g. static assets) pass through
 * untouched.
 *
 * It intentionally mirrors the real contract the app depends on, including the
 * eventual-consistency order flow: POST /api/orders succeeds immediately, but
 * the inventory read-model only reflects the decrement a moment later, so the
 * component's poll loop behaves exactly as it does against the real gateway.
 */

/** Simulated network latency (ms) so loading states are visible. */
const LATENCY_MS = 350;
/** Delay (ms) before an order's stock decrement becomes visible to reads. */
const ORDER_SETTLE_MS = 1500;

/**
 * Mutable in-memory stock, seeded from the product fixtures. Module-level so it
 * survives across requests within a page session (resets on reload).
 */
const stockStore = new Map<string, number>(PRODUCTS.map((p) => [p.sku, p.stock]));

/** Current inventory read-model, reflecting any settled order decrements. */
function inventorySnapshot(): InventoryItem[] {
  return PRODUCTS.map((p) => ({ ...toInventoryItem(p), stock: stockStore.get(p.sku) ?? p.stock }));
}

function ok<T>(body: T, status = 200): Observable<HttpEvent<unknown>> {
  return of(new HttpResponse({ status, body })).pipe(delay(LATENCY_MS));
}

function fail(status: number, message: string, url: string): Observable<HttpEvent<unknown>> {
  return of(null).pipe(
    delay(LATENCY_MS),
    mergeMap(() =>
      throwError(() => new HttpErrorResponse({ status, statusText: message, error: { message }, url }))
    )
  );
}

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const [path, queryString] = req.url.split('?');

  // Only intercept API traffic; let everything else (assets, etc.) through.
  if (!path.startsWith('/api/')) {
    return next(req);
  }

  const method = req.method.toUpperCase();
  const urlParams = new URLSearchParams(queryString ?? '');
  // HttpClient carries HttpParams in req.params, not in the URL string, so read
  // there first and fall back to any params serialized into the URL.
  const param = (name: string): string | null => req.params.get(name) ?? urlParams.get(name);

  // --- Inventory search: GET /api/inventory/search?q= ---
  if (method === 'GET' && path === '/api/inventory/search') {
    return ok(searchInventory(param('q') ?? '', inventorySnapshot()));
  }

  // --- Single inventory item: GET /api/inventory/:sku ---
  if (method === 'GET' && path.startsWith('/api/inventory/')) {
    const sku = decodeURIComponent(path.slice('/api/inventory/'.length));
    const item = inventorySnapshot().find((i) => i.sku === sku);
    return item ? ok(item) : fail(404, `Unknown SKU: ${sku}`, req.url);
  }

  // --- Place order: POST /api/orders ---
  if (method === 'POST' && path === '/api/orders') {
    const body = (req.body ?? {}) as {
      sku?: string;
      quantity?: number;
      name?: string;
      unitPrice?: number;
      currency?: string;
    };
    const sku = body.sku ?? '';
    const quantity = Number(body.quantity ?? 0);
    const current = stockStore.get(sku);

    if (current === undefined) {
      return fail(404, `Unknown SKU: ${sku}`, req.url);
    }
    if (quantity <= 0) {
      return fail(400, 'Quantity must be at least 1', req.url);
    }
    if (current < quantity) {
      return fail(409, 'Insufficient stock', req.url);
    }

    // Eventual consistency: acknowledge now, settle the decrement shortly after
    // so the component's poll loop exercises its waiting state.
    setTimeout(() => stockStore.set(sku, decrementStock(current, quantity)), ORDER_SETTLE_MS);

    const orderId = `ORD-MOCK-${sku}-${current}`;
    return ok({ orderId, sku, quantity, status: 'placed' }, 201);
  }

  // --- Product catalogue: GET /api/products and /api/products/:sku ---
  if (method === 'GET' && path === '/api/products') {
    const withLiveStock = PRODUCTS.map((p) => ({ ...p, stock: stockStore.get(p.sku) ?? p.stock }));
    return ok(withLiveStock);
  }
  if (method === 'GET' && path.startsWith('/api/products/')) {
    const sku = decodeURIComponent(path.slice('/api/products/'.length));
    const product = PRODUCTS.find((p) => p.sku === sku);
    return product
      ? ok({ ...product, stock: stockStore.get(sku) ?? product.stock })
      : fail(404, `Unknown SKU: ${sku}`, req.url);
  }

  // --- Categories: GET /api/categories ---
  if (method === 'GET' && path === '/api/categories') {
    return ok(CATEGORIES);
  }

  // --- Cart: GET /api/cart (?state=empty for the empty state) ---
  if (method === 'GET' && path === '/api/cart') {
    return ok(param('state') === 'empty' ? EMPTY_CART : CART);
  }

  // --- Order history: GET /api/orders ---
  if (method === 'GET' && path === '/api/orders') {
    return ok(ORDERS);
  }

  // --- User profile: GET /api/user/profile ---
  if (method === 'GET' && path === '/api/user/profile') {
    return ok(USER_PROFILE);
  }

  // --- Best sellers: GET /api/products/best-sellers ---
  if (method === 'GET' && path === '/api/products/best-sellers') {
    if (param('fail') === 'true') {
      return fail(500, 'Internal server error', req.url);
    }
    const bestSellers = PRODUCTS.filter((p) => p.tags.includes('bestseller'));
    return ok(bestSellers);
  }

  // --- Flash sale: GET /api/products/flash-sale ---
  if (method === 'GET' && path === '/api/products/flash-sale') {
    if (param('fail') === 'true') {
      return fail(500, 'Internal server error', req.url);
    }
    return ok(param('state') === 'ended' ? null : FLASH_SALE);
  }

  // --- Testimonials: GET /api/testimonials ---
  if (method === 'GET' && path === '/api/testimonials') {
    if (param('fail') === 'true') {
      return fail(500, 'Internal server error', req.url);
    }
    return ok(TESTIMONIALS);
  }

  // --- Brands: GET /api/brands ---
  if (method === 'GET' && path === '/api/brands') {
    if (param('fail') === 'true') {
      return fail(500, 'Internal server error', req.url);
    }
    return ok(BRANDS);
  }

  // --- Newsletter subscribe: POST /api/newsletter/subscribe ---
  if (method === 'POST' && path === '/api/newsletter/subscribe') {
    if (param('fail') === 'true') {
      return fail(500, 'Internal server error', req.url);
    }
    const subscribeBody = (req.body ?? {}) as { email?: string };
    if (!subscribeBody.email || subscribeBody.email.trim() === '') {
      return fail(400, 'Email is required', req.url);
    }
    return ok({ success: true });
  }

  // Unmatched API route → 404, so gaps surface loudly instead of hitting a real API.
  return fail(404, `No mock handler for ${method} ${path}`, req.url);
};
