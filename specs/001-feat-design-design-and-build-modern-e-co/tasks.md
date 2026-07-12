# Tasks — Modern E-Commerce Homepage (Aurora Store)

> **Feature ID:** `001-feat-design-design-and-build-modern-e-co`
> **Date:** 2026-07-12
> **Plan refs key:** Files under `specs/001-feat-design-design-and-build-modern-e-co/plan/`

---

## Story S1 — Data Models & Types

**Plan refs:** `plan/data-layer.md`

### Description
Extend the `Product` interface with optional discount fields (`originalPrice`, `discountPercentage`, `saleEndsAt`) in both `src/app/data/models.ts` and `src/mocks/types.ts`. Add four new domain interfaces: `FlashSale`, `Testimonial`, `Brand`, `NewsletterResponse` to both files.

### Acceptance Criteria
- `Product` in `src/app/data/models.ts` has `originalPrice?`, `discountPercentage?`, `saleEndsAt?` as optional fields.
- `Product` in `src/mocks/types.ts` mirrors the same optional fields.
- `FlashSale`, `Testimonial`, `Brand`, `NewsletterResponse` interfaces exist in both files with shapes matching the spec (Section 5).
- All interfaces use JSDoc comments matching existing conventions (`models.ts:10-78`).
- Existing code compiles without errors — all new fields are optional.

### UX flows / components involved
None directly (foundational data layer). Enables: S6 (ProductCardComponent discount fields), S11 (FlashSaleSection), S14 (BrandSection), S15 (TestimonialsSection), S16 (NewsletterSection).

### Tests
1. Instantiate `Product` with all new optional fields set — no compile error.
2. Instantiate `Product` without any new optional fields — no compile error, fields are `undefined`.
3. Instantiate `FlashSale` with required fields — validates shape.
4. Instantiate `Testimonial` with `avatarUrl: null` — validates null handling.
5. Instantiate `Brand` with `logoUrl: null` — validates null handling.
6. Instantiate `NewsletterResponse` — validates shape.

---

## Story S2 — Mock Data Fixtures

**Plan refs:** `plan/data-layer.md`

### Description
Create `src/mocks/testimonials.mock.ts` and `src/mocks/brands.mock.ts` with fixture data. Update `src/mocks/products.mock.ts` with discount fields on SKU-001 and SKU-003, ensure bestseller tags on at least 2 products, and add `FLASH_SALE` fixture. Update `src/mocks/index.ts` barrel.

### Acceptance Criteria
- `TESTIMONIALS: Testimonial[]` has 3-4 entries; at least one has `avatarUrl: null`; ratings range 3-5.
- `BRANDS: Brand[]` has 5-6 entries; at least 2 have `logoUrl: null`.
- SKU-001 has `originalPrice: 249.99`, `discountPercentage: 20`, `saleEndsAt: null`.
- SKU-003 has `originalPrice: 1799.00`, `discountPercentage: 17`, `saleEndsAt: '2026-07-20T23:59:00.000Z'`.
- At least 2 products have `tags.includes('bestseller')`.
- `FLASH_SALE` is exported with `endsAt` in the future (2026-07-14T23:59:00.000Z) and 2-3 discounted products.
- `src/mocks/index.ts` re-exports `./testimonials.mock` and `./brands.mock`.
- All fixtures compile without type errors.

### UX flows / components involved
Provides data for: S11 (FlashSaleSection), S14 (BrandSection), S15 (TestimonialsSection), S6 (discount badge display on featured/best-seller products).

### Tests
1. `TESTIMONIALS.length >= 3`.
2. `TESTIMONIALS.some(t => t.avatarUrl === null)`.
3. `BRANDS.length >= 5`.
4. `BRANDS.some(b => b.logoUrl === null)`.
5. `FLASH_SALE.endsAt` is a valid future ISO date string.
6. `FLASH_SALE.products.length >= 2`.
7. SKU-001 `originalPrice === 249.99` and `discountPercentage === 20`.
8. SKU-003 `originalPrice === 1799.00` and `discountPercentage === 17`.

---

## Story S3 — Mock Backend Interceptor

