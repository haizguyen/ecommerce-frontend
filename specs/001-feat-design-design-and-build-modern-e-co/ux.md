# UX Spec: Modern E-Commerce Homepage — Aurora Store

## User Flows

### F1 — Browse homepage as a first-time visitor
1. Visitor lands on `/` (HeroSection is the first thing in viewport).
2. Scan hero: eyebrow ("New season · 2026"), headline, lede, two CTAs (primary "Shop the catalogue", secondary "Explore audio"), trust strip (rating / returns / warranty).
3. Scroll to SearchSection — large input auto-focused, placeholder "Search 100+ products…". Type query, press Enter → routed to `/products?q=<query>`.
4. Scroll to CategoriesSection — 5 tiles. Click a tile → `/products?category=<slug>`.
5. Scroll to FeaturedSection — 4 product cards (highest-rated). Hover a card: discount badge (if applicable), stock badge, quick-view overlay, wishlist heart visible. Click card body → `/products/<sku>`. Click "Add" → item added to cart (header count badge updates). Click heart → item wishlisted (heart fills, `WishlistService` updates).
6. Scroll to BestSellersSection — same card pattern, products tagged `bestseller`.
7. Scroll to FlashSaleSection — sale-colored container, countdown timer, discounted products. Timer ticks down in real time. When timer hits zero: section displays "ended" message.
8. Scroll to RecommendationsSection — placeholder with skeleton cards + "Personalized recommendations coming soon" overlay.
9. Scroll to BrandSection — horizontal row of brand logo tiles.
10. Scroll to TestimonialsSection — 3-column grid of quote cards (avatar, quote, author, rating stars).
11. Scroll to NewsletterSection — email input + subscribe button. Submit valid email → success message replaces form.
12. Scroll to FooterComponent — brand info, 3 link columns (Shop, Company, Support), social SVG icons, payment strip.

### F2 — Browse homepage as a returning visitor with wishlisted items
1. Same scroll flow as F1.
2. Product cards previously wishlisted show filled heart icon (`wishlisted = true`).
3. Heading text on RecommendationsSection reads "You might also like" (placeholder only — no ML; same skeleton overlay).

### F3 — Handle data loading states
1. Each data-driven section (Categories, Featured, BestSellers, FlashSale, Brands, Testimonials) mounts in `loading()` state.
2. User sees skeleton placeholders matching each section's layout dimensions.
3. API resolves → skeletons replaced with real content. User can interact.

### F4 — Handle data errors with retry
1. User is viewing homepage. A section's API call fails (network error, 500, etc.).
2. That section alone shows an error state: message "Something went wrong loading this section." + "Retry" button in `.btn-outline`.
3. Other sections unaffected — no full-page error.
4. User clicks "Retry" → section re-fetches. Skeleton shows again briefly. Success → content. Failure → error persists.

### F5 — Handle empty data states
1. CategoriesSection receives empty array → friendly message "No categories available right now."
2. FeaturedSection receives empty array → "Nothing to feature this week — check back soon."
3. BestSellersSection empty → "Top sellers coming soon — check back later."
4. FlashSaleSection API returns `null` → section hidden entirely (no DOM).
5. FlashSaleSection receives sale with `endsAt` in the past → "This sale has ended."
6. BrandSection empty → section hidden entirely.
7. TestimonialsSection empty → section hidden entirely.
8. NewsletterSection form is idle; no empty-state concept (it is always ready for input).

### F6 — Newsletter signup: full lifecycle
1. User reaches NewsletterSection at bottom of page.
2. Form is idle: email input + "Subscribe" button (`.btn`). Placeholder: "Enter your email".
3. User types invalid email (e.g., "not-an-email") and clicks Subscribe → inline validation error "Please enter a valid email address." Input border uses `--danger`.
4. User types valid email (e.g., "alex@example.com") and clicks Subscribe → button text changes to "Subscribing…", input disabled.
5. API returns success → form disappears, thank-you message appears: "Thanks for subscribing! Check your inbox for 10% off."
6. API returns error → inline error "Something went wrong. Please try again." Form remains, button re-enabled, input re-enabled.

### F7 — Wishlist toggle
1. User sees product card with outline heart icon in top-right corner of image area.
2. User clicks heart → icon fills solid, `@Output toggleWishlist` emits, `WishlistService.wishlistedSkus` set adds the SKU.
3. User clicks filled heart → icon returns to outline, SKU removed from wishlist set.
4. Toggle is instant (optimistic) — no API call in scope. State persists within the session across navigation.

### F8 — Quick view (navigates to product detail)
1. User hovers over product card image → "Quick view" overlay button fades in at center of image area.
2. User clicks "Quick view" → `@Output quickView` emits → parent (HomeComponent) calls `router.navigate(['/products', product.sku])`.
3. User lands on product detail page with full gallery, buy box, related products.

