# SDD: Modern E-Commerce Homepage — Aurora Store

| Field | Value |
|---|---|
| **Feature ID** | `001-feat-design-design-and-build-modern-e-co` |
| **Author** | SDD Analyst + PM |
| **Date** | 2026-07-12 |
| **Status** | Draft |
| **Constitution** | `CLAUDE.md` (not present at root; patterns inferred from codebase) |
| **Skills invoked** | `sdd-analyst-pm`, `design-taste-frontend` |

---

## 1. Overview

Build a polished, modern e-commerce homepage for the Aurora Store Angular app. The current `HomeComponent` (`src/app/pages/home.component.ts:14-327`) contains only a hero banner, value proposition strip, category tiles, and a "Featured this week" product grid. This spec expands it into a full, premium e-commerce landing page with 11 sections covering marketing, merchandising, and customer engagement — all with proper loading, empty, error states.

The project is an Angular 17.3 SPA using **standalone components** with `OnPush` change detection throughout. All styling is custom CSS via design tokens defined as CSS custom properties in `src/styles.css:8-63`. **No Angular Material or UI framework is used.** The mock backend runs via an HTTP interceptor (`src/app/mock/mock-backend.interceptor.ts`) with 350ms simulated latency.

---

## 2. Goals & Non-goals

### Goals

- Refactor `HomeComponent` into a section-based layout with **11 sections** (Hero, Search, Categories, Featured Products, Best Sellers, Flash Sale, Personalized Recommendations, Brand Section, Testimonials, Newsletter Signup, Footer).
- Retrofit the existing `ProductCardComponent` to include all required card elements: **image, name, star rating, price, discount badge, stock status badge, wishlist toggle, quick-view button, add-to-cart button**.
- Add **loading (skeleton), empty (friendly message), and error (message + retry)** states to every data-driven section.
- Add mock fixtures for new data shapes (testimonials, brands, flash-sale products, discount metadata).
- Keep all components standalone, inline-templated, OnPush.

### Non-goals

- **Not** adding Angular Material or any third-party UI library.
- **Not** building a real ML engine for Personalized Recommendations (placeholder only).
- **Not** implementing a backend write path for newsletter signups (mock-only at this stage).
- **Not** adding routing for homepage sections (everything lives on `/`).
- **Not** altering the existing product detail, cart, or order flow.
- **Not** adding E2E or visual tests in this spec (deferred to implementation phase).

---

## 3. Existing Codebase Grounding

All file references below are relative to the project root.

### 3.1 Project structure (standalone Angular 17.3)

| Path | Role |
|---|---|
| `src/main.ts` | Bootstrap via `bootstrapApplication(AppComponent, appConfig)` |
| `src/app/app.config.ts:15-23` | App providers: `provideRouter`, `provideHttpClient`, mock interceptor conditional |
| `src/app/app.routes.ts:7-31` | Routes: `''` → HomeComponent, `'products'` → ProductListComponent, `'products/:sku'` → ProductDetailComponent, `'cart'` → CartComponent |
| `src/app/app.component.ts:12-42` | Root shell: `<app-header>` + `<router-outlet>` + `<app-footer>` |

### 3.2 Existing services (data layer)

| Service | File | Key methods |
|---|---|---|
| `CatalogService` | `src/app/data/catalog.service.ts:16-44` | `getProducts()`, `getProduct(sku)`, `getCategories()`, `getInventoryItem(sku)`, `searchInventory(query)` |
| `CartService` | `src/app/data/cart.service.ts:15-74` | `seed()`, `add(product, qty?)`, `setQuantity(sku, qty)`, `remove(sku)`, `clear()`. Signals: `lines`, `count`, `subtotal`, `currency` |
| `OrderService` | `src/app/data/order.service.ts` (implied by product-detail imports) | `placeOrder(sku, quantity)` |

### 3.3 Existing domain models

Defined in `src/app/data/models.ts:10-78`:

```typescript
Product { sku, name, description, price, currency, categoryId, imageUrl|null, stock, rating, tags }
Category { id, name, slug, productCount }
CartItem { sku, name, quantity, unitPrice }
Cart { id, items, subtotal, currency }
InventoryItem { sku, name?, stock }
```

