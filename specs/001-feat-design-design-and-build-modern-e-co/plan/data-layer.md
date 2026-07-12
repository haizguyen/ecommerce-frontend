# Plan Fragment: Data Layer — Models, Types, Mock Fixtures, Barrel

## Source: `plan.md` — "Data Model", "Mock Data Additions", "Affected Files"

### Changes to `src/app/data/models.ts` (app-facing)

Add optional discount fields to `Product`:

```typescript
export interface Product {
  // ... existing fields (sku, name, description, price, currency, categoryId, imageUrl, stock, rating, tags)
  originalPrice?: number | null;       // null means no active discount
  discountPercentage?: number | null;  // e.g. 20 means "20% OFF"
  saleEndsAt?: string | null;          // ISO 8601, null if no time constraint
}
```

Add new interfaces at end of file:
```typescript
export interface FlashSale { id: string; name: string; endsAt: string; products: Product[]; }
export interface Testimonial { id: string; quote: string; authorName: string; authorTitle?: string; avatarUrl: string | null; rating: number; }
export interface Brand { id: string; name: string; logoUrl: string | null; }
export interface NewsletterResponse { success: boolean; message?: string; }
```

### Changes to `src/mocks/types.ts`

Mirror identical additions: `Product` gets `originalPrice?`, `discountPercentage?`, `saleEndsAt?`; new interfaces `FlashSale`, `Testimonial`, `Brand`, `NewsletterResponse`.

### New mock files

| File | Export | Contents |
|------|--------|----------|
| `src/mocks/testimonials.mock.ts` | `TESTIMONIALS: Testimonial[]` | 3-4 entries, one with null avatar |
| `src/mocks/brands.mock.ts` | `BRANDS: Brand[]` | 5-6 entries, some null logoUrl |

### Updates to existing mock files

**`src/mocks/products.mock.ts`:**
- Add `originalPrice`, `discountPercentage`, `saleEndsAt` to SKU-001 and SKU-003.
- SKU-001: `originalPrice: 249.99`, `discountPercentage: 20`, `saleEndsAt: null`
- SKU-003: `originalPrice: 1799.00`, `discountPercentage: 17`, `saleEndsAt: '2026-07-20T23:59:00.000Z'`
- Ensure at least 2 products have `tags.includes('bestseller')` (SKU-001 already has it).
- Add `FLASH_SALE: FlashSale` fixture:
  ```typescript
  export const FLASH_SALE: FlashSale = {
    id: 'flash-jul-2026',
    name: 'July Flash Sale',
    endsAt: '2026-07-14T23:59:00.000Z', // 2 days from today
    products: [ /* 2-3 discounted products */ ]
  };
  ```

**`src/mocks/index.ts`:**
- Add `export * from './testimonials.mock'` and `export * from './brands.mock'`.

### Key decisions from spec
- Discount fields are optional — all existing consumers remain type-safe.
- Flash sale `endsAt` set to 2 days from spec date (2026-07-12) → 2026-07-14.
- Brand logo URLs use `picsum.photos` (consistent with existing product images).

### Tests
- New interfaces compile and are instantiable with/without optional fields.
- `TESTIMONIALS` has 3+ entries; `BRANDS` has 5+; `FLASH_SALE.endsAt` is in the future.
- Discount fields on SKU-001 and SKU-003 have correct values.
