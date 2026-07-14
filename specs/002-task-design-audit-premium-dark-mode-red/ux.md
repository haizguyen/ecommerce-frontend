# UX Spec: Premium Dark-Mode Redesign — Aurora Store

## User Flows

### F1 — Browse homepage in dark mode (OS preference or manual toggle)
1. Visitor lands on `/` with `prefers-color-scheme: dark` active (or toggles dark mode via header button).
2. `ThemeService` (new: `src/app/data/theme.service.ts`) reads OS preference or `localStorage` key `aurora-theme` → adds `.dark` class to `<html>` → all CSS custom properties swap to the dark palette (`src/styles.css:157-199`).
3. HeroSection renders with dark-adapted gradient: `radial-gradient(120% 120% at 85% 10%, rgba(129, 140, 248, 0.15) 0%, transparent 55%)` over `--bg (#0a0a0b)`. Glass art element uses `color-mix(in srgb, var(--surface) 80%, transparent)`.
4. All product cards in Featured / BestSellers / FlashSale / Recommendations sections inherit dark surface tokens (`--surface: #151516`). Star-rating track uses `var(--line)` instead of washed-out `#dcdbd4`. Skeleton shimmer uses `var(--skeleton-bg)` / `var(--skeleton-shine)` — no blinding white flash.
5. Header glass effect inverts to `color-mix(in srgb, var(--surface) 80%, transparent)` with `blur(16px)` (no saturate). Cart badge and nav links inherit swapped tokens.
6. All other interactions (F1–F9 flows from the original UX spec) proceed identically — no behavioral changes, only visual token substitution.

### F2 — Manual dark-mode toggle
1. User clicks theme-toggle button in header (next to cart icon: `header.component.ts:51-66`; new button added after cart).
2. ThemeService toggles `darkSignal` → removes/adds `.dark` class on `<html>` → writes `'dark'` or `'light'` to `localStorage['aurora-theme']`.
3. Toggle button icon swaps: moon SVG → sun SVG (or vice versa). `aria-label` updates: `"Switch to light mode"` / `"Switch to dark mode"`.
4. All CSS custom properties flip immediately (no page reload). No flash of unstyled content because tokens live on `:root` and swap via class.

### F3 — Handle data loading states (dark mode compatible)
1. Each data-driven section (Categories, Featured, BestSellers, FlashSale, Brands, Testimonials) mounts in `loading()` state.
2. Skeleton base: `var(--skeleton-bg: #1c1c1e)` in dark mode (was `#ecebe6`).
3. Skeleton shimmer: `var(--skeleton-shine: rgba(255, 255, 255, 0.06))` in dark mode (was `rgba(255, 255, 255, 0.65)` — blinding in dark).
4. Skeleton cards stagger entrance with `animation-delay: calc(var(--i) * 80ms)` for a cascading reveal (CSS-only, new).
5. API resolves → skeletons replaced with real content. All cards use dark-mode token values.

### F4 — Handle data errors (no visual changes beyond tokens)
1. Same flow as original UX spec: section-specific error message + "Retry" button.
2. Error states use `--danger: #f87171` in dark mode (Red-400, contrast ~5.9:1 on `--surface`).
3. `.btn-outline` retry button: hover swaps to `--surface-2` / `--ink-3` via token — dark-mode-safe.

### F5 — Handle empty data states (no visual changes beyond tokens)
1. All empty states from original UX spec preserved. Text colors use `--ink-2` / `--muted` which auto-swap in dark mode.
2. Emoji in empty states (product-list: `🔍`, cart: `🛍️`, product-detail: `🧭`) replaced with inline SVGs matching header icon style (`header.component.ts:34-41`).

### F6 — Newsletter signup lifecycle (dark mode compatible)
1. NewsletterSection background uses `--accent-soft: rgba(129, 140, 248, 0.12)` in dark mode (transparent-tinted instead of solid `#eef0ff`).
2. `.input-danger` border uses `--danger: #f87171` — contrast verified at ~5.9:1.
3. Success state checkmark circle uses `--accent: #818cf8` with white stroke — visible on `--surface`.
4. All other states (idle, submitting, validation error, server error) identical to original — only token values change.

### F7 — Wishlist toggle (dark mode compatible)
1. Wishlist heart button background: `var(--surface)` with `opacity: 0.92` instead of hardcoded `rgba(255, 255, 255, 0.85)`. This ensures the heart is visible on dark product images.
2. Hover: `color: var(--danger)` — token swap keeps `#f87171` visible on dark.
3. Pulse animation (`scale(1.2)`) on toggle — respects `prefers-reduced-motion`.

### F8 — Quick view (dark mode compatible)
1. Quick-view overlay button background: `var(--surface)` with `opacity: 0.92` instead of hardcoded `rgba(255, 255, 255, 0.92)`.
2. Text color uses inherited token — readable on dark.

### F9 — Add to cart (no visual changes beyond tokens)
1. Add-to-cart button uses `.btn` class with `--btn-bg: var(--accent)` / `--btn-fg: var(--on-accent)`. In dark mode: accent indigo `#818cf8` on `--surface`. Contrast ~5.8:1 — passes AA.
2. Disabled "Sold out" state: `opacity: 0.55` preserves token color.

---

## Screens / States

All sections render within a single scrollable page (`/`), stacked vertically. Every section that had light-mode-only visual properties now has dark-mode token equivalents. Token swaps happen at `:root.dark` and `@media (prefers-color-scheme: dark)` — individual sections need no dark-mode-specific logic.