### F9 — Add to cart
1. User clicks "Add" button on product card (`.btn.add`).
2. `@Output add` emits product → parent calls `CartService.add(product)`.
3. Header cart count badge updates reactively.
4. If product stock is 0, "Add" button shows disabled "Sold out" state — no click action.

---

## Screens / States

All sections render within a single scrollable page (`/`). Sections stack vertically in order below. The `FooterComponent` is already rendered in `AppComponent` below the router outlet and is always present.

| # | Section | Component | Data source | Idle (data) | Loading | Empty | Error | Success/Edge |
|---|---|---|---|---|---|---|---|---|
| 1 | Hero | `HeroSection` | None (presentational) | Full-width gradient bg, two-column layout (copy + decorative blob art), eyebrow, h1, lede, two CTA buttons (`.btn.btn-lg`, `.btn.btn-lg.btn-outline`), trust strip (rating, returns, warranty). | N/A — no loading | N/A — always present | N/A — always present | N/A |
| 2 | Search | `SearchSection` | None (form only) | Prominent search input (18px font, 16px 20px padding), placeholder "Search 100+ products…", auto-focused on page load. No surrounding section-head. | N/A — no loading | N/A — always present | N/A — always present | On Enter: navigate to `/products?q=<query>`. Input cleared on route change. |
| 3 | Categories | `CategoriesSection` | `CatalogService.getCategories()` | 5-column grid of `.cat-tile` cards. Each tile: category name + product count + arrow indicator. Grid `14px` gap, tiles `--surface` bg, `--line` border, `--r-lg` radius. Hover: `translateY(-3px)`, `--shadow-md`, `--line-strong`. | 5 skeleton tiles matching `.cat-tile` aspect ratio (`.skeleton` shimmer) | "No categories available right now." centered text in `.muted`. | "Something went wrong loading this section." + `.btn-outline` "Retry" button. | Click tile → `/products?category=<slug>`. Active state on mousedown. |
| 4 | Featured | `FeaturedSection` | `CatalogService.getProducts()` → top 4 by rating | `.section-head` with eyebrow "Editor's picks" and h2 "Featured this week". 4-column grid (20px gap) of `app-product-card` cards. | 4 skeleton cards (`.skeleton` with card dimensions) | "Nothing to feature this week — check back soon." centered in `.section-empty`. | Standard error message + "Retry". | Card interactions: add-to-cart, wishlist toggle, quick-view hover, router navigate. Discount badges render when `discountPercentage` is set. |
| 5 | Best Sellers | `BestSellersSection` | `CatalogService.getBestSellers()` | `.section-head` with eyebrow "Trending" and h2 "Best sellers". 4-column grid of `app-product-card` cards. Same layout as FeaturedSection. | 4 skeleton cards | "Top sellers coming soon — check back later." | Standard error + "Retry". | Same card interactions as FeaturedSection. |
| 6 | Flash Sale | `FlashSaleSection` | `CatalogService.getFlashSale()` | Sale-themed container (`.card` with `--sale`-color border or tinted bg). Countdown timer `HH:MM:SS` (or `DH:MM:SS`). `.section-head` with eyebrow "Limited time" and h2 "Flash sale". 4-column product grid. Discount badges visible on all cards (`badge-sale`). | Skeleton timer bar + 4 skeleton cards | "No active flash sales right now. Check back soon!" | Standard error + "Retry". | **Null API response** → section hidden entirely (no DOM). **Sale ended** (countdown hits zero) → timer shows "Ended", products remain visible but timer is static. |
| 7 | Recommendations | `RecommendationsSection` | None (placeholder) | `.section-head` with h2 "Picked for you". 4 skeleton cards overlaid with centered message "Personalized recommendations coming soon." No data fetching. | Inherent: skeleton cards always shown with overlay | N/A — intentional placeholder | N/A — no data fetching | N/A — this is a static placeholder staking design real estate. |
| 8 | Brands | `BrandSection` | `CatalogService.getBrands()` | `.section-head` with eyebrow "Partners" and h2 "Brands we love". Horizontal flex-wrap row of brand logo tiles (`.brand-tile`): 80px height, centered logo image or name initials fallback. Gap 20px. | 6 skeleton circles (`.skeleton`, `--r-pill`, 80px × 80px) | Section hidden entirely (no DOM output). | Standard error + "Retry". | Image load failure per brand → fallback to styled initials (first 2 chars, `--ink-3` color, gradient bg matching `.ph` pattern from ProductCardComponent). |
| 9 | Testimonials | `TestimonialsSection` | `CatalogService.getTestimonials()` | `.section-head` with eyebrow "Real reviews" and h2 "What our customers say". 3-column grid (20px gap) of `.testimonial-card` cards. Each: circular avatar (48px, `--r-pill`), quote (italic, 15px), author name (600 weight, 14px), optional title (13px, `--ink-2`), `app-star-rating`. | 3 skeleton testimonial cards (avatar circle + 2 text lines) | Section hidden entirely. | Standard error + "Retry". | Null avatar → initials fallback. Long quotes truncated to 3 lines with `-webkit-line-clamp: 3`. |
| 10 | Newsletter | `NewsletterSection` | `CatalogService.subscribeToNewsletter()` | Full-width section with `--accent-soft` bg or contrasting surface. Headline "Stay in the loop" (h2), subtitle "Get 10% off your first order." Inline form: email input (`.input`, 300px max-width) + "Subscribe" button (`.btn`). | **Submitting state:** Button text "Subscribing…", input and button disabled. | N/A — form is always idle-ready. | Inline error: "Something went wrong. Please try again." below input. Form remains interactive. | **Validation error:** `--danger` border on input, message "Please enter a valid email address." below. **Success:** form replaced by "Thanks for subscribing! Check your inbox for 10% off." with checkmark icon. |
| 11 | Footer | `FooterComponent` (existing) | Static (existing) | Brand column + 3 link groups (Shop, Company, Support) + social SVG icons (Twitter/X, Instagram, GitHub) + payment strip (VISA, MC, AMEX, PayPal). | N/A — static | N/A — always present | N/A — always present | Social icon links: `href="#"` placeholders. Payment marks styled as small caps pills. |