**Key gap:** There is no `originalPrice`, `discountPercentage`, `salePrice`, `endDate` (for flash sale), or `isWishlisted` field on the `Product` model. These must be added.

### 3.4 Existing shared components

| Component | File | Notes |
|---|---|---|
| `ProductCardComponent` | `src/app/shared/product-card.component.ts:14-184` | Image with fallback, category label, name (2-line clamp), star rating, price, stock badges (sold-out/low-stock/new), add-to-cart button. **Missing:** discount badge, wishlist toggle, quick-view button. Selector: `app-product-card` |
| `StarRatingComponent` | `src/app/shared/star-rating.component.ts:8-57` | Five-star display with partial-fill. Inputs: `rating`, `showValue`. Selector: `app-star-rating` |

### 3.5 Existing layout components

| Component | File | Notes |
|---|---|---|
| `HeaderComponent` | `src/app/layout/header.component.ts:13-214` | Sticky header with brand, nav, search (submits via router to `/products?q=`), cart badge. Search has placeholder "Search products…" but no auto-focus. |
| `FooterComponent` | `src/app/layout/footer.component.ts:7-144` | Brand column + Shop/Company/Support link groups + payment strip (VISA/MC/AMEX/PayPal). Already fairly complete. |

### 3.6 Existing HomeComponent

`src/app/pages/home.component.ts:14-327` — current sections:
- **Hero**: Full-width with headline, lede, two CTA buttons (shop all, explore audio), trust strip. Decorative blob art. No CTA image or carousel.
- **Value strip**: 4 inline items (free shipping, returns, warranty, dispatch). Hardcoded data.
- **Categories**: 5 tiles (from `CatalogService.getCategories()`), links to `/products?category=X`.
- **Featured**: Top-4 products by rating from `CatalogService.getProducts()`. 4-column grid with `app-product-card`. Skeleton loading. **No empty state. No error state with retry.**

### 3.7 Existing mock data

| File | Exports | Notes |
|---|---|---|
| `src/mocks/products.mock.ts:18-94` | `PRODUCTS: Product[]` (6 items) | Edge cases: long name (SKU-003), null image (SKU-004), out of stock (SKU-005), low stock (SKU-006). Tags: `bestseller`, `new`, `premium`, `eco`, `sold-out`, `low-stock`. **No discount fields.** |
| `src/mocks/categories.mock.ts:4-10` | `CATEGORIES: Category[]` (5 items) | Includes empty category (wearables). |
| `src/mocks/cart.mock.ts:7-23` | `CART`, `EMPTY_CART` | Populated + empty. |
| `src/mocks/orders.mock.ts:7-43` | `ORDERS: Order[]` (4 items) | All statuses. |
| `src/mocks/user.mock.ts:4-18` | `USER_PROFILE` | Single user. |
| `src/mocks/types.ts:10-88` | All mock interfaces | Mirror app models but framework-free. |
| `src/mocks/index.ts:5-11` | Barrel | Re-exports all mock modules. |
| `src/mocks/mock-search.util.ts` | `searchInventory`, `toInventoryItem`, `decrementStock` | Search & inventory helpers. |

### 3.8 Mock backend interceptor

`src/app/mock/mock-backend.interceptor.ts:61-147` — handles:
- `GET /api/products` → returns all products with live stock
- `GET /api/products/:sku` → single product
- `GET /api/categories` → all categories
- `GET /api/inventory/:sku` → single inventory item
- `GET /api/inventory/search?q=` → search results
- `GET /api/cart` (+ `?state=empty`) → cart
- `POST /api/orders` → place order (1500ms eventual consistency)
- `GET /api/orders` → order history
- `GET /api/user/profile` → user profile
- All unmatched `/api/*` → 404

### 3.9 Design system tokens

`src/styles.css:8-63` — CSS custom properties include:
- Colors: `--bg`, `--surface`, `--ink`, `--accent`, `--success`, `--warn`, `--danger`, `--sale`
- Radii: `--r-sm`(8px) through `--r-xl`(26px), `--r-pill`
- Shadows: `--shadow-xs` through `--shadow-lg`
- Layout: `--container`(1200px), `--gutter`, `--header-h`
- Motion: `--ease` (custom bezier), `--dur`(180ms)