**Plan refs:** `plan/mock-backend.md`

### Description
Add 5 new route handlers to `src/app/mock/mock-backend.interceptor.ts`: `GET /api/products/best-sellers`, `GET /api/products/flash-sale`, `GET /api/testimonials`, `GET /api/brands`, `POST /api/newsletter/subscribe`. Follow existing handler pattern (`ok()` helper, `LATENCY_MS`, `param()` for query parsing).

### Acceptance Criteria
- `GET /api/products/best-sellers` returns products filtered by `tags.includes('bestseller')`.
- `GET /api/products/flash-sale` returns `FLASH_SALE` fixture; `?state=ended` returns `null`.
- `GET /api/testimonials` returns `TESTIMONIALS`.
- `GET /api/brands` returns `BRANDS`.
- `POST /api/newsletter/subscribe` with valid email returns `{ success: true }`; with empty/missing email returns 400; with `?fail=true` returns 500.
- All handlers use the existing `ok(resp)` helper and `LATENCY_MS` simulated delay.
- Unknown `/api/*` routes continue to return 404.
- Existing interceptor routes remain unchanged.

### UX flows / components involved
F3 (loading states), F4 (error states), F5 (empty states), F6 (newsletter lifecycle). Provides wire data for all data-driven sections.

### Tests
1. `GET /api/products/best-sellers` returns array where every item has `tags.includes('bestseller')`.
2. `GET /api/products/flash-sale` returns `FlashSale` object with future `endsAt`.
3. `GET /api/products/flash-sale?state=ended` returns `null`.
4. `GET /api/testimonials` returns array of length >= 3.
5. `GET /api/brands` returns array of length >= 5.
6. `POST /api/newsletter/subscribe` with `{ email: "a@b.com" }` returns `{ success: true }`.
7. `POST /api/newsletter/subscribe` with `{ email: "" }` returns 400.
8. `POST /api/newsletter/subscribe?fail=true` returns 500.

---

## Story S4 — CatalogService Methods

**Plan refs:** `plan/services.md`

### Description
Add 5 new methods to `src/app/data/catalog.service.ts`: `getBestSellers()`, `getFlashSale()`, `getTestimonials()`, `getBrands()`, `subscribeToNewsletter(email)`. Each calls the corresponding HTTP endpoint with typed Observable return.

### Acceptance Criteria
- `getBestSellers(): Observable<Product[]>` calls `GET /api/products/best-sellers`.
- `getFlashSale(): Observable<FlashSale | null>` calls `GET /api/products/flash-sale`.
- `getTestimonials(): Observable<Testimonial[]>` calls `GET /api/testimonials`.
- `getBrands(): Observable<Brand[]>` calls `GET /api/brands`.
- `subscribeToNewsletter(email: string): Observable<NewsletterResponse>` calls `POST /api/newsletter/subscribe` with `{ email }` body.
- All methods follow the existing pattern at `catalog.service.ts:19-43` (typed `this.http.get<T>(url)` / `this.http.post<T>(url, body)`).
- Existing `getProducts()`, `getProduct()`, `getCategories()`, `getInventoryItem()`, `searchInventory()` remain unchanged.

### UX flows / components involved
F1 (all data-driven sections), F6 (newsletter). Provides data access for: S9 (Categories), S10 (Featured), S11 (BestSellers), S12 (FlashSale), S14 (Brands), S15 (Testimonials), S16 (Newsletter).

### Tests
1. `getBestSellers()` calls `GET /api/products/best-sellers` — verify with `HttpTestingController`.
2. `getFlashSale()` calls `GET /api/products/flash-sale`.
3. `getTestimonials()` calls `GET /api/testimonials`.
4. `getBrands()` calls `GET /api/brands`.
5. `subscribeToNewsletter('a@b.com')` calls `POST /api/newsletter/subscribe` with body `{ email: 'a@b.com' }`.
6. Each method returns the correct typed Observable (no type errors).

---

## Story S5 — WishlistService

**Plan refs:** `plan/services.md`