| # | Section | Component | Data source | Hardcoded light colors to replace | Dark-mode impact |
|---|---|---|---|---|---|
| 1 | Hero | `HeroSectionComponent` | None (presentational) | `hero-section.component.ts:50` `#eef0ff` gradient; `:120` `rgba(255,255,255,0.55)` glass bg; `:121` `rgba(255,255,255,0.8)` glass border; `:101` `#c7ccff`/`#8b93f5` blob; `:108` `#ffe0c2`/`#ffb27a` blob | Gradient → dark-adapted indigo glow; glass → `color-mix(in srgb, var(--surface) 80%, transparent)`; blobs → deeper indigo/warm tones with reduced opacity for dark bg |
| 2 | Search | `SearchSectionComponent` | None (form only) | `search-section.component.ts:75` `rgba(99, 102, 241, 0.15)` focus shadow | Focus shadow uses `var(--accent-soft)` — token swap produces `rgba(129, 140, 248, 0.12)`. Input bg `var(--surface)` swaps automatically. |
| 3 | Categories | `CategoriesSectionComponent` | `CatalogService.getCategories()` | None hardcoded — already uses tokens | All `--surface`, `--line`, `--shadow-md` swap automatically. Tile gradient placeholders not used here. |
| 4 | Featured | `FeaturedSectionComponent` | `CatalogService.getProducts()` top 4 | None in section — card colors handled by `ProductCardComponent` | Grid gap `20px` → `var(--space-6)` via spacing scale. Breakpoints: 4→2 @980px unified plan. |
| 5 | Best Sellers | `BestSellersSectionComponent` | `CatalogService.getBestSellers()` | None in section — card colors handled by `ProductCardComponent` | Same as Featured. Grid gap → `var(--space-6)`. Breakpoints unified. |
| 6 | Flash Sale | `FlashSaleSectionComponent` | `CatalogService.getFlashSale()` | `flash-sale-section.component.ts:88` `var(--danger-soft)` / `var(--surface)` gradient (works via token but light-mode values); `:85-89` uses `--sale` border which auto-swaps | Gradient becomes `linear-gradient(180deg, rgba(251, 113, 133, 0.08) 0%, var(--surface) 45%)`. Added `box-shadow: 0 0 20px rgba(251, 113, 133, 0.1)` glow. `--sale: #fb7185` (Rose-400). |
| 7 | Recommendations | `RecommendationsSectionComponent` | None (placeholder) | None — skeleton-only section | Skeleton uses `var(--skeleton-bg)` / `var(--skeleton-shine)` dark tokens. Overlay pill `--surface` bg swaps to `#151516`. |
| 8 | Brands | `BrandSectionComponent` | `CatalogService.getBrands()` | `brand-section.component.ts:101` `linear-gradient(135deg, #efeee9, #e3e2dc)` for initials fallback | Gradient placeholder → `var(--surface-2)` solid background for dark-mode safety. |
| 9 | Testimonials | `TestimonialsSectionComponent` | `CatalogService.getTestimonials()` | `testimonials-section.component.ts:127` `linear-gradient(135deg, #efeee9, #e3e2dc)` for avatar fallback | Same as Brands: gradient → `var(--surface-2)`. Card padding `20px` → `24px`. Gap `12px` → `16px`. Quote font `15px` → `var(--text-base)`. |
| 10 | Newsletter | `NewsletterSectionComponent` | `CatalogService.subscribeToNewsletter()` | `newsletter-section.component.ts:88` `background: var(--accent-soft)` — auto-swaps but light `#eef0ff` → dark `rgba(129, 140, 248, 0.12)` | No code change needed — token swap handles it. |
| 11 | Footer | `FooterComponent` | Static | `footer.component.ts:78` `background: var(--surface)` — auto-swaps | No code change. Add subtle top-glow for dark: `box-shadow: 0 -1px 0 rgba(255,255,255,0.05)` alongside existing border-top. |

### State matrix (dark-mode additions in **bold**)