Global primitives (`.container`, `.section`, `.btn`, `.badge`, `.skeleton`, `.card`, `.input`, `.chip`, etc.) available for all components.

---

## 4. Design / Architecture

### 4.1 Section composition

The homepage will be a single scrollable page composed of sections. Each data-driven section follows a consistent pattern:

```
<section class="container section">
  <div class="section-head">
    <div>
      <span class="eyebrow">Section label</span>
      <h2>Section title</h2>
    </div>
    <a class="link-arrow" *ngIf="viewAllLink">View all →</a>
  </div>

  <!-- Loading skeleton -->
  <div class="grid" *ngIf="loading()">
    <div class="sk skeleton" *ngFor="let i of [1,2,3,4]"></div>
  </div>

  <!-- Error -->
  <div class="section-error" *ngIf="error()">
    <p>Something went wrong loading this section.</p>
    <button class="btn btn-outline" (click)="retry()">Retry</button>
  </div>

  <!-- Empty -->
  <div class="section-empty" *ngIf="!loading() && !error() && items().length === 0">
    <p>Nothing to show here yet.</p>
  </div>

  <!-- Data -->
  <div class="grid" *ngIf="!loading() && !error() && items().length > 0">
    <app-product-card *ngFor="..." ...></app-product-card>
  </div>
</section>
```

All sections that fetch data receive an `error` signal and a `retry` callback. Sections that are purely presentational (hero, value strip, newsletter, brand section with static data) do not need loading/empty/error states.

### 4.2 Component tree

```
AppComponent
├── HeaderComponent             (existing)
├── RouterOutlet
│   └── HomeComponent           (REFACTOR: split into section components)
│       ├── HeroSection         (refactor inline hero)
│       ├── SearchSection       (NEW — prominent homepage search)
│       ├── CategoriesSection   (extract from inline)
│       ├── FeaturedSection     (extract from inline, add states)
│       ├── BestSellersSection   (NEW)
│       ├── FlashSaleSection     (NEW)
│       ├── RecommendationsSection (NEW — placeholder)
│       ├── BrandSection        (NEW)
│       ├── TestimonialsSection  (NEW)
│       ├── NewsletterSection   (NEW)
│       └── FooterComponent     (existing, already in AppComponent)
└── FooterComponent             (existing)
```

**Decision:** Each section will be extracted into its own standalone component under `src/app/sections/`. This follows the codebase's standalone component pattern (HeaderComponent, FooterComponent, ProductCardComponent, StarRatingComponent), keeps each file focused (~100 lines average), enables isolated testing, and follows Angular's idiomatic component-per-file convention.

### 4.3 New API contract

New endpoints the mock backend must support:

| Method | Endpoint | Returns | Purpose |
|---|---|---|---|
| `GET` | `/api/products/best-sellers` | `Product[]` | Products tagged `bestseller` |
| `GET` | `/api/products/flash-sale` | `FlashSale` | Flash sale with products + end time |
| `GET` | `/api/testimonials` | `Testimonial[]` | Customer testimonials |
| `GET` | `/api/brands` | `Brand[]` | Partner brand logos |
| `POST` | `/api/newsletter/subscribe` | `{ success: true }` | Email capture |

**Decision:** New backend endpoints as defined in the table above will be implemented in the mock backend interceptor. This keeps the data layer consistent (service methods call HTTP endpoints), avoids coupling section components to client-side filtering logic, and makes future real backend migration transparent. Client-side filtering is used only when no dedicated endpoint exists (e.g., FeaturedSection sorts by rating from the full product list).

---

## 5. Data Model Changes

### 5.1 Enriched Product model

Extend `src/app/data/models.ts` and `src/mocks/types.ts` with discount fields:

```typescript
// Add to existing Product interface
export interface Product {
  // ... existing fields ...
  
  /** Original price before discount. Null means no active discount. */
  originalPrice?: number | null;
  /** Percentage discount to display on badge, e.g. 20 means "20% OFF". */
  discountPercentage?: number | null;
  /** Sale end date (ISO string) for countdown timers. Null if no time constraint. */
  saleEndsAt?: string | null;
}
```