### Description
Create `src/app/data/wishlist.service.ts` — a signal-based service following the `CartService` pattern (`cart.service.ts:15-74`). Provides `wishlistedSkus: Signal<Set<string>>`, `toggle(sku)`, and `isWishlisted(sku)`.

### Acceptance Criteria
- `@Injectable({ providedIn: 'root' })` — no module registration needed.
- `wishlistedSkus` is a `Signal<Set<string>>` exposed as readonly.
- `toggle(sku)` adds SKU to set if absent, removes if present.
- `isWishlisted(sku)` returns `true` if SKU is in set, `false` otherwise.
- State is in-memory only (no API calls). Persists within session across route navigation.
- No circular dependencies.

### UX flows / components involved
F7 (wishlist toggle). Used by: S6 (ProductCardComponent), S17 (HomeComponent wiring).

### Tests
1. `toggle('SKU-001')` → `isWishlisted('SKU-001')` returns `true`.
2. `toggle('SKU-001')` again → `isWishlisted('SKU-001')` returns `false`.
3. `wishlistedSkus()` returns a `Set` — verify `.has()` and `.size`.
4. Multiple toggles: add 3 SKUs, verify `size === 3`, remove one, verify `size === 2`.
5. `isWishlisted('NONEXISTENT')` returns `false` without error.

---

## Story S6 — ProductCardComponent Retrofit

**Plan refs:** `plan/product-card.md`

### Description
Retrofit `src/app/shared/product-card.component.ts` with: discount badge (`.badge-sale`), wishlist heart toggle (inline SVG), quick-view overlay button (appears on hover), original price strikethrough. Add `@Input() wishlisted`, `@Output() toggleWishlist`, `@Output() quickView`.

### Acceptance Criteria
- **Discount badge:** When `product.discountPercentage` is set, a `.badge-sale` element displays `-{N}%` in the `.tag-row` to the left of existing stock badges. Hidden when `discountPercentage` is null/undefined.
- **Wishlist toggle:** `<button>` in top-right of `.media` area. SVG heart: outline when `wishlisted === false`, filled when `wishlisted === true`. `aria-label` reads "Add {name} to wishlist" or "Remove {name} from wishlist". Click emits `toggleWishlist` with product.
- **Quick-view overlay:** `<button>` centered in `.media`, visible on hover with `opacity` transition. Text: "Quick view". `aria-label="Quick view {name}"`. Click emits `quickView` with product. On touch devices (`@media (hover: none)`), always visible.
- **Original price strikethrough:** When `product.originalPrice` is set, `<span class="price-old">$originalPrice</span>` in `--ink-3` with `text-decoration: line-through` appears beside the discounted price.
- New Inputs/Outputs do not break existing consumers. All existing `@Input({ required: true }) product` and `@Output() add` remain unchanged.

### UX flows / components involved
F1 (step 5: card interactions), F7 (wishlist toggle), F8 (quick view), F9 (add to cart).

### Tests
1. Mount with `product` having `discountPercentage: 20` → `.badge-sale` exists with text `-20%`.
2. Mount with `product` having no discount → `.badge-sale` does not exist.
3. Click wishlist heart (outline) → `toggleWishlist` emits product.
4. Set `wishlisted = true` → heart SVG renders filled. Set `false` → outline.
5. Click quick-view button → `quickView` emits product.
6. Set `product.originalPrice = 199.99` → `.price-old` visible with strikethrough.
7. Set `product.originalPrice = null` → `.price-old` not rendered.
8. All existing tests for `ProductCardComponent` pass (no regressions).

---

## Story S7 — HeroSection

**Plan refs:** `plan/sections.md`

### Description
Extract the hero block from `src/app/pages/home.component.ts` into `src/app/sections/hero-section.component.ts`. Standalone component, OnPush, presentational (no data fetching). Copy existing radial-gradient background, two-column layout (copy + decorative art), eyebrow, h1, lede, dual CTAs, trust strip.