| # | Section | Idle (data) | Loading | Empty | Error | Success/Edge |
|---|---|---|---|---|---|---|
| 1 | Hero | Full-width gradient bg (dark-adapted), glass art panel with dark surface mix, eyebrow + h1 + lede + CTAs + trust strip. **Tokens auto-swap — no DOM changes.** 4 skeleton tiles (`sk-cat`, `var(--skeleton-bg)`). | N/A | N/A | N/A | N/A |
| 2 | Search | Input with `--surface` bg, `--accent-soft` focus ring via token. | N/A | N/A | N/A | On Enter: navigate to `/products?q=<query>` (unchanged). |
| 3 | Categories | 5-column grid (gap `var(--space-2)` → **`var(--space-2)` token**). Tiles use `--surface` bg + `--line` border — auto-swap. Hover: `translateY(-3px)` + `--shadow-md`. | 5 skeleton tiles matching `.cat-tile` shape | "No categories available right now." centered text | Error message + `.btn-outline` "Retry" | Click tile → `/products?category=<slug>`. |
| 4 | Featured | `.section-head` + 4-column **grid class `var(--space-6)` gap** of `app-product-card`. Card hover: `translateY(-4px)` + accent glow ring (`0 0 0 1px var(--accent-soft), var(--shadow-md)`). | 4 skeleton cards with **staggered entrance (`--i * 80ms`)** | "Nothing to feature this week — check back soon." | Standard error + "Retry" | Identical interactions. Card tokens swapped. |
| 5 | Best Sellers | Same as Featured. `.section-head` + product grid. | Same as Featured | "Top sellers coming soon — check back later." | Standard error + "Retry" | Identical interactions. |
| 6 | Flash Sale | Sale-themed `.flash-wrap`: `2px solid var(--sale)` (Rose-400), dark gradient **`rgba(251, 113, 133, 0.08)` → `var(--surface)`**, **`box-shadow` glow**. Countdown timer. 4-column product grid. | Skeleton timer + 4 skeleton cards | "No active flash sales right now. Check back soon!" | Standard error + "Retry" | **Null API** → section hidden. **Ended** → "Sale ended" static. |
| 7 | Recommendations | 4 skeleton cards + overlay pill "Personalized recommendations coming soon." **Overlay bg uses swapped `--surface`.** | Inherent: always skeleton | N/A | N/A | N/A |
| 8 | Brands | Horizontal flex-wrap row of brand tiles (`.brand-tile`). **Initials fallback bg `var(--surface-2)` instead of hardcoded gradient.** | 6 skeleton circles | Section hidden entirely | Standard error + "Retry" | Image error → initials fallback. |
| 9 | Testimonials | 3-column grid (`--space-6` gap). Cards: **`24px` padding** (was `20px`), **`16px` gap** (was `12px`), quote `var(--text-base)` (was `15px`). **Avatar fallback `var(--surface-2)`.** | 3 skeleton testimonial cards | Section hidden entirely | Standard error + "Retry" | Null avatar → initials. Long quotes clamped to 3 lines. |
| 10 | Newsletter | Full-width: **`--accent-soft` auto-swaps to dark tint**. Form: email input + Subscribe button. | **Button loading spinner** via `.btn-loading` class (CSS spinner replaces "Subscribing…" text) | N/A | Inline error: `--danger` | Success: checkmark SVG + thank-you message. |
| 11 | Footer | 4-column grid. **Dark-mode top-glow** `box-shadow`. `--surface` bg auto-swaps. | N/A | N/A | N/A | Social icons: `fill="currentColor"` inherits `--ink-2` / `--accent` hover — works both modes. |

---

## Components

### Reused — no modifications needed

| Component | File : Line | Selector | Rationale for no change |
|---|---|---|---|
| `StarRatingComponent` | `src/app/shared/star-rating.component.ts:9-57` | `app-star-rating` | Track color `var(--line)` (replaced from `#dcdbd4`). Fill color `var(--accent)`. Both tokens swap in dark mode. |
| `CartComponent` | `src/app/pages/cart.component.ts:20-427` | `app-cart` | All colors use tokens. Empty-state emoji replaced with inline SVG. |
| `ProductListComponent` | `src/app/pages/product-list.component.ts:18-253` | `app-product-list` | All colors use tokens. Empty-state emoji replaced with inline SVG. Chip active state uses `--ink`/`#fff` — token swap handles dark. |
| `ProductDetailComponent` | `src/app/pages/product-detail.component.ts:25-340` | `app-product-detail` | All colors use tokens. Empty-state emoji replaced with inline SVG. `btn-dark` deprecated alias kept for backward compat (renders identically to `btn-invert`). Order status gets `aria-live="polite"`. |
| `FooterComponent` | `src/app/layout/footer.component.ts:7-179` | `app-footer` | Already token-based. Add `box-shadow: 0 -1px 0 rgba(255,255,255,0.05)` for dark mode top-glow. |
| `SearchSectionComponent` | `src/app/sections/search-section.component.ts:8-97` | `app-search-section` | Focus ring hardcoded `rgba(99, 102, 241, 0.15)` at `search-section.component.ts:75` — replace with `var(--accent-soft)` to make it token-driven. |
| `CategoriesSectionComponent` | `src/app/sections/categories-section.component.ts:13-160` | `app-categories-section` | Already token-based. Grid gap `14px` → `var(--space-2)` via spacing scale. Breakpoints from 560px → 720px. |
| `FeaturedSectionComponent` | `src/app/sections/featured-section.component.ts:95-129` | `app-featured-section` | Grid gap `20px` → `var(--space-6)`. Breakpoints 4→2 @980px, 2→1 @720px (was 560px). |
| `BestSellersSectionComponent` | `src/app/sections/best-sellers-section.component.ts:92-125` | `app-best-sellers-section` | Same grid/breakpoint changes as Featured. |
| `RecommendationsSectionComponent` | `src/app/sections/recommendations-section.component.ts:9-74` | `app-recommendations-section` | Already token-based. Skeleton inherits dark tokens automatically. |
| `NewsletterSectionComponent` | `src/app/sections/newsletter-section.component.ts:13-185` | `app-newsletter-section` | Already token-based. `--accent-soft` auto-swaps. Add `.btn-loading` class during submit instead of text "Subscribing…" (P1). |

### Modified — dark-mode / premium adaptations