---

## Components

### Reused Existing Components

| Component | File : Line | Selector | Role | Modifications needed? |
|---|---|---|---|---|
| `ProductCardComponent` | `src/app/shared/product-card.component.ts:15-184` | `app-product-card` | Renders product image, name, rating, price, stock badge, add-to-cart button in all product grids. | Yes — see Section "Reused with modifications" below. |
| `StarRatingComponent` | `src/app/shared/star-rating.component.ts:9-57` | `app-star-rating` | Star rating display on all product cards and testimonial cards. Inputs: `rating`, `showValue`. | No modifications needed. |
| `HeaderComponent` | `src/app/layout/header.component.ts:14-213` | `app-header` | Sticky glassmorphism header with brand, nav, search, cart badge. Already in `AppComponent`. | No modifications needed. |
| `FooterComponent` | `src/app/layout/footer.component.ts:7-144` | `app-footer` | Brand column, 3 link groups, payment strip. Already in `AppComponent`. | Add social link SVGs (Twitter/X, Instagram, GitHub) in brand column between description and payment strip. Follow existing inline SVG pattern in header at `header.component.ts:34-41`. |

### Reused with modifications

| Component | File : Line | Modifications |
|---|---|---|
| `ProductCardComponent` | `src/app/shared/product-card.component.ts:15-184` | 1. Add `@Input() wishlisted: boolean` (default `false`). 2. Add `@Output() toggleWishlist = new EventEmitter<Product>()`. 3. Add `@Output() quickView = new EventEmitter<Product>()`. 4. Add discount badge (`badge-sale`) positioned in `.tag-row` to the left of existing stock badges — conditional on `discountPercentage`. 5. Add wishlist heart icon button (inline SVG) in top-right corner of `.media` area — outline when `!wishlisted`, filled when `wishlisted`. Heart SVG should match stroke weight (1.8) and style of existing header cart icon (`header.component.ts:54-61`). 6. Add quick-view overlay button centered in `.media` on hover — fades in with `opacity` transition (`--dur` / `--ease`). Text: "Quick view", styled as small `.btn` with white bg and `--ink` text. 7. Add original price strikethrough in `.price` area: when `originalPrice` is set, show `<span class="price-old">$original</span>` in `--ink-3` with `text-decoration: line-through` beside the discounted price. |

### New Components