### Acceptance Criteria
- Selector: `app-hero-section`.
- Template matches existing hero: full-width radial-gradient bg, two-column grid `1.15fr 0.85fr`, eyebrow "New season · 2026", h1 "Considered gear for the modern desk", lede, `.btn.btn-lg` primary CTA, `.btn.btn-lg.btn-outline` secondary CTA, trust strip (rating, returns, warranty), decorative blob art, glass panel.
- No data fetching — purely presentational.
- Component does not accept any inputs or emit any outputs.
- Existing inline hero code removed from `HomeComponent`.

### UX flows / components involved
F1 (step 1-2: hero browsing).

### Tests
1. Component renders in TestBed without errors.
2. Eyebrow text "New season · 2026" is present in DOM.
3. h1 text is present.
4. Two CTA buttons render with correct classes (`.btn.btn-lg` and `.btn.btn-lg.btn-outline`).
5. Trust strip elements render (rating, returns, warranty text).
6. Decorative art (`.blob`, `.glass`) elements render.
7. Component uses `OnPush` change detection.

---

## Story S8 — SearchSection

**Plan refs:** `plan/sections.md`

### Description
Create `src/app/sections/search-section.component.ts` — a prominent homepage search bar below the hero. Large input (18px font, 16px 20px padding), placeholder "Search 100+ products…", auto-focus on mount, submits to `/products?q=<query>` on Enter.

### Acceptance Criteria
- Selector: `app-search-section`.
- Section uses `role="search"`.
- `<input type="search">` with `font-size: 18px`, `padding: 16px 20px`, `--r-lg` radius.
- Placeholder text: "Search 100+ products…".
- Input is auto-focused on component mount (unless another element already focused).
- Pressing Enter with non-empty value navigates to `/products?q=<query>` via Angular Router.
- Pressing Enter with empty value does nothing.
- Inline SVG search icon positioned inside input (left side, 18px).
- `max-width: 640px`, centered with `margin-inline: auto`.
- No section-head (no eyebrow/title — input is self-explanatory).
- `aria-label="Search products"` on input.

### UX flows / components involved
F1 (step 3: search flow).

### Tests
1. Input renders with placeholder "Search 100+ products…".
2. Input has `aria-label="Search products"`.
3. Section has `role="search"`.
4. Type "headphones" and press Enter → `router.navigate(['/products', { q: 'headphones' }])` called.
5. Empty input + Enter → no navigation.
6. Input has `autofocus` attribute or auto-focus is applied via `ngAfterViewInit`.
7. SVG search icon renders inside the component.

---

## Story S9 — CategoriesSection

**Plan refs:** `plan/sections.md`

### Description
Extract the category tiles from `src/app/pages/home.component.ts` into `src/app/sections/categories-section.component.ts`. Add loading (5 skeleton tiles), error (message + retry), and empty ("No categories available right now.") states. Keep existing 5-column tile grid layout.

### Acceptance Criteria
- Selector: `app-categories-section`.
- Data source: `CatalogService.getCategories()` via the common three-state reactive pattern.
- **Loading state:** 5 skeleton tiles (`.skeleton` with `.sk-cat` shape) when `loading()` is `true`.
- **Error state:** Message "Something went wrong loading this section." + `.btn-outline` "Retry" button. Click retry re-fetches.
- **Empty state:** Centered text "No categories available right now." when data is empty.
- **Idle state:** 5-column grid (14px gap) of `.cat-tile` elements. Each tile: category name, product count, arrow indicator. Links to `/products?category=<slug>` via `<a>` with `[routerLink]`.
- Hover on tile: `translateY(-3px)`, `--shadow-md`, `--line-strong`.
- Uses `<nav aria-label="Product categories">` wrapper.
- Existing inline category code removed from `HomeComponent`.

### UX flows / components involved
F1 (step 4: category browsing), F3 (loading), F4 (error with retry), F5 (empty state).

### Tests
1. **Loading:** Mock service returns observable that never completes → 5 skeleton tiles render.
2. **Error:** Mock service returns `throwError(() => new Error('fail'))` → error message + Retry button render.
3. **Empty:** Mock service returns `of([])` → "No categories available right now." renders.
4. **Data:** Mock service returns `of(categories)` → 5 category tiles render with correct names and counts.
5. Click Retry button → service method called again.
6. Click category tile → router navigates to `/products?category=<slug>`.
7. Component uses `OnPush` change detection.

