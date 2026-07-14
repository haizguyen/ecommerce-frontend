# Tasks — Premium Dark-Mode Redesign — Aurora Store

| Field | Value |
|---|---|
| **Feature ID** | `002-task-design-audit-premium-dark-mode-red` |
| **Author** | SDD Scrum Master |
| **Date** | 2026-07-14 |
| **Inputs** | [`spec.md`](./spec.md) · [`plan.md`](./plan.md) · [`ux.md`](./ux.md) · [`test-strategy.md`](./test-strategy.md) |
| **Skills** | `sdd-scrum-master` · `design-taste-frontend` |

**Plan refs key:** All stories reference [`plan.md`](./plan.md) — the plan is not sharded because its four-phase structure is self-contained and concise.

---

## Story 1 — CSS Token Foundation (Dark Colors, Type Scale, Spacing Scale, Grid Utilities)

**Plan refs:** `plan.md` Phase 1 · `plan.md` Section 4.3 (token contract)

**UX flows:** F1 (token swap mechanism)

**Description:** Add the complete dark-mode color token set under `@media (prefers-color-scheme: dark)` and `:root.dark`, the type-scale tokens (`--text-xs` through `--text-4xl`), the spacing-scale tokens (`--space-1` through `--space-24`), and grid utility classes (`.grid-4`, `.grid-3`, `.grid-2`, `.grid-auto`) to `src/styles.css`. Also add the Inter Google Fonts `@import` with `display=swap`. No existing rules are modified. This phase produces zero visual change to the light-mode output.

**Modified files:**
- `src/styles.css` — add dark-mode `@media` block (spec Section 4.1), `:root.dark` class block (spec Section 4.2), type-scale tokens (spec Section 5.1), spacing-scale tokens (spec Section 6.2), grid utilities (spec Section 6.1), `--skeleton-bg`/`--skeleton-shine` tokens, Inter `@import`

**Tests (from test-strategy.md):**
- MUST: None directly testable in isolation (requires Story 2 to activate dark mode). Visual inspection confirms light-mode output is unchanged.
- SHOULD: Run `npm run test:visual` — existing baselines must still pass (proves zero regression).