### 5.2 New domain models

Add to `src/app/data/models.ts` and `src/mocks/types.ts`:

```typescript
export interface FlashSale {
  id: string;
  name: string;
  /** ISO 8601 timestamp when the sale ends. */
  endsAt: string;
  products: Product[];
}

export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorTitle?: string;
  avatarUrl: string | null;
  rating: number; // 1-5
}

export interface Brand {
  id: string;
  name: string;
  /** URL to brand logo image. Null → render brand name as text. */
  logoUrl: string | null;
}

export interface NewsletterResponse {
  success: boolean;
  message?: string;
}
```

### 5.3 New service methods

Add to existing `CatalogService` (`src/app/data/catalog.service.ts`):

```typescript
getBestSellers(): Observable<Product[]>     // GET /api/products/best-sellers
getFlashSale(): Observable<FlashSale | null> // GET /api/products/flash-sale
getTestimonials(): Observable<Testimonial[]>  // GET /api/testimonials
getBrands(): Observable<Brand[]>             // GET /api/brands
subscribeToNewsletter(email: string): Observable<NewsletterResponse> // POST /api/newsletter/subscribe
```

---

## 6. Component Specifications

### 6.1 ProductCardComponent — retrofit

**File:** `src/app/shared/product-card.component.ts` (modify existing)

**Current:** Image (with fallback), category label, name (2-line clamp), star rating, price, stock badges (sold-out/low-stock/new), add-to-cart button.

**Required additions:**
1. **Discount badge** — Show `badge-sale` with `-20%` text when `product.discountPercentage` is truthy. Position above the image, to the left of the stock tag row.
2. **Wishlist toggle** — Icon button (heart SVG) in top-right corner of the image area. Filled when wished, outline when not. Should not trigger card navigation (`@Output() toggleWishlist`).
3. **Quick-view button** — Overlay button that appears on image hover: "Quick view". Emits `@Output() quickView`. **Decision:** The handler in each section component navigates to the product detail page (`/products/:sku`) via the Angular Router. This uses existing infrastructure (no new modal/drawer primitives needed) and provides immediate value. The `quickView` Output remains on ProductCardComponent for future enhancement — once a modal/drawer is built, the handler can be swapped without touching the card component.
4. **Original price strikethrough** — When `originalPrice` is set, show original price with line-through next to the discounted price in `--ink-3`.

**Output additions:**
```typescript
@Output() toggleWishlist = new EventEmitter<Product>();
@Output() quickView = new EventEmitter<Product>();
```

**Input addition:**
```typescript
@Input() wishlisted = false;
```

### 6.2 HeroSection

**Status:** Refactor from existing inline `HomeComponent` hero block.

**Layout:**
- Full-width background gradient (`radial-gradient` as currently used).
- Two-column grid: copy (headline, subtitle, CTAs, trust badges) | decorative art.
- **New:** Promotional banner / badge ("New season · 2026" already exists as eyebrow).
- **No data fetching** — purely presentational.

**Existing code at** `src/app/pages/home.component.ts:20-50` (template) and `:112-188` (styles).

### 6.3 SearchSection

**Status:** New section (but search bar already exists in `HeaderComponent`).

**Rationale:** The header search is compact. The homepage should feature a prominent search bar with:
- Large input (`font-size: 18px`, `padding: 16px 20px`).
- Placeholder: "Search 100+ products…"
- Auto-focus on page load when not already focused elsewhere.
- Submits to `/products?q=<query>` on enter.
- Live search suggestions could be added later — out of scope for now.

**Decision:** A separate, prominent large-input search section on the homepage (placed below the hero, above categories). The header search remains compact for non-homepage use. The homepage search uses `font-size: 18px`, `padding: 16px 20px`, placeholder "Search 100+ products…", auto-focus on page load, and submits to `/products?q=<query>` on enter. Live search suggestions are deferred to a future enhancement.

### 6.4 CategoriesSection