---

## Story S10 — FeaturedSection

**Plan refs:** `plan/sections.md`

### Description
Extract the featured products grid from `src/app/pages/home.component.ts` into `src/app/sections/featured-section.component.ts`. Add error and empty states (loading skeleton already exists). Top 4 products by rating from `CatalogService.getProducts()`.

### Acceptance Criteria
- Selector: `app-featured-section`.
- Data source: `CatalogService.getProducts()` → client-side sort by rating descending, take top 4.
- Eyebrow "Editor's picks", h2 "Featured this week" in `.section-head`.
- **Loading state:** 4 skeleton cards (`.skeleton` with card dimensions).
- **Error state:** Standard error message + "Retry" button.
- **Empty state:** "Nothing to feature this week — check back soon."
- **Idle state:** 4-column grid (20px gap) of `app-product-card` components.
- Emits `@Output() add = new EventEmitter<Product>()`, `@Output() toggleWishlist = new EventEmitter<Product>()`, `@Output() quickView = new EventEmitter<Product>()` from card interactions.
- Existing inline featured code removed from `HomeComponent`.

### UX flows / components involved
F1 (step 5: featured browsing, card interactions), F3 (loading), F4 (error), F5 (empty).

### Tests
1. **Loading:** 4 skeleton cards render.
2. **Error:** Error message + Retry button render. Click Retry → service re-fetches.
3. **Empty:** "Nothing to feature this week — check back soon." renders.
4. **Data (4+ products):** 4 `app-product-card` components render with highest-rated products.
5. **Data (<4 products):** Renders all available products, no more than 4.
6. `add` event from child `app-product-card` propagates to `@Output() add`.
7. `toggleWishlist` event propagates.
8. `quickView` event propagates.

---

## Story S11 — BestSellersSection

**Plan refs:** `plan/sections.md`

### Description
Create `src/app/sections/best-sellers-section.component.ts` — 4-column product grid showing products tagged `bestseller`. Same card layout pattern as FeaturedSection.

### Acceptance Criteria
- Selector: `app-best-sellers-section`.
- Data source: `CatalogService.getBestSellers()`.
- Eyebrow "Trending", h2 "Best sellers" in `.section-head`.
- **Loading state:** 4 skeleton cards.
- **Error state:** Standard error message + "Retry" button.
- **Empty state:** "Top sellers coming soon — check back later."
- **Idle state:** 4-column grid of `app-product-card` components.
- Emits `add`, `toggleWishlist`, `quickView` outputs.

### UX flows / components involved
F1 (step 6: best sellers browsing), F3 (loading), F4 (error), F5 (empty).

### Tests
1. **Loading:** 4 skeleton cards render.
2. **Error:** Error message + Retry button render. Click Retry → `getBestSellers()` called again.
3. **Empty:** "Top sellers coming soon — check back later." renders.
4. **Data:** `app-product-card` components render for each best-seller product.
5. `add`, `toggleWishlist`, `quickView` events propagate from card children.

---

## Story S12 — FlashSaleSection

**Plan refs:** `plan/sections.md`

### Description
Create `src/app/sections/flash-sale-section.component.ts` — sale-themed container with countdown timer (`interval(1000)` + signal) ticking to `endsAt`, 4-column product grid with discount badges. Distinct visual treatment: `--sale` border/tint.

### Acceptance Criteria
- Selector: `app-flash-sale-section`.
- Data source: `CatalogService.getFlashSale()`.
- Sale container: `.card` wrapper with `border: 2px solid var(--sale)` or `--danger-soft` tinted bg.
- Eyebrow "Limited time", h2 "Flash sale" in `.section-head`.
- Countdown timer in `.section-head` right side: `monospace`, `tabular-nums`, `--sale` color. Updates every second.
  - If `endsAt` > 24h away: format `DH:MM:SS`.
  - If < 24h: format `HH:MM:SS`.
  - If `endsAt` is past: display "Ended".
