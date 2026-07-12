# Plan Fragment: Services — CatalogService Methods, WishlistService

## Source: `plan.md` — "Contracts", "WishlistService", "Affected Files"

### CatalogService — new methods (`src/app/data/catalog.service.ts`)

```typescript
getBestSellers(): Observable<Product[]>                    // GET /api/products/best-sellers
getFlashSale(): Observable<FlashSale | null>                // GET /api/products/flash-sale
getTestimonials(): Observable<Testimonial[]>                // GET /api/testimonials
getBrands(): Observable<Brand[]>                            // GET /api/brands
subscribeToNewsletter(email: string): Observable<NewsletterResponse>  // POST /api/newsletter/subscribe
```

Follow existing method pattern at `catalog.service.ts:19-43`: each calls `this.http.get<T>(url)` with typed Observable.

### WishlistService — new file `src/app/data/wishlist.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly wishlisted = signal<Set<string>>(new Set());
  readonly wishlistedSkus = this.wishlisted.asReadonly();  // Signal<Set<string>>

  toggle(sku: string): void {
    this.wishlisted.update(set => {
      const next = new Set(set);
      if (next.has(sku)) next.delete(sku); else next.add(sku);
      return next;
    });
  }

  isWishlisted(sku: string): boolean {
    return this.wishlisted().has(sku);
  }
}
```

Pattern follows `CartService` (`cart.service.ts:15-74`): module-level signal, `asReadonly()` accessor, mutator methods using `update()`.

### Key decisions
- Wishlist is in-memory only (no API call). Session-scoped persistence.
- `WishlistService.toggle()` is optimistic — state flips instantly.
- No dedicated marketing service yet; methods added to `CatalogService`. Extraction deferred.

### Tests
- **CatalogService:** Each new method calls correct URL and returns typed Observable. Inject `HttpClient` + `HttpTestingController`, flush expected shapes, verify single request per method.
- **WishlistService:** `toggle('a')` adds SKU; `isWishlisted('a')` returns `true`; `toggle('a')` removes SKU; `isWishlisted('a')` returns `false`; state persists across multiple calls.