**Status:** Extract from existing inline `HomeComponent`. Keep behavior identical. Add loading/error/empty states.

**Current:** `src/app/pages/home.component.ts:63-84` — 5-column tile grid from `CatalogService.getCategories()`.

**Enhancements:**
- Loading: 5 skeleton tiles.
- Error: message + retry button.
- Empty: friendly message.

### 6.5 FeaturedSection

**Status:** Extract from existing inline `HomeComponent`. Add error+empty states.

**Current:** `src/app/pages/home.component.ts:86-107` — Top-4 products by rating from `CatalogService.getProducts()`. Has skeleton loading but no error/empty.

### 6.6 BestSellersSection

**Status:** New.

**Data source:** `GET /api/products/best-sellers` or client-side filter `products.filter(p => p.tags.includes('bestseller'))`.

**Layout:** Product grid (4 columns), `app-product-card` instances.

**States:**
- Loading: 4 skeleton cards.
- Error: message + retry.
- Empty: "Top sellers coming soon — check back later."

### 6.7 FlashSaleSection

**Status:** New.

**Data source:** `GET /api/products/flash-sale` returns `FlashSale` object.

**Layout:**
- Distinct visual treatment: accent/sale-colored border or background.
- Countdown timer: `HH:MM:SS` ticking down to `endsAt`.
- Product cards with discount badges visible.
- When countdown reaches zero, section shows "This sale has ended" message.

**States:**
- Loading: skeleton timer + 4 skeleton cards.
- Error: message + retry.
- Empty/sale-ended: "No active flash sales right now. Check back soon!"
- **Null flash sale:** If API returns `null`, section is hidden entirely (no empty state shown).

**Countdown implementation:** Use `interval(1000)` + signal to update remaining time. Format as `DH:MM:SS` if >24h, `HH:MM:SS` if <24h, or "Ended" if past.

### 6.8 RecommendationsSection

**Status:** New — placeholder.

**Layout:** Same product grid pattern. Header text: "Picked for you" / "You might also like."

**Behavior:** Shows 4 skeleton cards with a "Personalized recommendations coming soon" message overlay. No data fetching yet. This is a **design placeholder** for future ML integration.

**Decision:** Show a visible placeholder with 4 skeleton cards and a "Personalized recommendations coming soon" message overlay. This stakes the design real estate so the layout is stable from launch, communicates the future feature to users, and demonstrates the skeleton loading pattern. Random products as stand-ins would feel broken once swapped for real ML — a placeholder is more honest.

### 6.9 BrandSection

**Status:** New.

**Data source:** `GET /api/brands` returns `Brand[]`.

**Layout:** Horizontal scrolling logo grid or centered flex-wrap grid. Each brand shows logo image (with placeholder fallback for missing/null `logoUrl`).

**States:**
- Loading: 6 skeleton logo circles/rectangles.
- Error: message + retry.
- Empty: hidden (no brands → no section).

### 6.10 TestimonialsSection

**Status:** New.

**Data source:** `GET /api/testimonials` returns `Testimonial[]`.

**Layout options (choose one):**
1. **Horizontal carousel** — scrollable row of quote cards with left/right arrows.
2. **Grid** — 2×2 or 3-column grid of quote cards.
3. **Single rotating quote** — fade-in/fade-out every 6 seconds.

**Card design:** Avatar (circular, fallback to initials), quote text, author name, optional title, star rating.

**States:**
- Loading: 2-3 skeleton testimonial cards.
- Error: message + retry.
- Empty: hidden.

**Decision:** Static 3-column grid. The codebase has zero carousel infrastructure and no animation framework beyond CSS transitions. A static grid aligns with existing section layouts (Categories uses a 5-column CSS grid, Featured uses a 4-column grid) and is accessible by default — no JS interaction required, keyboard navigation is trivial, and it degrades gracefully on narrow viewports.

### 6.11 NewsletterSection

**Status:** New.

**Layout:**
- Full-width background section (can use `--accent-soft` or contrasting surface).
- Headline: "Stay in the loop" / "Get 10% off your first order."
- Email input + Subscribe button (inline, side-by-side).
- Email validation: required, valid format, show inline error for invalid.
- Success state: thank-you message replaces the form.
- Error state: inline error message with retry.

