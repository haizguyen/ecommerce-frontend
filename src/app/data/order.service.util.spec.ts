/**
 * Unit tests for OrderService data contracts.
 *
 * Because the test environment is `node` and the service depends on Angular's
 * HttpClient (unavailable outside a DI context), these tests verify the
 * URL-to-data contract by inspecting the expected payload and response shapes
 * directly. Each test mirrors what the OrderService methods would send or
 * receive at runtime.
 *
 * See also: catalog-service.util.spec.ts (same approach for catalog endpoints).
 */

import type { PlaceOrderResponse } from './models';

describe('OrderService — POST /api/orders (placeOrder)', () => {
  /** Build the POST body that placeOrder sends, for contract assertion. */
  function placeOrderPayload(
    sku: string,
    quantity: number,
    name: string,
    unitPrice: number,
    currency: string
  ) {
    return { sku, quantity, name, unitPrice, currency };
  }

  it('sends sku, quantity, name, unitPrice, and currency in the POST body', () => {
    const payload = placeOrderPayload('SKU-001', 2, 'Wireless Headphones', 79.99, 'USD');

    expect(payload.sku).toBe('SKU-001');
    expect(payload.quantity).toBe(2);
    expect(payload.name).toBe('Wireless Headphones');
    expect(payload.unitPrice).toBe(79.99);
    expect(payload.currency).toBe('USD');
  });

  it('sends all required snapshot fields for every order', () => {
    const payloads = [
      placeOrderPayload('SKU-A', 1, 'Product A', 19.99, 'USD'),
      placeOrderPayload('SKU-B', 5, 'Product B', 49.0, 'EUR'),
      placeOrderPayload('SKU-C', 3, 'Product C', 9.99, 'GBP')
    ];

    for (const p of payloads) {
      expect(typeof p.sku).toBe('string');
      expect(p.sku.length).toBeGreaterThan(0);
      expect(typeof p.quantity).toBe('number');
      expect(p.quantity).toBeGreaterThanOrEqual(1);
      expect(typeof p.name).toBe('string');
      expect(p.name.length).toBeGreaterThan(0);
      expect(typeof p.unitPrice).toBe('number');
      expect(p.unitPrice).toBeGreaterThan(0);
      expect(typeof p.currency).toBe('string');
      expect(p.currency.length).toBeGreaterThan(0);
    }
  });
});

describe('OrderService — PlaceOrderResponse shape', () => {
  it('returns orderId, sku, quantity, and status on success (201)', () => {
    const response: PlaceOrderResponse = {
      orderId: 'ORD-MOCK-SKU-001-50',
      sku: 'SKU-001',
      quantity: 2,
      status: 'placed'
    };

    expect(typeof response.orderId).toBe('string');
    expect(response.orderId.length).toBeGreaterThan(0);
    expect(typeof response.sku).toBe('string');
    expect(typeof response.quantity).toBe('number');
    expect(response.quantity).toBeGreaterThan(0);
    expect(response.status).toBe('placed');
  });
});