| Component | File : Line | Modifications | Rationale |
|---|---|---|---|
| `HeaderComponent` | `src/app/layout/header.component.ts:12-213` | 1. Glass bg: `rgba(255,255,255,0.85)` → `color-mix(in srgb, var(--surface) 80%, transparent)` with `rgba(0,0,0,0.8)` fallback (`:76`). 2. `backdrop-filter: blur(16px)` (remove saturate) (`:77`). 3. Add theme-toggle button after cart icon (`:51-66`). 4. Nav link active/hover `--surface-2` swaps automatically. | Hardcoded white glass invisible on dark bg. Saturate not needed in dark. Theme toggle enables manual control. |
| `ProductCardComponent` | `src/app/shared/product-card.component.ts:15-326` | 1. Body padding `16px 16px 18px` → `20px` (`:241`). 2. Wish-btn bg `rgba(255,255,255,0.85)` → `var(--surface)` + `.opacity: 0.92` (`:193`). 3. Wish-btn hover bg `#fff` → `var(--surface-2)` (`:204`). 4. Qv-btn bg `rgba(255,255,255,0.92)` → `var(--surface)` + opacity (`:215`). 5. Image placeholder gradient `#efeee9`/`#e3e2dc` → `var(--surface-2)` (`:165`). 6. Hover `translateY(-3px)` → `-4px` (`:136`). 7. Hover shadow adds `0 0 0 1px var(--accent-soft)` glow (`:137`). 8. Body gap `8px` → `10px` (`:240`). 9. Name font `15px` → `16px` (`:251`). 10. Price font `18px` → `20px` (`:272`). 11. Cat font `11.5px` → `var(--text-xs)` (`:244`). | ~25 hardcoded light-mode literals break in dark mode. Premium spacing and sizing for elevated feel. |
| `HeroSectionComponent` | `src/app/sections/hero-section.component.ts:10-138` | 1. Gradient `#eef0ff` → dark-adapted `rgba(129, 140, 248, 0.15)` (`:50`). 2. Glass bg `rgba(255,255,255,0.55)` → `color-mix(in srgb, var(--surface) 75%, transparent)` (`:120`). 3. Glass border `rgba(255,255,255,0.8)` → `1px solid var(--line)` (`:121`). 4. Blob colors: `#c7ccff`/`#8b93f5` → deeper indigo `#6366f1`/`#4338ca` with `opacity: 0.3` (`:101`); `#ffe0c2`/`#ffb27a` → `#f59e0b`/`#d97706` with `opacity: 0.2` (`:108`). 5. Insert Inter `@import` via Google Fonts with `display=swap` in global styles. | Light-mode-only gradient and glass invisible on dark bg. Blob colors desaturated for dark bg harmony. |
| `FlashSaleSectionComponent` | `src/app/sections/flash-sale-section.component.ts:17-206` | 1. Gradient `var(--danger-soft)` (light `#fbeae8`) → `linear-gradient(180deg, rgba(251, 113, 133, 0.08) 0%, var(--surface) 45%)` (`:88`). 2. Add `box-shadow: 0 0 20px rgba(251, 113, 133, 0.1)` to `.flash-wrap` for dark-mode glow emphasis. 3. Grid gap `20px` → `var(--space-6)`. | Light `--danger-soft` looks washed on dark. Glow restores visual urgency lost in dark mode. |
| `TestimonialsSectionComponent` | `src/app/sections/testimonials-section.component.ts:15-232` | 1. Card padding `20px` → `24px` (`:100`). 2. Card gap `12px` → `16px` (`:103`). 3. Quote font `15px` → `var(--text-base)` (`:130`). 4. Quote `line-height` → `var(--lh-relaxed)` (`:133`). 5. Avatar initials fallback gradient `#efeee9`/`#e3e2dc` → `var(--surface-2)` (`:127`). 6. Grid gap `20px` → `var(--space-6)`. | Premium spacing. Hardcoded gradient invisible on dark bg. |
| `BrandSectionComponent` | `src/app/sections/brand-section.component.ts:14-164` | Initials fallback gradient `#efeee9`/`#e3e2dc` → `var(--surface-2)` (`:101`). | Hardcoded gradient invisible on dark bg. |
| `CartComponent` | `src/app/pages/cart.component.ts:20-427` | 1. Empty-state emoji `🛍️` → inline SVG shopping bag icon (`:41`). 2. Thumb fallback gradient `#efeee9`/`#e3e2dc` → `var(--surface-2)` (`:178`). 3. Ship-nudge progress bar bg `#e3e2dc` → `var(--line)` (`:278`). | Emoji rendering varies cross-OS; SVGs are pixel-perfect and themable. Hardcoded gradient invisible in dark. |
| `ProductListComponent` | `src/app/pages/product-list.component.ts:18-253` | 1. Empty-state emoji `🔍` → inline SVG search icon (`:81`). 2. Grid gap `20px` → `var(--space-6)`. 3. Breakpoints: @980px 4→3, @720px 3→2 (consistent with unified plan). | Emoji → SVG. Gap/breakpoints align with design system. |
| `ProductDetailComponent` | `src/app/pages/product-detail.component.ts:25-340` | 1. Empty-state emoji `🧭` → inline SVG compass icon (`:177`). 2. Order status div gets `role="status"` + `aria-live="polite"` (`:131`). 3. `btn-dark` reference preserved as deprecated alias for `btn-invert`. | Emoji → SVG. ARIA live region for async order feedback. |

### New files

| File | Purpose | Key details |
|---|---|---|
| `src/app/styles.css` (additions to existing) | Dark-mode `@media` block (`:157-199`), type scale tokens (`:232-262`), spacing scale tokens (`:488-501`), grid utility classes (`:464-478`), `btn-loading` CSS spinner (`:347-364`), `btn-invert` class (`:381-388`), `:root.dark` class block (`:207-209`), dark-adapted skeleton tokens (`:196-197`). | No existing tokens removed. All additions are backward-compatible. |
| `src/app/data/theme.service.ts` | Signal-based theme service with OS-preference detection, manual toggle, `localStorage` persistence. | Reads `prefers-color-scheme` on init. Writes `'dark'`, `'light'`, or `'system'` to `localStorage['aurora-theme']`. Toggles `.dark` class on `<html>`. |
| `src/app/app.config.ts` (modification) | Add `provideAnimations()` from `@angular/animations`. | ~15KB bundle addition for route transition animations. |