**States:**
- Idle: Show email form.
- Submitting: Button shows "Subscribing…", input disabled.
- Success: "Thanks for subscribing! Check your inbox for 10% off." Form hidden.
- Error: "Something went wrong. Please try again." Form remains, button re-enabled.

**Validation:** Client-side only. Uses `@angular/forms` `FormControl` with `Validators.email` and `Validators.required`.

### 6.12 FooterComponent

**Status:** Already exists at `src/app/layout/footer.component.ts:7-144`. Already rendered in `AppComponent`. No changes needed unless social links are added.

**Decision:** Add social media links (Twitter/X, Instagram, GitHub) using inline SVG icons, following the same pattern as the header's existing SVG icons (search icon at `header.component.ts:34-41`, cart icon at lines 54-61). Place them in the footer's brand column between the description and the payment strip. This is consistent with the app's existing SVG usage and the no-external-dependency constraint.

---

## 7. Mock Data Additions

### 7.1 New mock files

| File | Export | Contents |
|---|---|---|
| `src/mocks/testimonials.mock.ts` | `TESTIMONIALS: Testimonial[]` | 3-4 testimonials with varied ratings, one with null avatar |
| `src/mocks/brands.mock.ts` | `BRANDS: Brand[]` | 5-6 brand logos (use `picsum.photos` or text placeholders) |

### 7.2 Updates to existing files

**`src/mocks/products.mock.ts`:**
- Add `originalPrice`, `discountPercentage`, `saleEndsAt` to at least 2 products to exercise discount badges.
- Add at least 2 products with `tags.includes('bestseller')` if not already present (SKU-001 already has `'bestseller'` tag).

**`src/mocks/index.ts`:**
- Add `export * from './testimonials.mock'` and `export * from './brands.mock'`.

### 7.3 Flash sale fixture

Add to `src/mocks/products.mock.ts` or new file:

```typescript
export const FLASH_SALE: FlashSale = {
  id: 'flash-jul-2026',
  name: 'July Flash Sale',
  endsAt: '2026-07-14T23:59:00.000Z', // 2 days from "today" (2026-07-12)
  products: [
    // 2-3 products with discounts applied
  ]
};
```

### 7.4 Mock interceptor updates

Add handlers in `src/app/mock/mock-backend.interceptor.ts` for:
- `GET /api/products/best-sellers` → filter `PRODUCTS` by `tags.includes('bestseller')`
- `GET /api/products/flash-sale` → return `FLASH_SALE` or `null` (maybe use `?state=ended` query param)
- `GET /api/testimonials` → return `TESTIMONIALS`
- `GET /api/brands` → return `BRANDS`
- `POST /api/newsletter/subscribe` → validate email, return `{ success: true }` (always succeed in mock)

---

## 8. Implementation Plan

### Phase 1: Data layer (models + mocks + services)

1. Extend `Product` model with discount fields in both `src/app/data/models.ts` and `src/mocks/types.ts`.
2. Add `FlashSale`, `Testimonial`, `Brand`, `NewsletterResponse` interfaces to both files.
3. Create `src/mocks/testimonials.mock.ts` and `src/mocks/brands.mock.ts`.
4. Update `src/mocks/products.mock.ts` with discount data and more bestseller tags.
5. Add flash sale fixture to `src/mocks/` (or extend products).
6. Update `src/mocks/index.ts` barrel.
7. Add handler routes to `src/app/mock/mock-backend.interceptor.ts`.
8. Add new methods to `CatalogService`. The existing service already serves both product and category data — it is the de facto "product marketing" data layer. The new methods (`getBestSellers`, `getFlashSale`, `getTestimonials`, `getBrands`, `subscribeToNewsletter`) are all read-model queries of the same mock data, so a separate service would be premature abstraction. If the marketing surface grows significantly, extraction to a dedicated service can happen later.

### Phase 2: Component retrofit

