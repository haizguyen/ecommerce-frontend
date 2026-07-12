# Plan: Modern E-Commerce Homepage — Aurora Store

## Summary

Refactor the monolithic `HomeComponent` into 11 standalone section components under `src/app/sections/`, each following the existing OnPush/signals pattern, and retrofit `ProductCardComponent` with discount badge, wishlist toggle, and quick-view overlay. Extend the data layer (models, mocks, interceptor, CatalogService) with three new interfaces and five new API endpoints, then wire everything together in `HomeComponent` with proper loading/error/empty/success states per the UX spec's F1–F9 flows. The mockup's exact visual output is achievable because every design token, skeleton class, and layout primitive it uses (`--sale`, `.badge-sale`, `.flash-wrap`, `.test-grid`, `.rec-overlay`, `.social-row`, etc.) either already exists in `src/styles.css` or is defined inline in the mockup's `<style>` block and will be migrated into each section's component styles.

---

## Technical Approach

We extend the existing signal-based, standalone-component architecture: the `CatalogService` (which already serves products and categories via HTTP) gains five new methods mapping to new mock interceptor routes; the `Product` model in both `src/app/data/models.ts` and `src/mocks/types.ts` gets optional discount fields; ten new section components land under `src/app/sections/`, each owning its own loading/error/data signals and using Angular 17 `@if`/`@for` control flow (already used in the spec's `flashSale()` null guard convention). The `CartService` (signal-based with `computed` for derived state at `cart.service.ts:15-74`) serves as the template for a new `WishlistService` with `wishlistedSkus: Signal<Set<string>>`. Every data-fetching section follows the same three-phase reactive pattern already seen in `HomeComponent` (subscribe → set signal → template reacts), with the addition of explicit error and empty branches. The existing `FooterComponent` receives social link SVGs using the same inline SVG pattern as `header.component.ts:34-41`.

---

## Architecture — Before / After

```
BEFORE:
AppComponent
├── HeaderComponent (existing)
├── RouterOutlet
│   └── HomeComponent (monolithic — hero inline, categories inline, featured inline)
└── FooterComponent (existing, no social links)

AFTER:
AppComponent
├── HeaderComponent              (unchanged)
├── RouterOutlet
│   └── HomeComponent            (refactored — section components in order)
│       ├── HeroSection          [NEW] extract from inline
│       ├── SearchSection        [NEW] prominent homepage search
│       ├── CategoriesSection    [NEW] extract from inline + states
│       ├── FeaturedSection      [NEW] extract from inline + error/empty
│       ├── BestSellersSection   [NEW]
│       ├── FlashSaleSection     [NEW] countdown timer
│       ├── RecommendationsSection [NEW] placeholder
│       ├── BrandSection         [NEW]
│       ├── TestimonialsSection  [NEW] static 3-col grid
│       ├── NewsletterSection    [NEW] form with validation
│       └── FooterComponent      [MODIFIED] add social link SVGs
└── FooterComponent              (unchanged, already rendered in AppComponent)

Data layer:
├── src/app/data/models.ts       [MODIFIED] add discount fields + new interfaces
├── src/app/data/catalog.service.ts [MODIFIED] add 5 new methods
├── src/app/data/cart.service.ts  (unchanged — template for WishlistService)
├── src/app/data/wishlist.service.ts [NEW] signal-based service
├── src/app/shared/product-card.component.ts [MODIFIED] add 3 outputs + discount/wishlist/quickview UI
├── src/app/mock/mock-backend.interceptor.ts [MODIFIED] add 5 new route handlers
├── src/mocks/types.ts           [MODIFIED] add FlashSale, Testimonial, Brand, NewsletterResponse
├── src/mocks/products.mock.ts   [MODIFIED] add discount fields + flash sale fixture
├── src/mocks/testimonials.mock.ts [NEW]
├── src/mocks/brands.mock.ts     [NEW]
├── src/mocks/index.ts           [MODIFIED] add barrel exports
└── src/app/app.component.ts     [MODIFIED] add skip-to-content link
```

---

## Data Model

### Changes to `src/app/data/models.ts` (app-facing, lines 17–31)

Add optional discount fields to `Product`:

```typescript
export interface Product {
  // ... existing fields (sku, name, description, price, currency, categoryId, imageUrl, stock, rating, tags)
  originalPrice?: number | null;       // null means no active discount
  discountPercentage?: number | null;  // e.g. 20 means "20% OFF"
  saleEndsAt?: string | null;          // ISO 8601, null if no time constraint
}
```

Add new interfaces at the end of the file:

```typescript
export interface FlashSale {
  id: string;
  name: string;
  endsAt: string;                     // ISO 8601
  products: Product[];
}

export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorTitle?: string;
  avatarUrl: string | null;
  rating: number;                     // 1–5
}

export interface Brand {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface NewsletterResponse {
  success: boolean;
  message?: string;
}
```

### Changes to `src/mocks/types.ts` (mock-layer, lines 16–30)

Mirror the exact same additions: `Product` gets `originalPrice?`, `discountPercentage?`, `saleEndsAt?`; new interfaces `FlashSale`, `Testimonial`, `Brand`, `NewsletterResponse` are added with identical shapes.

**Rollback:** Revert the interface additions in both files and remove the three new mock files and the two updated mock files from version control. No migration script is needed since these are compile-time types and mock fixtures, not a live database schema.

---

## Contracts (API / Interfaces)

### New endpoints (all added to mock interceptor; CatalogService methods mirror these)

| # | Method | Path | Request | Response (200) | Errors | Purpose |
|---|--------|------|---------|----------------|--------|---------|
| 1 | `GET` | `/api/products/best-sellers` | — | `Product[]` | 500 (simulated) | Products tagged `bestseller` |
| 2 | `GET` | `/api/products/flash-sale` | `?state=ended` optional | `FlashSale \| null` | 500 | Active flash sale with products + countdown |
| 3 | `GET` | `/api/testimonials` | — | `Testimonial[]` | 500 | Customer quotes |
| 4 | `GET` | `/api/brands` | — | `Brand[]` | 500 | Partner brand logos |
| 5 | `POST` | `/api/newsletter/subscribe` | `{ email: string }` | `NewsletterResponse` | 400 (invalid), 500 (`?fail=true`) | Email capture |

### CatalogService method signatures (add to `src/app/data/catalog.service.ts:16-44`)

```typescript
getBestSellers(): Observable<Product[]>
getFlashSale(): Observable<FlashSale | null>
getTestimonials(): Observable<Testimonial[]>
getBrands(): Observable<Brand[]>
subscribeToNewsletter(email: string): Observable<NewsletterResponse>
```

### WishlistService (new file `src/app/data/wishlist.service.ts`)

```typescript
@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly wishlisted = signal<Set<string>>(new Set());
  readonly wishlistedSkus = this.wishlisted.asReadonly();  // Signal<Set<string>>
  
  toggle(sku: string): void;
  isWishlisted(sku: string): boolean;  // convenience
}
```

Pattern follows `CartService` (`cart.service.ts:15-74`): module-level signal, `asReadonly()` public accessor, mutator methods that `update()` the signal.

### ProductCardComponent contract changes (`src/app/shared/product-card.component.ts:159-160`)

**New inputs/outputs:**
```typescript
@Input() wishlisted = false;
@Output() toggleWishlist = new EventEmitter<Product>();
@Output() quickView = new EventEmitter<Product>();
```

The existing `@Input({ required: true }) product!: Product` and `@Output() add = new EventEmitter<Product>()` remain unchanged.

---

## Affected Files

| File | Action | Why | Pattern to follow (file:line) |
|------|--------|-----|-------------------------------|
| `src/app/data/models.ts` | Modify | Add `originalPrice?`, `discountPercentage?`, `saleEndsAt?` to `Product` (line 17); add `FlashSale`, `Testimonial`, `Brand`, `NewsletterResponse` interfaces after line 78 | Existing interface shapes at `src/app/data/models.ts:10-78` — same JSDoc convention, optional fields with `?` |
| `src/mocks/types.ts` | Modify | Mirror discount fields on mock `Product` (line 16) and add same 4 new interfaces | Existing mock types at `src/mocks/types.ts:10-88` — framework-free, plain TS |
| `src/mocks/products.mock.ts` | Modify | Add `originalPrice`, `discountPercentage`, `saleEndsAt` to SKU-001 and SKU-003 (lines 19, 43); add `FLASH_SALE` fixture with 2-3 discounted products | Existing fixture pattern at `src/mocks/products.mock.ts:18-94` |
| `src/mocks/testimonials.mock.ts` | **Create** | Export `TESTIMONIALS: Testimonial[]` with 3-4 entries, one with `avatarUrl: null` | Pattern: `src/mocks/categories.mock.ts:4-10` |
| `src/mocks/brands.mock.ts` | **Create** | Export `BRANDS: Brand[]` with 5-6 entries, some with `logoUrl: null` | Pattern: `src/mocks/categories.mock.ts:4-10` |
| `src/mocks/index.ts` | Modify | Add `export * from './testimonials.mock'` and `export * from './brands.mock'` | Existing barrel at `src/mocks/index.ts:5-11` |
| `src/app/mock/mock-backend.interceptor.ts` | Modify | Add 5 route handlers between lines 143–146 (before the 404 fallback) | Existing handler pattern at `src/app/mock/mock-backend.interceptor.ts:61-143` — `ok()` helper, `param()` for query, same LATENCY_MS |
| `src/app/data/catalog.service.ts` | Modify | Add `getBestSellers()`, `getFlashSale()`, `getTestimonials()`, `getBrands()`, `subscribeToNewsletter(email)` | Existing methods at `src/app/data/catalog.service.ts:19-43` — each calls `this.http.get<T>(url)` with typed Observable |
| `src/app/data/wishlist.service.ts` | **Create** | Signal-based service with `wishlistedSkus`, `toggle()`, `isWishlisted()` | `CartService` at `src/app/data/cart.service.ts:15-74` — same `signal → asReadonly → computed` pattern |
| `src/app/shared/product-card.component.ts` | Modify | Add `@Input wishlisted`, `@Output toggleWishlist`, `@Output quickView` (lines 158-160); add discount badge in `.tag-row` (line 34); add wishlist heart in `.media` (after line 38); add quick-view overlay (after wishlist); add `.price-old` strikethrough (line 147) | SVG icon pattern from `header.component.ts:34-41`; image placeholder pattern at `product-card.component.ts:95-99`; existing `.tag-row` at line 34; existing `.price` at line 147 |
| `src/app/sections/hero-section.component.ts` | **Create** | `HeroSection` — presentational, extract hero+value strip from HomeComponent | Existing inline hero at `home.component.ts:20-50` (template) and `:111-188` (styles) |
| `src/app/sections/search-section.component.ts` | **Create** | `SearchSection` — large input, auto-focus, submits to `/products?q=` | Header search at `header.component.ts:33-49` (form pattern, SVG icon) |
| `src/app/sections/categories-section.component.ts` | **Create** | `CategoriesSection` — extract from HomeComponent, add loading/error/empty | Existing inline at `home.component.ts:63-84` (template) and `:221-257` (styles); loading: 5 skeleton tiles |
| `src/app/sections/featured-section.component.ts` | **Create** | `FeaturedSection` — extract from HomeComponent, add error+empty states | Existing inline at `home.component.ts:86-107` (template) and `:260-270` (styles) |
| `src/app/sections/best-sellers-section.component.ts` | **Create** | `BestSellersSection` — 4-column grid from `getBestSellers()` | Same grid pattern as FeaturedSection at `home.component.ts:260-264` |
| `src/app/sections/flash-sale-section.component.ts` | **Create** | `FlashSaleSection` — sale container, countdown timer `interval(1000)` + signal | Countdown using `interval()` pattern; null guard via `@if (flashSale(); as sale)` |
| `src/app/sections/recommendations-section.component.ts` | **Create** | `RecommendationsSection` — 4 skeleton cards + overlay pill | Static placeholder, no data fetching |
| `src/app/sections/brand-section.component.ts` | **Create** | `BrandSection` — flex-wrap logo grid from `getBrands()` | Brand tile pattern from mockup CSS lines 703-742 |
| `src/app/sections/testimonials-section.component.ts` | **Create** | `TestimonialsSection` — 3-column grid from `getTestimonials()` | Testimonial card pattern from mockup CSS lines 744-820 |
| `src/app/sections/newsletter-section.component.ts` | **Create** | `NewsletterSection` — form with `FormControl`, validation, submit | `@angular/forms` `Validators.email`/`Validators.required` |
| `src/app/pages/home.component.ts` | Modify | Replace inline sections with section components (hero, search, categories, featured, best-sellers, flash-sale, recommendations, brands, testimonials, newsletter); wire `add → CartService.add()`, `toggleWishlist → WishlistService.toggle()`, `quickView → router.navigate()` | Existing wiring at `home.component.ts:100` (`(add)="cart.add($event)"`); keep existing `cart` injection |
| `src/app/layout/footer.component.ts` | Modify | Add `.social-row` div with 3 SVG link icons in brand column (between line 20 and the closing `</div>`) | Social link pattern from mockup lines 2375-2394; inline SVG pattern from `header.component.ts:34-41` |
| `src/app/app.component.ts` | Modify | Add skip-to-content `<a href="#content" class="skip-link">` as first child of template (before `<app-header>`) | Skip link pattern: off-screen positioned `<a>`, visible on `:focus` with `.sr-only` class from `src/styles.css:334-344` or custom positioning |
| `src/styles.css` | **No changes needed** | All design tokens and global primitives already exist | Tokens at `src/styles.css:8-63`; primitives at `:119-377` |

---

## Section Component Design Details

### Common pattern for all data-driven sections

Every section that fetches data follows this reactive contract (exemplified by the existing `HomeComponent` at `home.component.ts:300-325`):

```typescript
readonly loading = signal(true);
readonly error = signal(false);
readonly data = signal<T[]>([]);

private load(): void {
  this.loading.set(true);
  this.error.set(false);
  this.service.getData().subscribe({
    next: (items) => { this.data.set(items); this.loading.set(false); },
    error: () => { this.error.set(true); this.loading.set(false); }
  });
}

retry(): void { this.load(); }

constructor() { this.load(); }
```

Template uses Angular 17 `@if` control flow for the three-state gate:

```
@if (loading(); ...) → skeleton
@else if (error(); ...) → error message + retry button
@else if (data().length === 0; ...) → empty message
@else → content grid
```

### State messages per section (from UX spec)

| Section | Loading skeleton | Empty message | Error message |
|---------|-----------------|---------------|---------------|
| CategoriesSection | 5 skeleton `.sk-cat` tiles | "No categories available right now." | Standard + Retry |
| FeaturedSection | 4 skeleton `.sk-card` tiles | "Nothing to feature this week — check back soon." | Standard + Retry |
| BestSellersSection | 4 skeleton `.sk-card` tiles | "Top sellers coming soon — check back later." | Standard + Retry |
| FlashSaleSection | Skeleton timer + 4 skeleton cards | "No active flash sales right now. Check back soon!" / Null → hidden / Ended → "Sale ended" | Standard + Retry |
| BrandSection | 6 skeleton `.sk-brand` tiles | Hidden entirely (no DOM) | Standard + Retry |
| TestimonialsSection | 3 skeleton testimonial cards | Hidden entirely (no DOM) | Standard + Retry |
| RecommendationsSection | 4 skeleton cards with overlay | N/A (always placeholder) | N/A |
| NewsletterSection | Submitting disabled state | N/A | Validation + server errors inline |

Standard error: `"Something went wrong loading this section."` + `.btn-outline` Retry button.

### Visual reference

All layout dimensions, colors, spacing, hover effects, skeleton shapes, and responsive breakpoints are specified in the approved mockup (`mockup.html`). Key CSS classes defined there that must be migrated into section component styles:

- `.flash-wrap` — sale container with `--sale` border and `--danger-soft` gradient (mockup lines 659-664)
- `.countdown` / `.countdown-ended` — timer display (lines 673-689)
- `.brand-row` / `.brand-tile` / `.brand-init` — brand logo grid (lines 703-742)
- `.test-grid` / `.test-card` / `.test-avatar` / `.test-quote` — testimonial layout (lines 744-820)
- `.rec-wrap` / `.rec-overlay` / `.rec-pill` — recommendations placeholder (lines 847-867)
- `.newsletter` / `.news-form` / `.news-success` — newsletter section (lines 869-916)
- `.social-row` / `.social-link` — footer social icons (lines 943-964)
- `.wishlist-btn` / `.quickview-overlay` / `.quickview-btn` — card overlays (lines 556-600)
- `.price-old` — strikethrough pricing (lines 636-641)
- `.sk-cat` / `.sk-card` / `.sk-timer` / `.sk-brand` / `.sk-test` — skeletons (lines 653-820)

---

## Test Strategy

The existing test setup uses **Jest** (via `jest.config.js`) with `@angular/platform-server` for component tests. The spec defers E2E/visual tests to the implementation phase, so this plan covers only the unit/integration test boundaries.

| Area | What to test | Jest unit test example |
|------|-------------|----------------------|
| **Models** | New interfaces compile; discount fields are optional | Instantiate `Product` with/without discount fields (plain TS, no Angular) |
| **Mock fixtures** | `TESTIMONIALS` has 3+ entries; `BRANDS` has 5+; `FLASH_SALE` has `endsAt` in future; discount fields on SKU-001 and SKU-003 are correct | Import from mocks barrel, assert array lengths and field values |
| **Mock interceptor** | New routes return correct shapes; `?state=ended` returns ended sale; `?fail=true` returns 500; unknown route → 404 | Existing mock backend tests would extend to cover `GET /api/products/best-sellers`, `GET /api/testimonials`, `POST /api/newsletter/subscribe` |
| **CatalogService** | New methods call correct URLs and return typed Observables | Inject `HttpClient` + `HttpTestingController`, flush expected shapes, verify single request per method |
| **WishlistService** | `toggle()` adds/removes SKU from set; `isWishlisted()` returns correct bool; state persists across calls | Instantiate service, call `toggle('a')`, assert `isWishlisted('a') === true`, call `toggle('a')`, assert `isWishlisted('a') === false` |
| **ProductCardComponent** | Discount badge visible when `discountPercentage` set; wishlist heart emits `toggleWishlist` with product; quick-view overlay emits `quickView`; `wishlisted` input controls heart fill | `TestBed` component test: set `product` with discount, assert `.badge-sale` exists; click heart, assert emitter; set `wishlisted = true`, assert filled SVG |
| **Section components** | Each data-fetching section: loading shows skeletons, error shows retry button, empty shows message, data shows grid | Mount section with `CatalogService` mock that returns `of([])` (empty), `throwError` (error), `of(data)` (idle); assert template branches render |
| **NewsletterSection** | Form validation rejects invalid email; submit calls service; success hides form; error shows inline message | Use `@angular/forms` `FormControl` in test; set invalid value, submit, assert `.news-error` visible; set valid, mock service return, assert success |
| **HomeComponent** | All section components render in order; `add` event → `CartService.add()`; `toggleWishlist` → `WishlistService.toggle()`; `quickView` → `router.navigate()` | Mount with mock services, trigger events from section children, assert service methods called |

### Per-endpoint test coverage (mock interceptor)

| Endpoint | Happy path | Validation → 400 | 404 | 409 | 500 |
|----------|-----------|------------------|-----|-----|-----|
| `GET /api/products/best-sellers` | Returns `Product[]` with bestseller tag | N/A | N/A | N/A | Simulate via `?fail=true` |
| `GET /api/products/flash-sale` | Returns `FlashSale` with future `endsAt` | N/A | N/A | N/A | Simulate |
| `GET /api/testimonials` | Returns `Testimonial[]` | N/A | N/A | N/A | Simulate |
| `GET /api/brands` | Returns `Brand[]` | N/A | N/A | N/A | Simulate |
| `POST /api/newsletter/subscribe` | Returns `{ success: true }` | Empty/missing email → 400 | N/A | N/A | `?fail=true` → 500 |

---

## Risks & Rollback

1. **Risk: New discount fields on `Product` may break existing code that iterates products but does not expect new optional fields.** Mitigation: The fields are optional (`originalPrice?`), so all existing consumers remain type-safe with zero changes. Any template that checks `product.price` still works — the strikethrough logic is purely additive.

2. **Risk: Wishlist state is in-memory only (no persistence).** Mitigation: This matches the spec's explicit constraint ("No API call in scope"). If persistence is needed later, `WishlistService.toggle()` would gain an HTTP POST — the component interface stays the same. Document this as a known gap in the service.

3. **Risk: Section components each create their own HTTP subscription, potentially causing race conditions on rapid navigation.** Mitigation: Each section uses `takeUntilDestroyed()` (or explicit `destroyRef` + `Subscription`) to cancel in-flight requests when the component is destroyed. Angular 17's `DestroyRef` is available in standalone components via `inject(DestroyRef)`.

4. **Rollback plan:** Each change is independently revertible. The safest rollback order: (a) revert `HomeComponent` to its original template by removing section component imports; (b) revert `ProductCardComponent` to remove new inputs/outputs; (c) revert CatalogService + interceptor + mocks; (d) delete `src/app/sections/` directory; (e) revert `FooterComponent` and `AppComponent` changes. No database migration exists — this is purely a frontend change.

5. **Risk: The mockup uses inline `<style>` that duplicates existing `styles.css` tokens.** Mitigation: Only new section-specific styles (`.flash-wrap`, `.test-grid`, `.rec-overlay`, `.social-row`, etc.) are migrated into each section component's `styles` array. We never duplicate global primitives (`.btn`, `.badge`, `.skeleton`) — they already exist in `src/styles.css`.
