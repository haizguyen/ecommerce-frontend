import type { Order } from './types';

/**
 * Order history fixtures spanning every status so designers can review each
 * badge/label. Timestamps are fixed strings (no Date.now()) for determinism.
 */
export const ORDERS: Order[] = [
  {
    id: 'ORD-20260701-001',
    status: 'delivered',
    placedAt: '2026-07-01T09:15:00.000Z',
    lines: [{ sku: 'SKU-001', name: 'Aurora Wireless Headphones', quantity: 1, unitPrice: 199.99 }],
    total: 199.99,
    currency: 'AUD'
  },
  {
    id: 'ORD-20260703-002',
    status: 'shipped',
    placedAt: '2026-07-03T14:42:00.000Z',
    lines: [
      { sku: 'SKU-002', name: 'Nimbus Mechanical Keyboard', quantity: 1, unitPrice: 129.0 },
      { sku: 'SKU-006', name: 'Vertex Ergonomic Mouse', quantity: 1, unitPrice: 79.95 }
    ],
    total: 208.95,
    currency: 'AUD'
  },
  {
    id: 'ORD-20260704-003',
    status: 'pending',
    placedAt: '2026-07-04T18:05:00.000Z',
    lines: [{ sku: 'SKU-004', name: 'Eco Bamboo Desk Mat', quantity: 3, unitPrice: 34.5 }],
    total: 103.5,
    currency: 'AUD'
  },
  {
    id: 'ORD-20260630-000',
    status: 'cancelled',
    placedAt: '2026-06-30T11:20:00.000Z',
    lines: [{ sku: 'SKU-005', name: 'Halcyon Studio Microphone', quantity: 1, unitPrice: 249.0 }],
    total: 249.0,
    currency: 'AUD'
  }
];
