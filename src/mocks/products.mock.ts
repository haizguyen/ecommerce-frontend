import type { Product } from './types';

/**
 * Product catalogue fixtures.
 *
 * Deliberately spans representative scenarios so designers can review every UI
 * state from one dataset:
 *   - SKU-001 / SKU-002: typical in-stock products (also the two cards the
 *     current AppComponent hydrates on load — keep these present).
 *   - SKU-003: very long name + description (text-overflow / wrapping).
 *   - SKU-004: missing image (imageUrl = null → placeholder handling).
 *   - SKU-005: out of stock (stock = 0 → disabled "Place order").
 *   - SKU-006: low stock (edge of the canOrder threshold).
 *
 * Add new products by appending here; the mock interceptor derives inventory
 * and search results from this array automatically.
 */
export const PRODUCTS: Product[] = [
  {
    sku: 'SKU-001',
    name: 'Aurora Wireless Headphones',
    description: 'Over-ear headphones with active noise cancellation and 30-hour battery life.',
    price: 199.99,
    currency: 'AUD',
    categoryId: 'audio',
    imageUrl: 'https://picsum.photos/seed/sku-001/400/400',
    stock: 42,
    rating: 4.6,
    tags: ['bestseller', 'wireless']
  },
  {
    sku: 'SKU-002',
    name: 'Nimbus Mechanical Keyboard',
    description: 'Hot-swappable 75% mechanical keyboard with per-key RGB.',
    price: 129.0,
    currency: 'AUD',
    categoryId: 'peripherals',
    imageUrl: 'https://picsum.photos/seed/sku-002/400/400',
    stock: 8,
    rating: 4.8,
    tags: ['new']
  },
  {
    sku: 'SKU-003',
    name: 'Professional-Grade Ultra-Wide Curved Gaming Monitor with Adaptive Sync, HDR1000 Certification and a Fully Adjustable Ergonomic Aluminium Stand',
    description:
      'A deliberately verbose product entry used to review how the UI copes with very long titles and descriptions. ' +
      'It should wrap or truncate gracefully rather than break the card layout. ' +
      'This 49-inch panel offers a 5120x1440 resolution, 240Hz refresh rate, 1ms response time, and covers 99% of the DCI-P3 colour space, making it suitable for both immersive gaming and professional colour-critical work.',
    price: 1499.95,
    currency: 'AUD',
    categoryId: 'displays',
    imageUrl: 'https://picsum.photos/seed/sku-003/400/400',
    stock: 15,
    rating: 4.3,
    tags: ['premium']
  },
  {
    sku: 'SKU-004',
    name: 'Eco Bamboo Desk Mat',
    description: 'Sustainable bamboo desk mat. (This product intentionally has no image.)',
    price: 34.5,
    currency: 'AUD',
    categoryId: 'accessories',
    imageUrl: null,
    stock: 120,
    rating: 4.1,
    tags: ['eco']
  },
  {
    sku: 'SKU-005',
    name: 'Halcyon Studio Microphone',
    description: 'Cardioid condenser microphone for streaming and podcasting. Currently sold out.',
    price: 249.0,
    currency: 'AUD',
    categoryId: 'audio',
    imageUrl: 'https://picsum.photos/seed/sku-005/400/400',
    stock: 0,
    rating: 4.7,
    tags: ['sold-out']
  },
  {
    sku: 'SKU-006',
    name: 'Vertex Ergonomic Mouse',
    description: 'Vertical ergonomic mouse designed to reduce wrist strain. Almost gone.',
    price: 79.95,
    currency: 'AUD',
    categoryId: 'peripherals',
    imageUrl: 'https://picsum.photos/seed/sku-006/400/400',
    stock: 1,
    rating: 4.0,
    tags: ['low-stock']
  }
];