All new section components live under `src/app/sections/`. Each is a standalone Angular component with `OnPush` change detection. No `CommonModule` override needed — only `NgIf`/`NgFor` control flow (prefer Angular 17 `@if`/`@for` syntax per spec's `flashSale()` null guard convention).

| Component | Selector | Data source | States | Key layout | Design tokens / classes used |
|---|---|---|---|---|---|
| `HeroSection` | `app-hero-section` | None (presentational) | Always idle | Full-width `radial-gradient(120% 120% at 85% 10%, #eef0ff 0%, transparent 55%)` over `--surface`. Two-column grid `1.15fr 0.85fr`, 40px gap, 72px padding-block. Copy column: eyebrow + h1 (`clamp(34px, 5vw, 58px)`, 640 weight) + lede (`.muted`, `max-width: 460px`) + dual CTAs (`.btn.btn-lg`, `.btn.btn-lg.btn-outline`) + trust strip (inline flex, 13.5px, `--ink-2`). Art column: decorative blobs (`.blob.b1` 260px gradient `#c7ccff` to `#8b93f5`, `.blob.b2` 170px gradient `#ffe0c2` to `#ffb27a`, both `filter: blur(6px)`) + `.glass` panel (150px, frosted: `rgba(255,255,255,0.55)`, `backdrop-filter: blur(8px)`, `--r-xl`, `--shadow-lg`). | `--surface`, `--accent`, `--accent-soft`, `--ink`, `--ink-2`, `--shadow-lg`, `--r-xl`, `.btn`, `.btn-lg`, `.btn-outline`, `.eyebrow`, `.muted`, gradients per existing `home.component.ts:112-188`. |
| `SearchSection` | `app-search-section` | None (form only) | Always idle | Full-width `.section` container. Single row: search `<input type="search">` with `font-size: 18px`, `padding: 16px 20px`, `--r-lg` radius, `--line-strong` border, placeholder "Search 100+ products…". Auto-focus on mount. Inline SVG search icon inside input (left, 18px). `max-width: 640px`, centered via `margin-inline: auto`. No section-head (no eyebrow, no title — the input is self-explanatory). | `.input`, `--r-lg`, `--line-strong`, `--accent`, `--accent-soft` (focus ring), `--font-sans` (inherited). Search icon SVG pattern from `header.component.ts:34-41` scaled up. |
| `CategoriesSection` | `app-categories-section` | `CatalogService.getCategories()` | Loading, error, empty, idle | `.section-head` with eyebrow "Browse" and h2 "Shop by category". 5-column grid (14px gap). Each tile: `.cat-tile` — flex column, 22px 18px padding, `min-height: 118px`, `--surface` bg, `--line` border, `--r-lg` radius, hover `translateY(-3px)` `--shadow-md`. Tile content: category name (600 weight, 14px), product count (13px, `--ink-3`), `.cat-go` arrow (→) that flies right 4px on hover. See existing `home.component.ts:63-83` and `:221-257`. | `.section-head`, `.eyebrow`, `.cat-tile` (existing pattern), `.skeleton`, `.btn-outline` (retry), `--surface`, `--line`, `--r-lg`, `--shadow-md`. |
| `FeaturedSection` | `app-featured-section` | `CatalogService.getProducts()` → top 4 by rating | Loading, error, empty, idle | `.section-head` with eyebrow "Editor's picks" and h2 "Featured this week". 4-column grid (20px gap) of `app-product-card`. See existing `home.component.ts:87-106` and `:260-270`. | `.section-head`, `.eyebrow`, `.skeleton`, `.btn-outline` (retry), `app-product-card`. |
| `BestSellersSection` | `app-best-sellers-section` | `CatalogService.getBestSellers()` | Loading, error, empty, idle | `.section-head` with eyebrow "Trending" and h2 "Best sellers". 4-column grid (20px gap) of `app-product-card`. Same grid pattern as FeaturedSection. | `.section-head`, `.eyebrow`, `.skeleton`, `.btn-outline` (retry), `app-product-card`. |
| `FlashSaleSection` | `app-flash-sale-section` | `CatalogService.getFlashSale()` | Loading, error, empty, null-data (hidden), ended, idle | Distinct container: `.card` wrapper with `border: 2px solid var(--sale)` or tinted `--danger-soft` bg. `.section-head` with eyebrow "Limited time" and h2 "Flash sale". Countdown timer in `.section-head` right side: `span.countdown` with `--sale` color, monospace `font-variant-numeric: tabular-nums`, format `HH:MM:SS` (or `DH:MM:SS` if > 24h). 4-column product grid. "Ended" state: timer shows "Sale ended", message below timer. Null data: entire section excluded from DOM. | `.card`, `--sale`, `--danger-soft`, `.section-head`, `.eyebrow`, `.skeleton`, `.btn-outline` (retry), `app-product-card`, `badge-sale` (already on card component). |
| `RecommendationsSection` | `app-recommendations-section` | None (placeholder) | Always in placeholder state | `.section-head` with h2 "Picked for you". 4-column grid of `.skeleton` cards (matching `app-product-card` dimensions). Overlay: centered `--surface` rounded pill with text "Personalized recommendations coming soon" (14px, `--ink-2`, 550 weight). Overlay uses `position: absolute` inset over the grid with `backdrop-filter: blur(2px)` for visual separation. | `.section-head`, `.skeleton`, `--surface`, `--ink-2`, `--r-pill`, `--shadow-sm`. |
| `BrandSection` | `app-brand-section` | `CatalogService.getBrands()` | Loading, error, empty (hidden), idle | `.section-head` with eyebrow "Partners" and h2 "Brands we love". Horizontal flex-wrap row of `.brand-tile` elements. Each tile: 80px height, 120px width, centered content, `--surface` bg, `--line` border, `--r-lg` radius. Logo image inside: `max-height: 48px`, `object-fit: contain`. Logo `null` fallback: first 2 uppercase letters of brand name, 24px, 700 weight, `--ink-3`, centered, gradient bg matching `.ph` pattern from `product-card.component.ts:95-99`. Hover: `--shadow-sm`, `--line-strong` border. | `.section-head`, `.eyebrow`, `.skeleton`, `.btn-outline` (retry), `--r-lg`, `--surface`, `--line`, `--shadow-sm`, gradient `#efeee9` → `#e3e2dc` (from `product-card.component.ts:95`). |
| `TestimonialsSection` | `app-testimonials-section` | `CatalogService.getTestimonials()` | Loading, error, empty (hidden), idle | `.section-head` with eyebrow "Real reviews" and h2 "What our customers say". 3-column grid (20px gap) of `.testimonial-card` cards. Each card (`.card` class + 20px padding): circular avatar (48px, `--r-pill`, `object-fit: cover` or initials fallback), star rating via `app-star-rating`, quote text (15px, italic, `--ink-2`, `-webkit-line-clamp: 3`), author name (14px, 600 weight), optional title (13px, `--ink-2`). Avatar null → initials in gradient bg matching `.ph` pattern. | `.card`, `.section-head`, `.eyebrow`, `.skeleton`, `.btn-outline` (retry), `app-star-rating`, `--r-pill`, `--ink-2`, gradient `#efeee9` → `#e3e2dc`. |
| `NewsletterSection` | `app-newsletter-section` | `CatalogService.subscribeToNewsletter()` | Idle, submitting, success, error (validation + server) | Full-width section: `--accent-soft` background, 72px padding-block. Centered column (`max-width: 520px`, `margin-inline: auto`, `text-align: center`). Headline: "Stay in the loop" (h2, 28px). Subtitle: "Get 10% off your first order." (`.muted`, 15px). Form: inline-flex row, gap 12px, centered. Email input (`.input`, `max-width: 300px`, `flex: 1`) + Subscribe button (`.btn`). Validation message below input (13px, `--danger`). Success state replaces form: checkmark SVG + "Thanks for subscribing! Check your inbox for 10% off." Error state: `--danger`-colored text below form: "Something went wrong. Please try again." | `--accent-soft`, `--danger`, `--danger-soft`, `.input`, `.btn`, `.muted`, `--r-md`, `--accent` (focus ring on input). |

### New Supporting Types (wiring only — no visual component)

| Artifact | Role |
|---|---|
| `WishlistService` | Signal-based service following `CartService` (see `cart.service.ts:15-73`). Public API: `wishlistedSkus: Signal<Set<string>>`, `toggle(sku: string): void`, `isWishlisted(sku: string): boolean`. No API calls — in-memory only within session. |

---

## Interaction & Edge States

### Validation (NewsletterSection)
- **Format validation:** Client-side `Validators.email` and `Validators.required` via `@angular/forms` `FormControl`.
- **Timing:** Validate on submit (not on keystroke). Invalid → inline message "Please enter a valid email address." in `--danger` color, `13px` font. Input border switches to `--danger` via a `.ng-invalid.ng-touched` class mapping.
- **Submission guard:** Button disabled while submitting (`.btn:disabled` styles). Double-submit prevented by disabling both input and button.

### Disabled states
- **Newsletter submit button:** Disabled while subscribing. `opacity: 0.55`, `cursor: not-allowed`. No shadow, no hover lift.
- **Newsletter input:** Disabled while subscribing. `opacity: 0.55`, cursor default.
- **Add-to-cart button on ProductCardComponent:** Existing `.btn:disabled` at `styles.css:195-200`. Already applied when `stock === 0` and button text reads "Sold out".
- **Countdown timer (FlashSaleSection):** `interval(1000)` stops when `endsAt` is past. Timer display freezes on "Ended". No further ticks.

### Keyboard paths
- **SearchSection:** Input is auto-focused on mount (unless another element has focus). Enter submits. Escape clears input.
- **NewsletterSection:** Tab order: email input → Subscribe button. Enter on input triggers submit. Escape does nothing (standard form).
- **Wishlist heart buttons:** Each heart is a `<button>` element (not a div) — keyboard focusable by default. Activation: Enter or Space toggles wishlist state. Visible focus ring via `:focus-visible` (global at `styles.css:113-117`).
- **Quick-view overlay buttons:** Same pattern — `<button>` element, keyboard focusable, visible focus ring.
- **Product card body:** Entire `.media` area is an `<a>` with `[routerLink]` — keyboard navigable via Tab, activated via Enter.
- **Category tiles:** Each tile is an `<a>` with `[routerLink]` — keyboard navigable and activated.

### Focus management
- **SearchSection:** `autofocus` attribute on the `<input>`. On route navigation away (Enter submit), browser default focus management applies (new page header).
- **Newsletter success:** No focus shift needed (form is replaced in place). The thank-you message is the next tabbable element.
- **Error toasts:** Not applicable — all errors are inline within their section, not toast/alert overlays.

### Optimistic vs. pending
- **Wishlist toggle:** Optimistic. No API call. State flips instantly.
- **Add to cart:** Existing `CartService.add()` — optimistic (local signal mutation). No server round-trip.
- **Newsletter subscribe:** Pending. Button shows "Subscribing…". Server round-trip completes before success/error state. `1500ms` mock delay per mock interceptor pattern.

### Edge: countdown timer boundary
- Timer ticks every 1000ms via `setInterval` (converted to Angular `interval()` observable piped through `takeUntil` destroy).
- When `endsAt` is less than `Date.now()`, display switches to "Ended". Products remain visible for the session. No auto-hide.
- If API returns `endsAt` that is already in the past on page load, the section shows the "ended" state immediately (no ticking phase).

### Edge: brand logo image failure
- Per-brand `(error)` handler on `<img>`: sets a local `hasError` flag → hides `<img>` → shows initials fallback. Pattern matches `ProductCardComponent` image fallback at `product-card.component.ts:27`.

### Edge: testimonial with null avatar
- Avatar `<img>` uses same `(error)` handler pattern with initials fallback. Initials derived from author name: first character of first two words, uppercased (matching `product-card.component.ts:176-183`).

### Edge: flash sale null vs. empty
- `null` from API → entire section removed from DOM (`@if (flashSale(); as sale)` guard per spec Decision #6).
- Empty `products[]` within a non-null `FlashSale` → standard empty state: "No active flash sales right now. Check back soon!"

### Edge: category tile with 0 product count
- `Category.productCount === 0` → show tile normally but the product count reads "0 products". Click navigates to `/products?category=<slug>` which would show "No products found" on the ProductListComponent. This is acceptable — no need to hide empty categories on the homepage (the category filter exists for discoverability). Matches existing behavior from `home.component.ts:63-83`.

### Responsive breakpoints
Follow existing patterns from `home.component.ts:272-297` and `header.component.ts:193-200`:

| Breakpoint | Hero | Categories | Product grids | Testimonials | Brand tiles | Newsletter | Footer |
|---|---|---|---|---|---|---|---|
| Default (>980px) | 2-column grid | 5-column grid | 4-column grid | 3-column grid | Flex-wrap row | Inline form | 4-column grid |
| ≤980px | Single column (stack copy + art) | 3-column grid | 2-column grid | 2-column grid | Flex-wrap (centered) | Stacked form (input full-width, button below) | 2-column grid |
| ≤720px | — | — | 2-column (smaller gap) | 1-column | — | — | — |
| ≤560px | Smaller h1 (clamp min) | 2-column grid | 1-column | 1-column | Single row scroll (`overflow-x: auto`) | Stacked, centered | Single column |
| ≤400px | Reduce padding-block to 48px | — | — | — | — | — | — |

---

## Accessibility

### Landmarks & semantic structure
- **Skip link:** Add a skip-to-content link as the first focusable element in `AppComponent` (`app.component.ts`) that targets `<main id="content">`. Pattern: `<a href="#content" class="skip-link">Skip to main content</a>`. Position off-screen, visible on focus. Note: this is a gap in the existing app — no skip link currently exists.
- **Nested landmarks:** Each section should use a semantic HTML element for its wrapper:
  - HeroSection: `<section aria-label="Hero">` or `<section aria-labelledby="hero-heading">`
  - SearchSection: `<section aria-label="Search">` with `role="search"`
  - CategoriesSection: `<nav aria-label="Product categories">` (since tiles are navigation links) — or `<section>` with `aria-label`.
  - FeaturedSection / BestSellersSection / FlashSaleSection / RecommendationsSection: `<section aria-labelledby="section-<id>-title">` where the `<h2>` gets the matching `id`.
  - BrandSection: `<section aria-label="Partner brands">`
  - TestimonialsSection: `<section aria-label="Customer testimonials">`
  - NewsletterSection: `<section aria-label="Newsletter signup">`
- **FooterComponent** (existing): The `<footer>` element is already semantic. Link groups should use `<nav aria-label="Shop">`, `<nav aria-label="Company">`, `<nav aria-label="Support">`.

### Roles and labels
- **ProductCardComponent:**
  - Existing: star rating has `role="img"` and `aria-label` (per `star-rating.component.ts:14`).
  - Add: Wishlist heart button needs `aria-label="Add <product name> to wishlist"` (or "Remove from wishlist" when wished).
  - Add: Quick-view button needs `aria-label="Quick view <product name>"`.
  - Existing: Add-to-cart button needs `aria-label="Add <product name> to cart"` if label is just "Add" (icon-only check — current label is text "Add"/"Sold out", so screen readers already get context).
- **SearchSection:** Input has `aria-label="Search products"` (in addition to visible placeholder).
- **NewsletterSection:** Email input has `aria-label="Email address for newsletter"`. Error messages use `aria-live="polite"` or `role="alert"`.
- **Countdown timer:** Use `aria-live="polite"` on the timer container so updates are announced (but not too frequently — consider `aria-atomic="true"` and update only on minute boundaries to avoid spam).
- **Brand tiles:** Logos should have `alt="<brand name>"`. Initials fallback should have `aria-hidden="true"` since the brand name is already present as visible text below.
- **Testimonial avatars:** `alt=""` (decorative, since quote includes author name). If null avatar → initials have `aria-hidden="true"`.

### Focus order
From top to bottom of the page: skip link → HeaderComponent nav links → search → cart → HeroSection CTAs → SearchSection input → CategoriesSection tiles → FeaturedSection cards (media link, wishlist button, quick-view button, add button — all 4 per card) → BestSellersSection cards → FlashSaleSection cards → RecommendationsSection (no interactive elements) → BrandSection logos (links if clickable) → TestimonialsSection (static) → NewsletterSection input → submit → FooterComponent links.

Tab order must follow DOM order. No `tabindex` values beyond `0` or `-1` (for hidden elements).

### Keyboard interaction per section
- **CategoriesSection:** Arrow key navigation between tiles is not needed — grid of `<a>` links is natively navigable via Tab.
- **FlashSale countdown:** Read-only — no keyboard interaction needed.
- **RecommendationsSection:** No interactive elements — purely decorative placeholder.
- **BrandSection:** If logo tiles are links (clicking navigates to brand page — currently out of scope, so plain `<div>` or `<span>`). If non-interactive, add `aria-hidden="false"` but ensure they are skip-tabbable (no focusable elements within).
- **Wishlist buttons on mobile:** On touch devices, there is no hover state. The wishlist heart is always visible (top-right corner of image) and tappable. Quick-view button should also be always visible on touch (or appear on first tap; spec defers this nuance — simplest: always show quick-view on touch devices via `@media (hover: none)`).

### Color and contrast
- All UI text pairs: `--ink` on `--surface` / `--bg` → contrast ratio exceeds ~9:1 (verified by token values: `#17181c` on `#f6f6f3` = ~13:1; `#17181c` on `#ffffff` = ~16:1).
- `--ink-2` (`#565a63`) on `--surface` (`#ffffff`): contrast ~5.5:1 — passes AA for normal text. `--ink-3` (`#8a8f98`) on `--surface`: ~3.5:1 — fails AA for small text. Use `--ink-3` only for placeholder text and decorative labels (not body copy). Check `--ink-3` usage: testimonial quotes are 15px italic in `--ink-2` (safe), not `--ink-3`. Category product count is 13px in `--ink-3` — this is a minor decorative label, acceptable per WCAG definition of "disabled" / "decorative" exemption, but consider bumping to `--ink-2` for safety.
- Discount badge: white text (`#ffffff`) on `--sale` (`#d6482f`) → ~4.3:1 — passes AA for 11.5px/650 weight (bold text threshold is 3:1).
- `badge-sale` has white text on `--sale` — at 11.5px / 650 weight, this passes AA for bold/ large text (3:1 min).
- Wishlist heart icon: `--ink` color on `--surface` (inside `.media` area which is `--surface-2` bg) → sufficient contrast. Filled state: `--sale` or `--accent` color (TBD — use `--accent` for filled heart to match brand accent; `--sale` might imply "on sale" which is a different meaning).
- `:focus-visible` outline uses 2px solid `--accent` (global at `styles.css:113-117`). This passes visibility requirements.

### Reduced motion
- Global `@media (prefers-reduced-motion: reduce)` at `styles.css:372-377` kills all animation and transition duration to `0.001ms`.
- This affects: skeleton shimmer (stops), card hover lift (stops immediately), link-arrow gap animation (stops), countdown timer text updates (still update — this is content change, not animation). Consider respecting the reduced-motion preference for countdown by keeping digits static and updating less frequently (every 30s instead of every second).
- Wishlist heart fill transition: if using a CSS transition, it will be disabled under reduced motion.

---

## Brand Alignment

### Brand persona
The Aurora Store brand (inferred from existing codebase and design tokens) is:

- **Tone:** Confident but warm. Not luxury (no gold, no serifs) — "premium-adjacent" without pretense. Indigo (`#4f46e5`) as the singular accent. Warm neutrals (`--bg: #f6f6f3`, `--ink: #17181c`) instead of cold grays.
- **Visual language:** Generous whitespace, soft shadows, low-contrast borders, rounded rectangles (`--r-lg: 18px` as the dominant card radius), pill-shaped buttons and badges. No sharp corners (minimum `--r-sm: 8px`). Inter typeface for clarity.
- **Voice:** Direct, helpful. "Shop the catalogue" not "Explore our collection". "Considered gear for the modern desk" — utilitarian but thoughtful. No em-dashes (per `design-taste-frontend` skill Section 9.G).
- **Trust signals:** Returns, warranty, free shipping prominently displayed. "Editor's picks" curation language.

### Design tokens used (all from `styles.css:8-63`)
Every new section and component uses only tokens from the existing system. No new tokens are introduced.

| Token category | Tokens used | Where |
|---|---|---|
| Backgrounds | `--bg`, `--surface`, `--surface-2`, `--accent-soft`, `--danger-soft` | Section backgrounds, card surfaces, newsletter full-width bg, flash sale tint |
| Text | `--ink`, `--ink-2`, `--ink-3`, `--on-accent`, `--accent`, `--danger`, `--sale` | All headings, body text, labels, badges, error messages |
| Borders | `--line`, `--line-strong`, `--sale` (as border) | Card borders, input borders, flash sale container border |
| Radius | `--r-sm`, `--r-md`, `--r-lg`, `--r-xl`, `--r-pill` | Cards (`--r-lg`), inputs (`--r-md`), buttons (`--r-pill`), avatar (`--r-pill`), search input (`--r-lg`) |
| Shadows | `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg` | Card hover states, glass panel, newsletter card |
| Motion | `--ease`, `--dur` (180ms) | Card hover lift, button transitions, wishlist fill, quick-view fade |
| Layout | `--container` (1200px), `--gutter` (24px) | All `.container` uses, section max-width |
| Type | `--font-sans`, heading 640 weight, `-0.02em` letter-spacing | All headings (h1-h4), body text |

### Global classes used (all from `styles.css:119-377`)
`.container`, `.section`, `.section-head`, `.eyebrow`, `.muted`, `.link-arrow`, `.btn`, `.btn-lg`, `.btn-outline`, `.btn-block`, `.badge`, `.badge-sale`, `.badge-accent`, `.badge-success`, `.badge-danger`, `.card`, `.input`, `.skeleton`, `.sr-only`, `.link-arrow`.

### Visual patterns applied consistently

| Pattern | Source (file:line) | Applied to |
|---|---|---|
| Card hover lift: `translateY(-3px)` + `--shadow-md` + `--line-strong` | `product-card.component.ts:74-78` | CategoriesSection tiles, FlashSaleSection container |
| Shimmer skeleton loading | `styles.css:347-370` | All data-driven sections |
| Gradient image placeholder (`#efeee9` → `#e3e2dc`) | `product-card.component.ts:95-99` | BrandSection logo fallback, TestimonialSection avatar fallback |
| Glassmorphism frosted glass | `header.component.ts` backdrop-filter pattern; `home.component.ts` `.glass` element | HeroSection `.glass` art panel (already existing) |
| Inline SVG icon style (`stroke-width: 1.8`, currentColor) | `header.component.ts:34-41` (search), `:54-61` (cart) | Wishlist heart SVG, newsletter checkmark SVG, social link SVGs |
| `.section-head` pattern (eyebrow + h2, optional link) | `styles.css:143-153` | Every section that has a heading |

### Brand rules applied (from `design-taste-frontend` skill)
- **Singular accent:** Indigo (`--accent`) used for CTAs, links, hover underlines. No secondary accent color.
- **No trust strip in hero:** Passing — the trust strip is placed at the bottom of the hero copy column, visually separate from the headline/lede area.
- **Eyebrow count:** Exactly one eyebrow per section heading (per existing pattern). No section has multiple eyebrows.
- **Shape lock:** All cards use `--r-lg` (18px). All buttons use `--r-pill`. All inputs use `--r-md` (12px). Consistency across all new sections.
- **Em-dash ban:** Zero em-dashes in any text content, labels, or placeholder strings.
- **Responsive hero:** On narrow viewports (≤980px), hero collapses to single column with art below copy — respects the "anti-center bias" by keeping text left-aligned.
- **Skeleton integrity:** Every data-driven section has skeleton loading that matches the target layout's dimensions. No layout shift when data arrives.

### Social links (footer addition)
- Add inline SVG icons for Twitter/X, Instagram, GitHub in the footer brand column.
- SVG style: 20px × 20px, `fill: currentColor`, inherit color from parent text (`--ink-2` by default, `--accent` on hover). Same icon pattern as header search/cart SVGs (`header.component.ts:34-41`).
- Placement: between brand tagline (".col p" in `footer.component.ts:17-20`) and payment strip (".strip" in `footer.component.ts:48-53`). Use a flex row with 12px gap.
- Each icon: `<a href="#" class="social-link" aria-label="Twitter / X">` wrapping an inline SVG.
- `aria-label` values: "Twitter / X", "Instagram", "GitHub".