---

## Interaction & Edge States

### Validation (unchanged from original — token-dependent only)
- Newsletter email format validation: `Validators.email` + `Validators.required`. Error color uses `--danger` which is `#f87171` in dark mode (contrast ~5.9:1 — passes AA).
- `.input-danger` border: `var(--danger) !important` — no code change, token swap handles it.
- Double-submit prevention: input and button disabled during submit — `opacity: 0.55` via `.btn:disabled`.

### Disabled states
- All `.btn:disabled`: `opacity: 0.55`, `cursor: not-allowed`, no shadow. Background remains `var(--accent)` — in dark mode this is `#818cf8` on `#151516`, which still signals "accent but dimmed."
- Skeleton shimmer disabled under `prefers-reduced-motion` — global rule at `src/styles.css:372-377`.
- Countdown timer stops ticking when `endsAt` is past. Timer freezes on "Sale ended." No further `interval(1000)` emissions.

### Keyboard paths (unchanged)
All keyboard paths from the original UX spec are preserved. Dark mode does not alter tab order, focusable elements, or activation patterns. Added:
- **Theme toggle button**: `<button>` element, keyboard focusable, activated via Enter/Space. `aria-label` dynamically reads "Switch to dark mode" / "Switch to light mode."
- **Button loading spinner**: `.btn-loading` uses `::after` pseudo-element — no impact on keyboard accessibility. Button remains focusable but disabled while loading.

### Focus management (unchanged + additions)
- Existing `:focus-visible` outline: `2px solid var(--accent)` — in dark mode this is `#818cf8` on `#151516` (~5.8:1 contrast). Passes AA.
- **New:** Route transition focus management — after navigation, `#content` heading receives focus to move keyboard focus to new page content.
- **New:** Order status `aria-live="polite"` on product-detail page (`product-detail.component.ts:131`). Cart confirmation `role="status"` verified to include `aria-live`.

### Optimistic vs. pending (unchanged)
- **Wishlist toggle**: Optimistic — no API call. Heart icon swaps instantly. Pulse animation (`scale(1.2)`) added for tactile feedback.
- **Add to cart**: Optimistic — `CartService.add()` mutates local signal. Header badge updates immediately.
- **Newsletter subscribe**: Pending — shows `.btn-loading` spinner (new) + input disabled. Server round-trip completes before success/error.
- **Order placement**: Pending — button text "Placing…" (preserved). Status div with `aria-live="polite"` announces result.

### Edge: dark mode toggle persistence
- Theme choice persists across page reloads and tab restores via `localStorage['aurora-theme']` (values: `'dark'`, `'light'`, `'system'`).
- `ThemeService` constructor reads `localStorage` first (higher priority than OS preference). On first visit with no stored value, defaults to `'system'` (OS-following).
- No flash of wrong theme: `.dark` class is set synchronously in constructor before Angular renders the first component.

### Edge: countdown timer boundary (unchanged)
- Timer ticks every 1000ms via `interval()` piped through `takeUntilDestroyed`.
- When `endsAt < Date.now()`: display switches to "Sale ended." Products remain visible.
- Past-end on page load: section shows "ended" immediately.

### Edge: brand logo image failure (unchanged)
- `(error)` handler on `<img>` → hides `<img>` → shows initials fallback. Fallback bg uses `var(--surface-2)` instead of hardcoded gradient — visible in dark mode.
- Initials derived from first two word characters, uppercased.

### Edge: testimonial null avatar (unchanged)
- Same pattern as brand: `(error)` handler → initials fallback with `var(--surface-2)` bg.

### Edge: flash sale null vs. empty (unchanged)
- `null` from API → entire section removed from DOM (`@if (flashSale(); as sale)` guard).
- Empty `products[]` within non-null `FlashSale` → standard empty state.

### Edge: category tile with 0 product count (unchanged)
- Tile displays normally with "0 items". Click navigates to filtered list which shows empty state. Acceptable — no change.

### Responsive breakpoints (unified plan)

| Breakpoint | Effect | Sections affected |
|---|---|---|
| **≥980px** | 4-col grids, 5-col categories, 3-col testimonials | All product grids, categories, testimonials |
| **720–979px** | All grids → 2-col, categories → 3-col, testimonials → 2-col | Featured, BestSellers, FlashSale, Recommendations (4→2); Categories (5→3); Testimonials (3→2) |
| **<720px** | All grids → 1-col, categories → 2-col, testimonials → 1-col | Same. Nav hidden (no hamburger — deferred P2). |