- **Loading state:** Skeleton timer bar + 4 skeleton cards.
- **Error state:** Standard error message + "Retry" button.
- **Empty state (products array empty):** "No active flash sales right now. Check back soon!"
- **Null API response:** Section hidden entirely (no DOM output) — use `@if (flashSale(); as sale)` guard.
- **Ended state (countdown expired):** Timer shows "Ended". Products remain visible but timer static.
- Countdown uses `interval(1000)` piped through `takeUntilDestroyed()` (or `DestroyRef`).
- `aria-live="polite"` on timer container, updated on minute boundaries to avoid screen reader spam.
- Emits `add`, `toggleWishlist`, `quickView` outputs.

### UX flows / components involved
F1 (step 7: flash sale browsing), F5 (empty/null states), F3 (loading), F4 (error). Edge: countdown timer boundary.

### Tests
1. **Loading:** Skeleton timer + 4 skeleton cards render.
2. **Error:** Error message + Retry button render.
3. **Empty (products[]):** "No active flash sales right now. Check back soon!" renders.
4. **Null data:** Component root element is absent from DOM.
5. **Active sale:** Countdown timer renders with correct format. Timer ticks down.
6. **Ended sale:** Timer displays "Ended". Products remain visible.
7. **Edge:** API returns `endsAt` in past → "Ended" immediately (no ticking phase).
8. `add`, `toggleWishlist`, `quickView` events propagate.

---

## Story S13 — RecommendationsSection

**Plan refs:** `plan/sections.md`

### Description
Create `src/app/sections/recommendations-section.component.ts` — a design placeholder for future ML-powered recommendations. Shows 4 skeleton cards with overlay message "Personalized recommendations coming soon."

### Acceptance Criteria
- Selector: `app-recommendations-section`.
- h2 "Picked for you" in `.section-head`.
- 4 skeleton cards (matching `app-product-card` dimensions) in a 4-column grid.
- Overlay: centered pill (`.rec-pill`) with text "Personalized recommendations coming soon". Uses `position: absolute` inset over grid, `backdrop-filter: blur(2px)`, `--surface` bg.
- No data fetching. No inputs. No outputs.
- No interactive elements within the section.

### UX flows / components involved
F1 (step 8: recommendations placeholder), F2 (step 3: heading "You might also like" for returning visitors).

### Tests
1. 4 skeleton cards render in a grid.
2. Overlay text "Personalized recommendations coming soon" renders.
3. No interactive elements (buttons, links) exist within the component.
4. Component uses `OnPush` change detection.
5. Heading "Picked for you" renders in `.section-head`.

---

## Story S14 — BrandSection

**Plan refs:** `plan/sections.md`

### Description
Create `src/app/sections/brand-section.component.ts` — horizontal flex-wrap row of brand logo tiles. Each tile shows logo image or initials fallback.

### Acceptance Criteria
- Selector: `app-brand-section`.
- Data source: `CatalogService.getBrands()`.
- Eyebrow "Partners", h2 "Brands we love" in `.section-head`.
- **Loading state:** 6 skeleton circles (`.skeleton`, `--r-pill`, 80px × 80px).
- **Error state:** Standard error message + "Retry" button.
- **Empty state:** Section hidden entirely (no DOM output).
- **Idle state:** Horizontal flex-wrap row of `.brand-tile` elements (80px height, 120px width, `--surface` bg, `--line` border, `--r-lg` radius).
  - Logo image inside: `max-height: 48px`, `object-fit: contain`, `alt="<brand name>"`.
  - If `logoUrl` is null OR image load fails: initials fallback (first 2 uppercase chars, 24px/700 weight, `--ink-3`, gradient bg).
  - Hover: `--shadow-sm`, `--line-strong` border.

### UX flows / components involved
F1 (step 9: brand browsing), F3 (loading), F4 (error), F5 (empty → hidden).

### Tests
1. **Loading:** 6 skeleton circles render.
2. **Error:** Error message + Retry button render.
3. **Empty:** Component element not present in DOM.
4. **Data:** Brand tiles render for each brand.
5. Brand with `logoUrl` → `<img>` renders with correct `alt`.
6. Brand with `logoUrl: null` → initials fallback renders (first 2 uppercase chars).
7. Image load failure → falls back to initials.
8. Hover on tile → shadow and border classes applied (CSS test).