**Definition of done:**
- [ ] `src/styles.css` contains the full dark-mode `@media` block with all tokens from spec Section 4.1
- [ ] `src/styles.css` contains `:root.dark` class with identical token overrides (spec Section 4.2)
- [ ] `src/styles.css` contains type-scale tokens `--text-xs` through `--text-4xl` (spec Section 5.1)
- [ ] `src/styles.css` contains spacing-scale tokens `--space-1` through `--space-24` (spec Section 6.2)
- [ ] `src/styles.css` contains grid utility classes `.grid-4`, `.grid-3`, `.grid-2`, `.grid-auto` with 980px/720px breakpoints (spec Section 6.1)
- [ ] `src/styles.css` contains `--skeleton-bg` and `--skeleton-shine` tokens (spec Section 4.1)
- [ ] Inter `@import` with `display=swap` is added at top of `src/styles.css` (spec Decision #11)
- [ ] `npm run test:visual` passes — all existing light-mode baselines unchanged
- [ ] `npm run lint` passes

---

## Story 2 — ThemeService + Header Theme Toggle Button

**Plan refs:** `plan.md` Phase 2 · `plan.md` Section 4.1 (ThemeService API) · `plan.md` Section 2.3 (state diagram)

**UX flows:** F1 (OS-preference dark mode) · F2 (manual toggle)

**Description:** Create `src/app/data/theme.service.ts` — a signal-based service with `isDark` readonly signal, `toggle()` method, OS-preference detection via `window.matchMedia('(prefers-color-scheme: dark)')`, `localStorage` persistence under key `aurora-theme`, and `.dark` class synchronization on `document.documentElement`. Update `src/app/layout/header.component.ts` to inject `ThemeService`, replace the hardcoded glass background (`rgba(255,255,255,0.85)` → `color-mix(in srgb, var(--surface) 80%, transparent)` with fallback), update `backdrop-filter` to `blur(16px)` (remove saturate), and add the theme toggle button (moon/sun SVG icons, dynamic `aria-label`) after the cart icon.

**New files:** `src/app/data/theme.service.ts`

**Modified files:** `src/app/layout/header.component.ts`

**Tests (from test-strategy.md):**
- **UT-1:** Constructor reads `matchMedia` — `isDark()` matches OS preference
- **UT-2:** `toggle()` flips `isDark()` signal
- **UT-3:** `toggle()` syncs `.dark` class on `<html>`
- **UT-4:** `toggle()` persists to `localStorage` (key `'aurora-theme'`, values `'dark'`/`'light'`)
- **UT-5:** Constructor reads stored `localStorage` value before `matchMedia`
- **UT-6:** OS change listener updates signal when no manual override
- **UT-7:** OS change listener ignored when manual override exists
- **UT-8:** Missing/empty `localStorage` handled gracefully → defaults to `'system'`
- **UT-9:** Multiple `toggle()` calls are idempotent
- **UT-10:** `localStorage` key is exactly `'aurora-theme'`
- **E2E-3:** Manual toggle persistence across page reload
- **E2E-4:** Theme toggle focusable by keyboard, `aria-label` updates
- **AX-5:** Theme toggle has dynamic `aria-label` matching current mode
- **VR-9:** Capture header before/after toggle, verify icon swap (moon↔sun) and `.dark` class

**Definition of done:**
- [ ] `src/app/data/theme.service.ts` created with `isDark` readonly signal, `toggle()` method, `matchMedia` detection, `localStorage` persistence, `.dark` class sync
- [ ] `ThemeService` constructor reads `localStorage` first (priority), then `matchMedia`, defaults to `'system'`
- [ ] `ThemeService` listens for OS preference changes and updates signal (only when no manual override)
- [ ] Header glass background replaced with `color-mix(in srgb, var(--surface) 80%, transparent)` + fallback (spec Section 5.5)
- [ ] Header `backdrop-filter` changed to `blur(16px)` (spec Section 5.5)
- [ ] Theme toggle button added after cart icon with moon/sun SVGs and dynamic `aria-label` (spec Section 7.5)
- [ ] All 10 unit tests (UT-1 through UT-10) pass (`npm run test:ci`)
- [ ] `npm run lint` passes

---

## Story 3 — Replace Hardcoded Colors in Shared Components (Product Card, Star Rating)

**Plan refs:** `plan.md` Phase 2 · `plan.md` Section 5.2 (modified files list, shared components)

**UX flows:** F1 (dark-mode cards) · F3 (skeleton dark tokens) · F7 (wishlist toggle) · F8 (quick view)

**Description:** Replace all hardcoded light-mode color literals in shared components with CSS custom property references. In `src/app/shared/product-card.component.ts`: replace the image placeholder gradient (`#efeee9`/`#e3e2dc` → `var(--surface-2)`), wish-btn background (`rgba(255,255,255,0.85)` → `var(--surface)` + `opacity: 0.92`), qv-btn background (`rgba(255,255,255,0.92)` → `var(--surface)` + opacity), wish-btn hover bg (`#fff` → `var(--surface-2)`). Also update card dimensions: body padding `16px 16px 18px` → `20px`, body gap `8px` → `10px`, name font `15px` → `16px`, price font `18px` → `20px`, cat font `11.5px` → `var(--text-xs)`, hover `translateY(-3px)` → `-4px` + accent glow ring (`0 0 0 1px var(--accent-soft), var(--shadow-md)`). In `src/app/shared/star-rating.component.ts`: replace track color `#dcdbd4` → `var(--line)`. Add `btn-dark` deprecated alias → `btn-invert` in `src/styles.css` (with token-based `--btn-bg`/`--btn-fg`).

**Modified files:**
- `src/app/shared/product-card.component.ts` — 7 hardcoded color replacements + 6 padding/sizing updates
- `src/app/shared/star-rating.component.ts` — track color `#dcdbd4` → `var(--line)`
- `src/styles.css` — add `.btn-invert` class + `.btn-dark` deprecated alias (spec Section 5.3)

**Tests (from test-strategy.md):**
- **VR-1, VR-2:** Homepage light and dark screenshots verify product cards render correctly
- **VI-2:** Star rating track in dark mode is `var(--line)` — visible on `--surface`
- **VI-6:** Card hover glow ring (`0 0 0 1px var(--accent-soft)`) present
- **VI-8:** Button loading spinner (prerequisite for future story — not yet, but `.btn-invert` exists)
- **E2E-1:** `btn-dark` selector still works — elements render identically to `btn-invert`

**Definition of done:**
- [ ] All hardcoded colors in `product-card.component.ts` replaced with token references (spec Section 5.2)
- [ ] Product card padding updated to `20px`, gap to `10px`, name to `16px`, price to `20px`, cat to `var(--text-xs)` (spec Section 5.2)
- [ ] Card hover: `translateY(-4px)` + `0 0 0 1px var(--accent-soft), var(--shadow-md)` (spec Section 5.2)
- [ ] Star rating track color `#dcdbd4` → `var(--line)` (spec Section 5.4)
- [ ] `.btn-invert` class added with token-based `--btn-bg`/`--btn-fg` (spec Section 5.3)
- [ ] `.btn-dark` preserved as deprecated alias for `.btn-invert` (spec Decision #17)
- [ ] `npm run test:visual` passes (light-mode baselines re-verified)
- [ ] `npm run lint` passes

---

## Story 4 — Replace Hardcoded Colors in Sections and Pages

**Plan refs:** `plan.md` Phase 2 · `plan.md` Section 5.2 (all section/page entries)

**UX flows:** F1 (all sections) · F4 (error states) · F5 (empty states) · F6 (newsletter) · F9 (add to cart)

**Description:** Replace all hardcoded light-mode color literals in section components and page components. This covers:
- **HeroSection:** gradient `#eef0ff` → `rgba(129,140,248,0.15)`, blob colors → dark-adapted indigo/warm tones with reduced opacity, glass panel bg/border → token-based (spec Section 5.7)
- **FlashSaleSection:** gradient `var(--danger-soft)` light value → `rgba(251,113,133,0.08) 0%, var(--surface) 45%`, add `box-shadow: 0 0 20px rgba(251,113,133,0.1)` glow (spec Section 5.7)
- **TestimonialsSection:** avatar fallback gradient → `var(--surface-2)`, card padding `20px` → `24px`, gap `12px` → `16px`, quote font `15px` → `var(--text-base)`, line-height → `var(--lh-relaxed)` (spec Section 5.2)
- **BrandSection:** initials fallback gradient → `var(--surface-2)` (spec UX matrix #8)
- **SearchSection:** focus shadow `rgba(99,102,241,0.15)` → `var(--accent-soft)` (spec Section 5.7)
- **CartComponent:** thumb placeholder gradient → `var(--surface-2)`, progress bar bg `#e3e2dc` → `var(--line)` (spec Section 5.7)
- **ProductListComponent:** (color cleanup only — emoji deferred to Story 8)
- **ProductDetailComponent:** image placeholder gradient → `var(--surface-2)` (spec Section 5.7)
- **NewsletterSection:** verify `--accent-soft` auto-swaps — no code change expected (spec Section 5.7)

**Modified files:**
- `src/app/sections/hero-section.component.ts` — 5 color replacements + gradient update
- `src/app/sections/flash-sale-section.component.ts` — gradient + glow addition
- `src/app/sections/testimonials-section.component.ts` — 5 modifications (padding, gap, fonts, placeholder)
- `src/app/sections/brand-section.component.ts` — placeholder gradient replacement
- `src/app/sections/search-section.component.ts` — focus shadow replacement
- `src/app/pages/cart.component.ts` — placeholder + progress bar color replacements
- `src/app/pages/product-detail.component.ts` — placeholder gradient replacement
- `src/app/pages/product-list.component.ts` — (no hardcoded color fixes; structural changes in Story 7)

**Tests (from test-strategy.md):**
- **VR-1, VR-2:** Homepage light/dark — hero, flash-sale, testimonials, brands all render with correct tokens
- **VR-5, VR-6:** Product detail light/dark — image placeholder renders as `var(--surface-2)`
- **VR-7, VR-8:** Cart light/dark — thumb placeholder and progress bar use tokens
- **VI-1:** Skeleton colors in dark mode (prerequisite for sections — Story 1 tokens already set)
- **VI-4:** Hero blob colors in dark — indigo `#6366f1`/`#4338ca` with `opacity: 0.3`, warm `#f59e0b`/`#d97706` with `opacity: 0.2`
- **VI-5:** Flash-sale glow shadow present
- **VI-7:** Footer top glow (deferred to Story 6 — not yet)

**Definition of done:**
- [ ] Hero gradient, glass panel, and blob colors updated for dark mode (spec UX component table #1)
- [ ] Flash-sale gradient adapted + glow shadow added (spec Section 5.7)
- [ ] Testimonials card padding `24px`, gap `16px`, quote `var(--text-base)`, `var(--lh-relaxed)` (spec Section 5.2)
- [ ] Brand and testimonial avatar fallback gradients → `var(--surface-2)` (spec Section 5.7)
- [ ] Search focus shadow → `var(--accent-soft)` (spec Section 5.7)
- [ ] Cart thumb placeholder → `var(--surface-2)`, progress bar → `var(--line)` (spec Section 5.7)
- [ ] Product detail image placeholder → `var(--surface-2)` (spec Section 5.7)
- [ ] `npm run test:visual` passes with regenerated dark-mode baselines
- [ ] `npm run lint` passes

---

## Story 5 — Type Scale Adoption (Typography System)

**Plan refs:** `plan.md` Phase 3 · `plan.md` Section 4.3 (type-scale token contract)

**UX flows:** F1 (typography consistency)

**Description:** Apply the type-scale tokens (`--text-xs` through `--text-4xl`), font-weight tokens (`--fw-normal` through `--fw-brand`), and line-height tokens (`--lh-tight` through `--lh-relaxed`) to body text and all heading elements across the app. Update `src/styles.css` body defaults: `font-size: 15px` → `var(--text-base)`, `line-height: 1.5` → `var(--lh-normal)`. Replace per-component `clamp()` heading sizes with type-scale tokens. Update heading weight `640` → `var(--fw-heading: 620)` and letter-spacing `-0.02em` → `var(--ls-tight)`. Update `.eyebrow` font-size `12px` → `var(--text-xs)` and letter-spacing `0.14em` → `0.12em`.

**Modified files:**
- `src/styles.css` — body font-size/line-height, h1-h4 weight/spacing, `.eyebrow` size/spacing (spec Section 5.1)
- Component files with inline heading sizes — verify each uses type-scale tokens instead of raw `clamp()` or fixed px values

**Tests (from test-strategy.md):**
- **VR-1 (updated baseline):** Homepage light mode — verify body text is `16px`, headings use scale tokens
- **VI (visual inspection):** Eyebrow font-size `var(--text-xs)`, heading weight `var(--fw-heading)`

**Definition of done:**
- [ ] Body `font-size` → `var(--text-base)` (16px), `line-height` → `var(--lh-normal)` (1.55) (spec Section 5.1)
- [ ] `h1-h4` weight → `var(--fw-heading)` (620), letter-spacing → `var(--ls-tight)` (spec Section 5.1)
- [ ] `.eyebrow` font-size → `var(--text-xs)`, letter-spacing → `0.12em` (spec Section 5.1)
- [ ] All per-component `clamp()` heading sizes replaced with type-scale tokens where possible
- [ ] `npm run lint` passes

---

## Story 6 — Premium Polish: Route Transitions, Staggered Entrance, Loading Spinner, Footer Glow

**Plan refs:** `plan.md` Phase 3 · `plan.md` Section 7.1 (risk R6 — animations bundle)

**UX flows:** F3 (staggered skeleton entrance) · F6 (button loading spinner)

**Description:** Add four premium-polish features that benefit both light and dark modes:
1. **Route transitions:** Add `@angular/animations` dependency to `package.json`, add `provideAnimations()` to `app.config.ts`, define fade + slide-up route animation (150ms, `--ease` curve).
2. **Staggered card entrance CSS:** Add `@keyframes card-enter` animation and the staggered-delay pattern (`animation-delay: calc(var(--i) * 80ms)`) to `src/styles.css`. Apply `--i` custom property in `@for` loops across all product grid sections (Featured, BestSellers, FlashSale, Recommendations).
3. **Button loading spinner:** Add `.btn-loading` CSS class to `src/styles.css` — `::after` pseudo-element spinner, hides button text, uses `--on-accent` for spinner color. Apply to newsletter subscribe button (replacing text "Subscribing…") and optionally to order placement button.
4. **Footer dark-mode top glow:** Add `box-shadow: 0 -1px 0 rgba(255,255,255,0.05)` to footer in dark mode (spec Section 5.6).

**Modified files:**
- `package.json` — add `@angular/animations`
- `src/app/app.config.ts` — add `provideAnimations()`
- `src/styles.css` — add `btn-loading` spinner, staggered entrance keyframes, footer glow
- `src/app/layout/footer.component.ts` — add top-glow shadow for dark mode
- `src/app/sections/newsletter-section.component.ts` — apply `.btn-loading` during submit
- All product grid sections — add `--i` custom property in `@for` loops

**Tests (from test-strategy.md):**
- **AX-6:** Animations respect `prefers-reduced-motion` (CSS animations killed by global rule; Angular route transitions need verification)
- **VI-8:** Button loading spinner visible when `.btn-loading` class applied
- **VI-7:** Footer top glow visible in dark mode
- **R6 check:** `ng build --configuration production` succeeds with `@angular/animations` included

**Definition of done:**
- [ ] `@angular/animations` installed, `provideAnimations()` in `app.config.ts`
- [ ] Route transition animation (fade + slide-up, 150ms) defined and working
- [ ] Staggered card entrance animation (`--i * 80ms`) added to all product grid `@for` loops
- [ ] `.btn-loading` CSS spinner class added to `src/styles.css` (spec Section 5.3)
- [ ] Newsletter subscribe button uses `.btn-loading` instead of "Subscribing…" text
- [ ] Footer top glow `box-shadow` added for dark mode (spec Section 5.6)
- [ ] `ng build --configuration production` succeeds
- [ ] `npm run lint` passes

---

## Story 7 — Layout Cleanup: Grid Utilities, Breakpoint Standardization, Spacing Scale Adoption

**Plan refs:** `plan.md` Phase 4 · `plan.md` Section 5.2 (section grid changes)

**UX flows:** F1 (responsive breakpoints) · UX spec responsive table

**Description:** Replace inline grid declarations in all section components with CSS utility classes (`.grid-4`, `.grid-3`, `.grid-auto`). Standardize responsive breakpoints across all sections to the unified 980px/720px scheme (eliminate the 560px breakpoint). Apply spacing-scale tokens (`--space-2` through `--space-18`) to replace the 14 ad-hoc gap/padding values across sections. Affected components: FeaturedSection, BestSellersSection, FlashSaleSection, RecommendationsSection, CategoriesSection, TestimonialsSection, ProductListComponent.

**Modified files:**
- `src/app/sections/featured-section.component.ts` — inline grid → `.grid-4`, breakpoints unified, gap → `--space-6`
- `src/app/sections/best-sellers-section.component.ts` — same as featured
- `src/app/sections/flash-sale-section.component.ts` — inline grid → `.grid-4`, gap → `--space-6`
- `src/app/sections/recommendations-section.component.ts` — inline grid → `.grid-4`, breakpoints unified
- `src/app/sections/categories-section.component.ts` — grid gap `14px` → `--space-3`, breakpoints 980px/720px
- `src/app/sections/testimonials-section.component.ts` — grid gap `20px` → `--space-6`, breakpoints unified
- `src/app/pages/product-list.component.ts` — breakpoints 4→3 @980px, 3→2 @720px (unified)
- `src/app/sections/hero-section.component.ts` — section padding `72px` → `var(--space-18)` (spec Section 6.3)
- `src/app/sections/newsletter-section.component.ts` — section padding `72px` → `var(--space-18)` (spec Section 6.3)
- `src/app/layout/footer.component.ts` — section margin-top `72px` → `var(--space-18)` (spec Section 6.3)

**Tests (from test-strategy.md):**
- **VR-10, VR-11:** Mobile (390×844) and tablet (768×1024) dark-mode screenshots verify responsive breakpoints
- **VI-9:** Resize to <720px → all product grids collapse to 1 column
- **VI-9:** At 720–979px → all grids are 2 columns, categories 3 columns, testimonials 2 columns
- **R7 check:** Device-width 600px, 768px, 1024px render correctly (no layout regression)
- All existing E2E tests pass (no selector changes)

**Definition of done:**
- [ ] All product-grid sections use `.grid-4`/`.grid-3` utility classes instead of inline grid declarations
- [ ] Categories grid uses spacing-scale token and 980px/720px breakpoints
- [ ] Testimonials grid uses `.grid-auto` or explicit class with unified breakpoints
- [ ] Product-list grid breakpoints match unified scheme (4→3 @980px, 3→2 @720px)
- [ ] Section padding-block values use spacing-scale tokens (spec Section 6.3)
- [ ] 560px breakpoint eliminated from all sections
- [ ] Layout verified on 600px, 768px, 1024px widths — no regression
- [ ] `npm run test:visual` passes with new responsive baselines
- [ ] `npm run lint` passes

---

## Story 8 — Accessibility: Emoji→SVG Replacement, ARIA Live Regions, Focus Management

**Plan refs:** `plan.md` Phase 4 · `plan.md` Section 5.2 (emoji replacements, ARIA additions)

**UX flows:** F5 (empty states) · UX spec accessibility table

**Description:** Replace emoji characters in empty/error states with inline SVG icons matching the HeaderComponent icon style (`stroke-width: 1.8`, `currentColor`, `aria-hidden="true"`). Add `aria-live="polite"` regions to order status and cart confirmation. Add route-change focus management (focus `#content` heading after navigation). Add `prefers-reduced-motion` guard for Angular route transitions.

**Emoji replacements:**
- `src/app/pages/product-list.component.ts:81` — `🔍` → inline SVG search icon
- `src/app/pages/cart.component.ts:41` — `🛍️` → inline SVG shopping bag icon
- `src/app/pages/product-detail.component.ts:177` — `🧭` → inline SVG compass/ghost icon

**ARIA additions:**
- `src/app/pages/product-detail.component.ts:131` — add `aria-live="polite"` + `role="status"` to order status div
- `src/app/pages/cart.component.ts:35` — add `aria-live="polite"` to existing `role="status"` element
- `src/app/app.component.ts` — add focus management after route change (focus `#content` heading)

**Modified files:**
- `src/app/pages/product-list.component.ts` — emoji → SVG
- `src/app/pages/cart.component.ts` — emoji → SVG + ARIA live region
- `src/app/pages/product-detail.component.ts` — emoji → SVG + ARIA live region
- `src/app/app.component.ts` — focus management on route change

**Tests (from test-strategy.md):**
- **AX-3:** Order status has `aria-live="polite"` or `role="status"`
- **AX-4:** Cart confirmation has `aria-live="polite"` alongside existing `role="status"`
- **AX-6:** Route transitions respect `prefers-reduced-motion` (verify Angular animation respects reduced motion — may need `animationControl` factory)
- **VI-10:** Empty states show SVG icons — no emoji characters present

**Definition of done:**
- [ ] `🔍` in product-list empty state → inline SVG search icon with `aria-hidden="true"`
- [ ] `🛍️` in cart empty state → inline SVG shopping bag icon with `aria-hidden="true"`
- [ ] `🧭` in product-detail empty state → inline SVG compass icon with `aria-hidden="true"`
- [ ] All SVGs match HeaderComponent icon style (`stroke-width: 1.8`, `currentColor`)
- [ ] Order status div has `aria-live="polite"` + `role="status"` (spec Section 7.4)
- [ ] Cart confirmation has `aria-live="polite"` (spec Section 7.4)
- [ ] Route change focuses `#content` heading (spec Section 7.4)
- [ ] Route transitions respect `prefers-reduced-motion`
- [ ] `npm run lint` passes
