# Progress: Premium Dark-Mode Redesign

| Field | Value |
|---|---|
| **Feature ID** | `002-task-design-audit-premium-dark-mode-red` |
| **Branch** | `aiko/aiko-sdd-lite-fe-task-design-audit-premium-dark-mo-3af83179` |
| **Started** | 2026-07-14 |
| **Status** | Complete |

---

## Story 1 — CSS Token Foundation [DONE]

**Commit:** `16b107f` — `feat(002-story-1): CSS Token Foundation`

### Accomplished
- Added Inter font `@import` with `display=swap` at top of `src/styles.css`
- Added full dark-mode `@media (prefers-color-scheme: dark)` token block with all colors, shadows, and skeleton tokens from spec Section 4.1
- Added `:root.dark` class override with identical token set for manual toggle (spec Section 4.2)
- Added type-scale tokens `--text-xs` through `--text-4xl` (spec Section 5.1)
- Added font weight tokens `--fw-normal` through `--fw-brand`
- Added line height tokens `--lh-tight` through `--lh-relaxed`
- Added letter spacing tokens `--ls-tight` through `--ls-display`
- Added spacing-scale tokens `--space-1` through `--space-24` (spec Section 6.2)
- Added grid utility classes `.grid-4`, `.grid-3`, `.grid-2`, `.grid-auto` with 980px/720px breakpoints (spec Section 6.1)
- Added `--skeleton-bg` and `--skeleton-shine` light-mode defaults to `:root`, dark overrides in both dark blocks
- Updated skeleton CSS from hardcoded colors to `var(--skeleton-bg)` / `var(--skeleton-shine)`

### Verification
- `npm run test:visual`: 6/7 pass (1 pre-existing failure: `product-detail @ desktop` — qv-btn click interception, unrelated)
- `npm run lint`: passes (no-op)
- `npm run test:ci`: passes

---

## Story 2 — ThemeService + Header Theme Toggle [DONE]

**Commit:** `ca93db7` — `feat(002-story-2): ThemeService + Header Theme Toggle`

### Accomplished
- Created `src/app/data/theme.service.ts` — signal-based service with `isDark` readonly signal, `toggle()`, `matchMedia` OS-preference detection, `localStorage` persistence under `aurora-theme`, `.dark` class sync, listener gated by manual-override check
- Created `src/app/data/theme-service.util.spec.ts` — full test suite with 10 UT groups (20+ assertions), mocking `@angular/core` ESM via `jest.mock`, browser globals via `Object.defineProperty`, per-test localStorage overrides for error-handling
- Updated `src/app/layout/header.component.ts`: injected ThemeService, added theme toggle button (moon/sun SVGs, dynamic `aria-label`, `data-testid`), updated glass background to `color-mix(in srgb, var(--surface) 80%, transparent)` with `backdrop-filter: blur(16px)`
- `npm run test:ci`: 18 suites, 158 tests — all pass
- `npm run test:visual`: 6/7 pass (1 pre-existing failure: `product-detail @ desktop` — qv-btn click interception, unrelated)

### Verification
- `npm run test:ci`: 158/158 pass
- `npm run test:visual`: 6/7 pass (1 pre-existing unrelated)
- `npm run lint`: passes

---

## Story 3 — Replace Hardcoded Colors in Shared Components [DONE]

**Commit:** `1634704` — `feat(002-story-3): Replace Hardcoded Colors in Shared Components`

### Accomplished
- `src/app/shared/product-card.component.ts` — 7 hardcoded color replacements: placeholder gradient → `var(--surface-2)`, wish-btn background → `var(--surface)` + `opacity: 0.92`, wish-btn hover → `var(--surface-2)`, qv-btn background → `var(--surface)` + `opacity: 0.92`. Also 6 padding/sizing updates: body gap `8px`→`10px`, padding `16px 16px 18px`→`20px`, cat font → `var(--text-xs)`, name font `15px`→`16px`, price font `18px`→`20px`, hover `translateY(-3px)`→`-4px` + `0 0 0 1px var(--accent-soft)` ring
- `src/app/shared/star-rating.component.ts` — track color `#dcdbd4` → `var(--line)`
- `src/styles.css` — added `.btn-invert` class with `--btn-bg: var(--ink)` / `--btn-fg: var(--bg)`, preserved `.btn-dark` as deprecated alias with comma-separated selector; hover changed from `#000` to `var(--ink)` with `box-shadow: none`