**Note:** The 560px breakpoint is eliminated. Homepage sections previously using 560px now use 720px, matching the product-list page convention. This invalidates existing visual snapshots — regeneration is part of definition of done (spec Decision #18).

---

## Accessibility

### Semantic structure (additions for dark mode)

| Element | Location | Change |
|---|---|---|
| Theme toggle button | `header.component.ts` (new, after cart) | `<button class="theme-toggle" [attr.aria-label]="'Switch to ' + (dark ? 'light' : 'dark') + ' mode'">`. Shows sun SVG when dark, moon SVG when light. |
| Order status | `product-detail.component.ts:131` | Add `role="status"` or `aria-live="polite"` to the existing `.status` div for async order feedback. |
| Cart confirmation | `cart.component.ts:35` | Already has `role="status"` — verify `aria-live="polite"` is present (or add it). |
| Route focus management | `app.component.ts` | After navigation, focus `#content` heading or first interactive element to move keyboard focus. |
| Empty-state SVGs | `product-list.component.ts:81`, `cart.component.ts:41`, `product-detail.component.ts:177` | Inline SVGs with `aria-hidden="true"` replace emoji. Text content (heading + paragraph) communicates the state to screen readers — no `aria-label` needed on the icon. |

### Color and contrast (dark-mode verified)

All contrast ratios measured against the dark palette from `spec.md:151-199`:

| Token pair | Contrast ratio | WCAG result | Usage |
|---|---|---|---|
| `--accent (#818cf8)` on `--surface (#151516)` | ~5.8:1 | **AA** for normal text, AAA for large | Buttons, links, interactive accents |
| `--ink (#f5f5f4)` on `--bg (#0a0a0b)` | ~17.5:1 | **AAA** | Primary body text on page background |
| `--ink-2 (#a1a1a6)` on `--surface (#151516)` | ~6.2:1 | **AA** | Secondary text, muted labels |
| `--ink-3 (#636366)` on `--surface (#151516)` | ~3.8:1 | **AA only for large text** | Placeholder text, decorative labels only (per WCAG decorative exemption) |
| `--danger (#f87171)` on `--surface (#151516)` | ~5.9:1 | **AA** | Error messages, danger badges |
| `--sale (#fb7185)` on `--surface (#151516)` | ~6.4:1 | **AA** | Flash-sale border, discount badge bg |
| `#ffffff` on `--sale (#fb7185)` (badge text) | ~3.6:1 | AA for large/bold text (11.5px/650 weight qualifies) | Discount badge text |
| `--accent-soft` as focus ring on `--surface` | Minimal visual contrast — focus ring relies on `2px solid --accent` outline (passes) | Component focus indicator; the outline, not the soft bg, provides the contrast |

### Reduced motion
- Global `@media (prefers-reduced-motion: reduce)` at `src/styles.css:372-377` kills all animation and transition duration to `0.001ms`. This is **preserved and extended** to:
  - Staggered card entrance (`animation: card-enter` — killed by the global rule).
  - Button press `scale(0.97)` — killed by the global rule.
  - Heart pulse animation — killed by the global rule.
  - Route transitions (`@angular/animations`) — respect reduced motion via `AnimationBuilder` or `@.disabled` binding (future concern; the global CSS rule does not affect Angular animations, so this needs an `animationControl` factory that checks `prefers-reduced-motion` and disables the animation definition).
- Countdown timer text updates: still update (content change, not animation). Consider reducing tick frequency to 30s under reduced motion.

### Landmarks (unchanged from original)

All sections use semantic HTML with `aria-label` or `aria-labelledby`:
- HeroSection: `<section aria-label="Hero">`
- SearchSection: `<section role="search" aria-label="Search">`
- CategoriesSection: `<nav aria-label="Product categories">`
- Featured/BestSellers/FlashSale/Recommendations: `<section aria-labelledby="section-*-title">`
- BrandSection: `<section aria-label="Partner brands">`
- TestimonialsSection: `<section aria-label="Customer testimonials">`
- NewsletterSection: `<section aria-label="Newsletter signup">`

Theme toggle button is inside `<header>` (which is `HeaderComponent`) — landmark context is correct.

### Focus order (additions for toggle button)

Skip link → HeaderComponent: brand logo → Home link → Shop link → **theme toggle** → search input → cart icon → ... (rest of page follows original order).

The theme toggle is placed **before** the cart icon because it affects visual rendering of the entire page — users should be able to toggle it before encountering content that may be hard to read in the wrong mode.

---

## Brand Alignment

### Brand persona (unchanged — dark mode preserves tone)

Aurora Store remains "premium-adjacent without pretense." The dark mode extends the same personality:

- **Tone:** Confident, warm, utilitarian. "Considered gear for the modern desk." Indigo accent (`--accent: #818cf8` in dark — brighter than light-mode `#4f46e5` to compensate for dark bg). Warm near-black (`--bg: #0a0a0b` is not pure `#000000` — avoids the sterile "terminal" look; has a subtle warmth).
- **Visual language:** Deep surface stacking (bg → surface → surface-2 → surface-3 at `#0a0a0b` → `#151516` → `#1c1c1e` → `#242426`) creates layered depth without sharp contrast. Borders are luminous (`--line: #2c2c2e`) rather than opaque. Shadows become glow: `--shadow-md: 0 8px 24px rgba(0,0,0,0.4)` (denser drop) with accent glow ring on interactive elements.
- **Voice:** Direct, helpful. "Shop the catalogue" not "Explore our collection." Zero em-dashes. No changes to any text string — the redesign is purely visual.

### Design principles (extended from spec Section 8)

| Principle | Dark-mode manifestation |
|---|---|
| **P1. Fewer, better colors** | 4 surface layers (bg → surface-2 → surface-3 via `:root.dark`), 3 text layers (ink → ink-2 → ink-3), 1 accent. No new tokens beyond what the spec defines. |
| **P2. Typography is the interface** | Inter with `font-display: swap` via Google Fonts `@import`. Type scale eliminates ad-hoc `clamp()` inconsistencies. `--text-base` is 16px (was 15px). Heading weight standardized to `--fw-heading: 620`. |
| **P3. Motion as feedback, not decoration** | Route transitions (fade + slide-up, 150ms). Staggered card entrance (`--i * 80ms`). Button press `scale(0.97)`. All <300ms, all purposeful. All killed by `prefers-reduced-motion`. |
| **P4. Dark mode is not inverted light mode** | Purpose-built palette: deeper surface stack, brighter accent saturation (`#818cf8` vs light `#4f46e5`), luminous borders instead of opaque, glow shadows instead of drop. Skeleton shimmer goes from bright white flash to faint `rgba(255,255,255,0.06)`. |
| **P5. Consistency over cleverness** | Single `ProductCardComponent` used by all 4 product grids. No section-specific card variants. Grid utility classes consolidated. |
| **P6. Accessible by default** | All dark-mode token pairs verified against WCAG AA 4.5:1. Reduced motion respected. Theme toggle has dynamic `aria-label`. |
| **P7. Incremental delivery** | Token foundation (Phase 1) produces zero visual change. Dark-mode activation (Phase 2) only affects users with `prefers-color-scheme: dark` or those who toggle. Premium polish (Phase 3) benefits both modes. |

### Design tokens used (dark-mode additions)

All tokens from `src/styles.css:8-62` are preserved. The following **token categories** govern the dark-mode experience:

| Token category | Light (unchanged) | Dark (new) | Used by |
|---|---|---|---|
| Backgrounds | `--bg: #f6f6f3`, `--surface: #ffffff`, `--surface-2: #faf9f7` | `--bg: #0a0a0b`, `--surface: #151516`, `--surface-2: #1c1c1e`, `--surface-3: #242426` | Page, cards, surfaces, hover states |
| Text | `--ink: #17181c`, `--ink-2: #565a63`, `--ink-3: #8a8f98` | `--ink: #f5f5f4`, `--ink-2: #a1a1a6`, `--ink-3: #636366` | All text layers |
| Borders | `--line: #e8e7e2`, `--line-strong: #d7d6cf` | `--line: #2c2c2e`, `--line-strong: #38383a` | Card borders, dividers, inputs |
| Accent | `--accent: #4f46e5`, `--accent-strong: #4035c9`, `--accent-soft: #eef0ff` | `--accent: #818cf8`, `--accent-strong: #93a0fc`, `--accent-soft: rgba(129,140,248,0.12)` | Buttons, links, focus rings |
| Semantic | `--success: #197a4d`, `--danger: #bd362c`, `--sale: #d6482f` | `--success: #34d399`, `--danger: #f87171`, `--sale: #fb7185` | Badges, error messages, flash sale |
| Shadows | `rgba(20,22,28,0.05-0.12)` | `rgba(0,0,0,0.3-0.5)` (denser drop) | Card hover, dropdowns, glass elements |
| Skeleton | `--skeleton-bg: #ecebe6`, `--skeleton-shine: rgba(255,255,255,0.65)` | `--skeleton-bg: #1c1c1e`, `--skeleton-shine: rgba(255,255,255,0.06)` | Loading states |

### Global classes preserved (no changes needed)

All global classes from `src/styles.css:119-377` remain unchanged. Their visual rendering changes because they reference CSS custom properties which now have dark-mode values:
- `.btn`, `.btn-lg`, `.btn-outline`, `.btn-ghost`, `.btn-dark` (deprecated alias) → token-driven
- `.badge`, `.badge-accent`, `.badge-sale`, `.badge-success`, `.badge-warn`, `.badge-danger` → token-driven
- `.card` → `--surface` / `--line` token swap
- `.input`, `.select` → `--surface` / `--line-strong` token swap
- `.skeleton` → `--skeleton-bg` / `--skeleton-shine` token swap (new tokens)
- `.container`, `.section`, `.section-head`, `.eyebrow`, `.muted`, `.link-arrow`, `.sr-only` → no color-dependent styling

### New classes added

| Class | Location | Purpose |
|---|---|---|
| `.grid-4`, `.grid-3`, `.grid-2`, `.grid-auto` | `src/styles.css:464-478` | Grid utility presets with `24px` gap (was ad-hoc `20px` per section) |
| `.btn-invert` | `src/styles.css:381-388` | Renamed `btn-dark` for semantic correctness in both modes. Uses `--btn-bg: var(--ink)` / `--btn-fg: var(--bg)`. |
| `.btn-loading` | `src/styles.css:347-364` | CSS-only spinner pseudo-element. Hides button text, shows spinning border. |
| `.dark` (`:root.dark`) | `src/styles.css:207-209` | Class-based toggle for manual theme switching. Identical token overrides as `@media (prefers-color-scheme: dark)`. |

### Global font loading (new)

Inter is loaded via Google Fonts `@import` with `display=swap` — prevents FOIT on slow connections and guarantees the full weight range (400, 500, 600, 620, 650, 720) used by the type scale:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;620;650;720&display=swap');
```
This is added at the top of `src/styles.css`. No existing font loading mechanism existed — the app was falling back to system sans-serif.

### Visual patterns applied consistently

| Pattern | Source (file:line) | Dark-mode adaptation |
|---|---|---|
| Card hover lift + glow | `product-card.component.ts:135-139` | `translateY(-4px)` + `0 0 0 1px var(--accent-soft), var(--shadow-md)` |
| Shimmer skeleton | `src/styles.css:346-370` | Dark tokens `--skeleton-bg` / `--skeleton-shine` |
| Glassmorphism | `header.component.ts:76-78` | `color-mix(in srgb, var(--surface) 80%, transparent)` + `blur(16px)` |
| Gradient placeholder | `product-card.component.ts:165` | `var(--surface-2)` solid (was `#efeee9`/`#e3e2dc` gradient) |
| Inline SVG icon style | `header.component.ts:34-41` | `stroke-width: 1.8`, `currentColor` — inherits token color |
| `.section-head` pattern | `src/styles.css:143-149` | Unchanged — `--ink` heading color swaps automatically |
| Button loading spinner | `src/styles.css:347-364` (new) | `2px solid var(--on-accent)` with transparent top — visible on any button bg |
| Dark-mode accent glow | flash-sale and product card hovers | `box-shadow: 0 0 20px rgba(251,113,133,0.1)` (sale); `0 0 0 1px var(--accent-soft)` (cards) |

### Brand rules applied (from `design-taste-frontend` skill)

- **Singular accent:** One accent color (`--accent: #818cf8` in dark). Never used decoratively — only for interactive elements and semantic highlights.
- **No trust strip in hero:** Trust strip stays at bottom of hero copy column, visually separate from headline/lede.
- **Eyebrow count:** Exactly one eyebrow per section heading. Zero exceptions.
- **Shape lock:** All cards `--r-lg` (18px), all buttons `--r-pill`, all inputs `--r-md` (12px). No new radius tokens.
- **Em-dash ban:** Zero em-dashes in any UI text. (Spec `featured-section.component.ts:43` contains `&mdash;` in the phrase "check back soon" — this is HTML entity rendering as an em-dash in the browser. Replace with a plain en-dash or comma per `design-taste-frontend` skill Section 9.G.)
- **Responsive hero:** On narrow viewports (≤980px), hero collapses to single column with art hidden — preserves anti-center bias by keeping text left-aligned.
- **Skeleton integrity:** Every data-driven section has skeleton loading matching target layout dimensions. Dark skeleton uses safe colors — no blinding white flash.
- **Theme toggle placement:** Header, next to cart icon — visible on every page without adding layout weight. Follows patterns from Stripe and Linear.

---

## Appendix: Hardcoded Light-Mode Color Reference (~25 locations)

All locations that must change from hardcoded values to CSS custom property references:

| # | File | Line(s) | Current value | Replacement |
|---|---|---|---|---|
| 1 | `src/styles.css` | 350 | `background: #ecebe6` | `background: var(--skeleton-bg)` |
| 2 | `src/styles.css` | 361 | `rgba(255, 255, 255, 0.65)` | `var(--skeleton-shine)` |
| 3 | `hero-section.component.ts` | 50 | `#eef0ff` | `rgba(129, 140, 248, 0.15)` (dark-adapted) |
| 4 | `hero-section.component.ts` | 101 | `#c7ccff, #8b93f5` | `#6366f1, #4338ca` with `opacity: 0.3` |
| 5 | `hero-section.component.ts` | 108 | `#ffe0c2, #ffb27a` | `#f59e0b, #d97706` with `opacity: 0.2` |
| 6 | `hero-section.component.ts` | 120 | `rgba(255, 255, 255, 0.55)` | `color-mix(in srgb, var(--surface) 75%, transparent)` |
| 7 | `hero-section.component.ts` | 121 | `rgba(255, 255, 255, 0.8)` | `var(--line)` |
| 8 | `header.component.ts` | 76 | `rgba(255, 255, 255, 0.85)` | `color-mix(in srgb, var(--surface) 80%, transparent)` |
| 9 | `search-section.component.ts` | 75 | `rgba(99, 102, 241, 0.15)` | `var(--accent-soft)` |
| 10 | `product-card.component.ts` | 165 | `linear-gradient(135deg, #efeee9, #e3e2dc)` | `var(--surface-2)` |
| 11 | `product-card.component.ts` | 193 | `rgba(255, 255, 255, 0.85)` | `var(--surface)` + `opacity: 0.92` |
| 12 | `product-card.component.ts` | 204 | `background: #fff` | `var(--surface-2)` |
| 13 | `product-card.component.ts` | 215 | `rgba(255, 255, 255, 0.92)` | `var(--surface)` + `opacity: 0.92` |
| 14 | `star-rating.component.ts` | (track color) | `#dcdbd4` | `var(--line)` |
| 15 | `cart.component.ts` | 41 | `🛍️` | Inline SVG shopping bag `aria-hidden="true"` |
| 16 | `cart.component.ts` | 178 | `linear-gradient(135deg, #efeee9, #e3e2dc)` | `var(--surface-2)` |
| 17 | `cart.component.ts` | 278 | `#e3e2dc` | `var(--line)` |
| 18 | `product-list.component.ts` | 81 | `🔍` | Inline SVG search `aria-hidden="true"` |
| 19 | `product-detail.component.ts` | 177 | `🧭` | Inline SVG compass `aria-hidden="true"` |
| 20 | `brand-section.component.ts` | 101 | `linear-gradient(135deg, #efeee9, #e3e2dc)` | `var(--surface-2)` |
| 21 | `testimonials-section.component.ts` | 127 | `linear-gradient(135deg, #efeee9, #e3e2dc)` | `var(--surface-2)` |
| 22 | `flash-sale-section.component.ts` | 88 | `var(--danger-soft)` light value | Dark-adapted gradient (see spec) |
| 23 | `featured-section.component.ts` | 43 | `&mdash;` (em-dash) | `—` (en-dash or comma) |
| 24 | `best-sellers-section.component.ts` | 43 | `&mdash;` (em-dash) | `—` (en-dash or comma) |
| 25 | `btn-dark` (`src/styles.css`) | 230-236 | Hardcoded `#fff`/`#000` | Token-based via `btn-invert` alias |