---

## Story S15 — TestimonialsSection

**Plan refs:** `plan/sections.md`

### Description
Create `src/app/sections/testimonials-section.component.ts` — static 3-column grid of customer testimonial quote cards. Each card: avatar, quote, author name, optional title, star rating.

### Acceptance Criteria
- Selector: `app-testimonials-section`.
- Data source: `CatalogService.getTestimonials()`.
- Eyebrow "Real reviews", h2 "What our customers say" in `.section-head`.
- **Loading state:** 3 skeleton testimonial cards (avatar circle + 2 text lines).
- **Error state:** Standard error message + "Retry" button.
- **Empty state:** Section hidden entirely (no DOM output).
- **Idle state:** 3-column grid (20px gap) of `.testimonial-card` cards (`.card` + 20px padding).
  - Avatar: 48px circle (`--r-pill`), `object-fit: cover`, or initials fallback (gradient bg).
  - `app-star-rating` component with testimonial rating.
  - Quote: 15px italic, `--ink-2`, `-webkit-line-clamp: 3`.
  - Author name: 14px, 600 weight.
  - Optional title: 13px, `--ink-2`.
  - Null avatar or image load error → initials fallback (first char of first 2 words, uppercase).
  - Avatar `<img>` has `alt=""` (decorative). Initials have `aria-hidden="true"`.

### UX flows / components involved
F1 (step 10: testimonials browsing), F3 (loading), F4 (error), F5 (empty → hidden).

### Tests
1. **Loading:** 3 skeleton testimonial cards render.
2. **Error:** Error message + Retry button render.
3. **Empty:** Component element not present in DOM.
4. **Data:** Testimonial cards render for each testimonial.
5. Testimonial with `avatarUrl` → `<img>` renders.
6. Testimonial with `avatarUrl: null` → initials fallback renders.
7. `app-star-rating` renders with correct rating.
8. Quote text is present in DOM.
9. Author name renders.
10. Long quote is clamped to 3 lines (CSS).

---

## Story S16 — NewsletterSection

**Plan refs:** `plan/sections.md`

### Description
Create `src/app/sections/newsletter-section.component.ts` — email signup form with validation, submission, success, and error states. Uses `@angular/forms` `FormControl` with `Validators.email` and `Validators.required`.

### Acceptance Criteria
- Selector: `app-newsletter-section`.
- Full-width section with `--accent-soft` bg, 72px padding-block, centered column (max-width 520px, `text-align: center`).
- h2 "Stay in the loop" (28px). Subtitle "Get 10% off your first order." (`.muted`, 15px).
- **Idle state:** Inline form (flex row, gap 12px): email `<input>` (`.input`, max-width 300px, placeholder "Enter your email", `aria-label="Email address for newsletter"`) + "Subscribe" button (`.btn`).
- **Validation state:** On submit with invalid email → input border `--danger`, inline message "Please enter a valid email address." with `role="alert"`. Validate on submit, not keystroke.
- **Submitting state:** Button text "Subscribing…", input and button disabled (`opacity: 0.55`).
- **Success state:** Form replaced by checkmark SVG + "Thanks for subscribing! Check your inbox for 10% off."
- **Error state:** Inline error "Something went wrong. Please try again." below form. Form remains interactive.
- Uses `CatalogService.subscribeToNewsletter(email)` for API call.
- No empty state — form is always ready for input.

### UX flows / components involved
F1 (step 11: newsletter signup), F6 (full newsletter lifecycle).

### Tests
1. **Idle:** Input and Subscribe button render.
2. **Validation:** Submit empty email → "Please enter a valid email address." appears. Input has `--danger` styling.
3. **Validation:** Submit "not-an-email" → validation error appears.
4. **Submitting:** Submit valid email → button text changes to "Subscribing…", input and button disabled.
5. **Success:** Mock API returns `{ success: true }` → form replaced by thank-you message.
6. **Error:** Mock API returns error → inline error "Something went wrong. Please try again." appears. Form remains.
7. Input has `aria-label="Email address for newsletter"`.
8. Validation error uses `role="alert"`.