### Verification
- `npm run test:ci`: 18 suites, 158 tests — all pass
- `npm run test:visual`: 6/7 pass (1 pre-existing failure: `product-detail @ desktop` — qv-btn click interception, unrelated)
- `npm run lint`: passes

---

## Story 4 — Replace Hardcoded Colors in Sections and Pages [DONE]

**Commit:** `4dad339` — `feat(002-story-4): Replace Hardcoded Colors in Sections and Pages`

### Accomplished
- `src/app/sections/hero-section.component.ts`: Hero bg gradient `#eef0ff` → dark `rgba(129,140,248,0.15)`, indigo blobs `#c7ccff`/`#8b93f5` → dark `#6366f1`/`#4338ca` with `opacity: 0.3`, warm blobs `#ffe0c2`/`#ffb27a` → dark `#f59e0b`/`#d97706` with `opacity: 0.2`, glass panel bg → `color-mix(in srgb, var(--surface) 75%, transparent)`, glass panel border → `var(--line)`. Dark-mode overrides in both `@media (prefers-color-scheme: dark)` and `:root.dark` blocks
- `src/app/sections/flash-sale-section.component.ts`: Dark gradient adapted to `rgba(251,113,133,0.08)` at 45%, added `box-shadow: 0 0 20px rgba(251,113,133,0.1)` glow for dark mode
- `src/app/sections/testimonials-section.component.ts`: Card padding `20px` → `24px`, gap `12px` → `16px`, quote font `15px` → `var(--text-base)` with `var(--lh-relaxed)`, avatar fallback gradient → `var(--surface-2)`
- `src/app/sections/brand-section.component.ts`: Initials fallback gradient → `var(--surface-2)`
- `src/app/sections/search-section.component.ts`: Focus shadow `rgba(99,102,241,0.15)` → `var(--accent-soft)`
- `src/app/pages/cart.component.ts`: Thumb placeholder gradient → `var(--surface-2)`, progress bar `#e3e2dc` → `var(--line)`
- `src/app/pages/product-detail.component.ts`: Image placeholder gradient → `var(--surface-2)`

### Verification
- `npm run test:ci`: 18 suites, 158 tests — all pass
- `npm run test:visual`: 6/7 pass (1 pre-existing failure: `product-detail @ desktop` — qv-btn click interception, unrelated)
- `npm run lint`: passes

---

## Story 5 — Type Scale Adoption [DONE]

**Commit:** `e474f09` — `feat(002-story-5): Type Scale Adoption`

### Accomplished
- `src/styles.css`: Body `font-size: 15px` → `var(--text-base)`, `line-height: 1.5` → `var(--lh-normal)`
- `src/styles.css`: `h1-h4` `font-weight: 640` → `var(--fw-heading)`, `letter-spacing: -0.02em` → `var(--ls-tight)`
- `src/styles.css`: `.eyebrow` `font-size: 12px` → `var(--text-xs)`, `letter-spacing: 0.14em` → `0.12em`
- `src/styles.css`: `.section-head h2` `clamp(22px,2.4vw,30px)` → `var(--text-xl)`
- `src/app/sections/hero-section.component.ts`: Hero h1 `clamp(34px,5vw,58px)` → `var(--text-4xl)`
- `src/app/pages/cart.component.ts`: Cart h1 `clamp(26px,3vw,36px)` → `var(--text-2xl)`
- `src/app/pages/product-detail.component.ts`: Detail h1 `clamp(24px,3vw,34px)` → `var(--text-2xl)`
- `src/app/pages/product-list.component.ts`: List h1 `clamp(26px,3vw,36px)` → `var(--text-2xl)`

### Verification
- `npm run test:ci`: 18 suites, 158 tests — all pass
- `npm run test:visual`: 6/7 pass (1 pre-existing failure: `product-detail @ desktop` — qv-btn click interception, unrelated)
- `npm run lint`: passes

---

## Story 6 — Premium Polish [DONE]

**Commit:** `c9ad186` — `feat(002-stories-6-8): Premium Polish, Layout Cleanup, and Accessibility`