1. Update `ProductCardComponent`:
   - Add discount badge (`.badge-sale`) conditional on `discountPercentage`.
   - Add wishlist heart icon (top-right, emits `toggleWishlist`).
   - Add quick-view overlay button (on image hover, emits `quickView`).
   - Add original price strikethrough when `originalPrice` set.
   - Add `@Input() wishlisted` and `@Output() toggleWishlist`, `@Output() quickView`.

### Phase 3: Section extraction & creation

1. Create section components under `src/app/sections/`:
   - `hero-section.component.ts`
   - `search-section.component.ts`
   - `categories-section.component.ts`
   - `featured-section.component.ts`
   - `best-sellers-section.component.ts`
   - `flash-sale-section.component.ts`
   - `recommendations-section.component.ts`
   - `brand-section.component.ts`
   - `testimonials-section.component.ts`
   - `newsletter-section.component.ts`

2. Each data-fetching section implements: `loading()`, `error()`, `retry()`, and the appropriate data signal.

### Phase 4: HomeComponent refactor

1. Replace inline HTML with section components in order.
2. Remove old inline hero, categories, featured blocks.
3. Wire up `add-to-cart` (via `CartService.add()`), `toggleWishlist` (via `WishlistService` — signal-based, following the CartService pattern), `quick-view` (navigate to `/products/:sku` via the Angular Router).

### Phase 5: Polish

1. Responsive breakpoints for each new section (follow existing patterns at `@media (max-width: 980px)` and `@media (max-width: 560px)`).
2. `prefers-reduced-motion` support (already global in `src/styles.css:372-377`).
3. Keyboard navigation for carousel (if chosen), newsletter form, wishlist buttons.

---

## Decisions

All of the following decisions were adopted automatically from proposed defaults (no stakeholder input was available), folded into the relevant sections above, and recorded here for auditability.

| # | Topic | Decision |
|---|---|---|
| 1 | Section component architecture | Extract each section into its own standalone component under `src/app/sections/`. Follows the codebase's existing standalone-component pattern. |
| 2 | Search section design | A separate, prominent large-input search section on the homepage (below hero, above categories). Header search stays compact for non-homepage use. |
| 3 | Quick-view target | Navigate to product detail page (`/products/:sku`) via Angular Router. The `quickView` Output is retained on ProductCardComponent for future modal/drawer swap-in. |
| 4 | Recommendations section behavior | Visible placeholder with 4 skeleton cards and "Personalized recommendations coming soon" overlay. No data fetching; design real estate staked for future ML integration. |
| 5 | Testimonials layout | Static 3-column grid. Zero carousel infrastructure exists; a grid aligns with existing section layouts and is accessible by default. |
| 6 | Flash sale null state | Hide entirely from DOM when API returns `null`. `@if (flashSale(); as sale)` guard. "Sale ended" message only displays when an active sale expires during the session. |
| 7 | Wishlist persistence | New `WishlistService` with `wishlistedSkus: Signal<Set<string>>`, following `CartService`'s signal pattern. Persists within the session across navigation. |
| 8 | Brand logo image service | Use `picsum.photos` for brand logo URLs (consistent with existing product images). For `logoUrl: null`, render brand name initials as styled text fallback. |
| 9 | Social footer links | Add Twitter/X, Instagram, GitHub using inline SVG icons in the footer brand column (between description and payment strip). Follows existing header SVG pattern. |
| 10 | Newsletter API failure mode | Support `?fail=true` query param to return 500 (for testing). Always succeeds by default. Follows the existing `?state=empty` pattern on the cart endpoint. |
| 11 | Service organization | Add new methods (`getBestSellers`, `getFlashSale`, `getTestimonials`, `getBrands`, `subscribeToNewsletter`) to `CatalogService`. Extraction to a dedicated service is deferred until the marketing surface grows significantly. |
| 12 | Discount field on existing fixtures | Add to SKU-001 (`originalPrice: 249.99`, `discountPercentage: 20`, `saleEndsAt: null`) and SKU-003 (`originalPrice: 1799.00`, `discountPercentage: 17`, `saleEndsAt: '2026-07-20T23:59:00.000Z'`). Exercises discount badges in FeaturedSection and BestSellersSection. Flash sale fixture gets its own deeper-discount entries. |