---

## Story S17 — HomeComponent Refactor

**Plan refs:** `plan/home-and-layout.md`

### Description
Refactor `src/app/pages/home.component.ts` to replace inline hero, categories, and featured blocks with the new section components. Wire all events: `add` → `CartService.add()`, `toggleWishlist` → `WishlistService.toggle()`, `quickView` → `router.navigate()`.

### Acceptance Criteria
- Template composed of section components in order: `HeroSection`, `SearchSection`, `CategoriesSection`, `FeaturedSection`, `BestSellersSection`, `FlashSaleSection`, `RecommendationsSection`, `BrandSection`, `TestimonialsSection`, `NewsletterSection`.
- Inline hero HTML/CSS removed from `HomeComponent`.
- Inline categories HTML/CSS removed from `HomeComponent`.
- Inline featured HTML/CSS removed from `HomeComponent`.
- `CartService` injection kept. `add` event from `FeaturedSection`, `BestSellersSection`, `FlashSaleSection` → `CartService.add(product)`.
- `WishlistService` injected. `toggleWishlist` event → `WishlistService.toggle(product.sku)`.
- `Router` injected. `quickView` event → `router.navigate(['/products', product.sku])`.
- All section components registered (imported) in component's `imports` array.
- No new section-specific inline styles in `HomeComponent` (styles live in each section component).

### UX flows / components involved
F1 (full homepage flow), F2 (returning visitor), F7 (wishlist), F8 (quick view), F9 (add to cart).

### Tests
1. All 10 section components render in correct DOM order.
2. `add` event from `FeaturedSection` → `CartService.add()` called with correct product.
3. `toggleWishlist` event → `WishlistService.toggle()` called with correct SKU.
4. `quickView` event → `router.navigate()` called with `['/products', sku]`.
5. No inline hero markup remains in `HomeComponent` template.
6. No inline categories markup remains.
7. No inline featured markup remains.

---

## Story S18 — Footer & AppComponent Enhancements

**Plan refs:** `plan/home-and-layout.md`

### Description
Add social media icon links to `FooterComponent` (Twitter/X, Instagram, GitHub) and add a skip-to-content link to `AppComponent`.

### Acceptance Criteria
#### FooterComponent — social links
- `.social-row` div added in the brand column between brand tagline `<p>` and payment strip `.strip`.
- Three `<a>` elements with inline SVG icons: Twitter/X, Instagram, GitHub.
- Icons: 20px × 20px, `fill: currentColor`. Default color `--ink-2`, hover color `--accent`.
- `aria-label` values: "Twitter / X", "Instagram", "GitHub".
- Links have `href="#"` (placeholder).
- Flex row with 12px gap.

#### AppComponent — skip-to-content link
- `<a href="#content" class="skip-link">Skip to main content</a>` is the first child of the template (before `<app-header>`).
- Link is positioned off-screen by default, visible on `:focus` with `position: absolute; top: 8px; left: 8px; z-index: 10000; background: var(--surface); color: var(--ink); padding: 8px 16px; border-radius: var(--r-md);`.
- `<main id="content">` wraps the `<router-outlet>`.
- On click/focus activation, focus moves to `<main id="content">`.

### UX flows / components involved
F1 (step 12: footer with social links). Accessibility: skip link for keyboard users.

### Tests
#### FooterComponent
1. Three social link `<a>` elements render in `.social-row`.
2. Each has correct `aria-label` ("Twitter / X", "Instagram", "GitHub").
3. Each contains an inline SVG with `width="20"` and `height="20"`.
4. `.social-row` is positioned between brand tagline and payment strip.

#### AppComponent
5. Skip link is the first focusable element in the DOM.
6. Skip link has `href="#content"` targeting `<main id="content">`.
7. Skip link is visually hidden by default, visible on focus (CSS test).
8. `<main id="content">` element exists wrapping the `<router-outlet>`.