### Accomplished
- Added `@angular/animations` dependency (`npm install`)
- Added `provideAnimations()` to `app.config.ts` providers
- Created `src/app/animations.ts` with `routeAnimations` trigger (fade + slide-up 12px, 150ms ease-out, leave fade 120ms)
- Wired `routeAnimations` in `app.component.ts` with `[@routeAnimations]="getRouteAnimation(outlet)"` binding
- Added route `data: { animation: '...' }` to all 4 routes in `app.routes.ts` for animation state distinction
- Added `[@.disabled]="animationsDisabled"` binding respecting `prefers-reduced-motion: reduce`
- Added `@keyframes card-enter` and `.card-stagger` class CSS to `src/styles.css` (fade + slide-up 400ms, stagger delay `calc(var(--i) * 80ms)`)
- Added `.btn-loading` class CSS (spinning border spinner, text hidden via `color: transparent`)
- Applied `.card-stagger` with `style="--i: $index"` to product card wrappers in featured-section, best-sellers-section, flash-sale-section
- Applied `[class.btn-loading]="submitting()"` to newsletter subscribe button, removed conditional "Subscribing…" text toggle
- Added footer dark-mode top glow: `box-shadow: 0 -1px 0 rgba(255,255,255,0.05)` via media query and `:root.dark` in footer component

### Verification
- `npm run test:ci`: 18 suites, 158 tests — all pass
- `npm run test:visual`: 6/7 pass (1 pre-existing failure: `product-detail @ desktop` — qv-btn click interception, unrelated)
- `npm run lint`: passes
- `ng build --configuration production`: builds successfully (1 pre-existing CSS syntax warning, cosmetic)

---

## Story 7 — Layout Cleanup [DONE]

**Commit:** `c9ad186` — `feat(002-stories-6-8): Premium Polish, Layout Cleanup, and Accessibility`

### Accomplished
- `src/app/sections/hero-section.component.ts`: `padding-block: 72px` → `var(--space-18)`
- `src/app/sections/newsletter-section.component.ts`: `padding-block: 72px` → `var(--space-18)`
- `src/app/layout/footer.component.ts`: `margin-top: 72px` → `var(--space-18)`
- `src/app/sections/featured-section.component.ts`: Switched from local `.grid` with `gap: 20px` to global `.grid-4` (24px gap, 980px/720px breakpoints); removed local grid styles
- `src/app/sections/best-sellers-section.component.ts`: Removed local `.grid-4` override (was `gap: 20px`), now inherits global utility
- `src/app/sections/flash-sale-section.component.ts`: Same as best-sellers — removed local override
- `src/app/sections/recommendations-section.component.ts`: Same as best-sellers — removed local override
- `src/app/sections/testimonials-section.component.ts`: Switched from local `.test-grid` to global `.grid-3`; removed local grid + breakpoint
- `src/app/sections/categories-section.component.ts`: Gap `14px` → `var(--space-3)` (12px); breakpoint `560px` → `720px` for standard scheme
- `src/app/pages/product-list.component.ts`: Verified already has correct breakpoint scheme — no changes needed
- Standardized all breakout breakpoints from custom values (560px) to 980px/720px scheme

### Verification
- `npm run test:ci`: 18 suites, 158 tests — all pass
- `npm run lint`: passes
- `ng build --configuration production`: builds successfully (1 pre-existing CSS syntax warning, cosmetic)

---

## Story 8 — Accessibility [DONE]

**Commit:** `c9ad186` — `feat(002-stories-6-8): Premium Polish, Layout Cleanup, and Accessibility`

### Accomplished
- `src/app/pages/product-list.component.ts`: Replaced 🔍 emoji in empty state (`<div class="empty-ico">🔍</div>`) with inline SVG magnifying glass icon (`aria-hidden="true"`)
- `src/app/pages/cart.component.ts`: Replaced 🛍️ emoji in empty state (`<div class="empty-ico">🛍️</div>`) with inline SVG shopping bag icon (`aria-hidden="true"`)
- `src/app/pages/product-detail.component.ts`: Replaced 🧭 emoji in empty state (`<div class="empty-ico">🧭</div>`) with inline SVG compass icon (`aria-hidden="true"`)
- `src/app/pages/product-detail.component.ts`: Added `aria-live="polite"` to the order status div for dynamic order status announcements
- `src/app/pages/cart.component.ts`: Cart confirmation already had `role="status"` (implicit `aria-live="polite"`) — no changes needed
- `src/app/app.component.ts`: Added `tabindex="-1"` to `<main id="content">` for programmatic focusability
- `src/app/app.component.ts`: Added route-change focus management via `Router.events` — on `NavigationEnd`, focuses `#content` and scrolls to top

### Verification
- `npm run test:ci`: 18 suites, 158 tests — all pass
- `npm run lint`: passes
- `ng build --configuration production`: builds successfully (1 pre-existing CSS syntax warning, cosmetic)
