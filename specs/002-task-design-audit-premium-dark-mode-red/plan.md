# Plan: Premium Dark-Mode Redesign — Aurora Store

| Field | Value |
|---|---|
| **Feature ID** | `002-task-design-audit-premium-dark-mode-red` |
| **Status** | Plan — Ready for implementation |
| **Author** | SDD Architect |
| **Inputs** | [`spec.md`](./spec.md) · [`ux.md`](./ux.md) |
| **Skills** | `sdd-architect` · `design-taste-frontend` |

---

## 3-Sentence Summary

The redesign introduces a complete dark-mode colour token set in `src/styles.css` under `@media (prefers-color-scheme: dark)` plus a `:root.dark` class variant, activated by a new signal-based `ThemeService` that reads OS preference and persists the choice to `localStorage`, with all ~25 hardcoded light-mode color literals across 14 component files replaced by token references. A defined type scale (`--text-xs` through `--text-4xl`) and spacing scale (`--space-1` through `--space-24`) eliminate the current ad-hoc `clamp()` and 14-distinct-gap-value sprawl, while route-transition animations (`@angular/animations`), staggered card entrance, and refined product-card padding/floating-action-button backgrounds deliver the premium polish specified in UX flows F1–F9. The plan is fully incremental: tokens are added with zero visual change in Phase 1, dark-mode activation in Phase 2 flips the look for dark-OS users without touching light-mode output, and Phases 3–4 apply premium polish and layout cleanup that benefit both modes — every change is grounded in real file:line citations below.

---

## 1. Technical Approach

The implementation follows a four-phase incremental strategy where each phase is independently deployable without breaking the current build.

**Phase 1 — Token foundation** adds dark-mode tokens, a type scale, a spacing scale, and grid utility classes to `src/styles.css`. All additions sit inside new `@media`/`:root` blocks; no existing rule is modified. The build output is visually identical to production.

**Phase 2 — Dark-mode activation** creates `src/app/data/theme.service.ts` (a signal-based service with `isDark` readonly signal, `toggle()` method, OS-preference detection via `matchMedia`, and `localStorage` persistence under key `aurora-theme`). Every hardcoded light-mode color literal across 14 component files is replaced with a CSS custom property reference — the star-rating track (`star-rating.component.ts:37`), image-placeholder gradients (`product-card.component.ts:165`), wish-list and quick-view button backgrounds (`product-card.component.ts:193,215`), header glass effect (`header.component.ts:76`), skeleton shimmer (`styles.css:350,361`), and hero blobs (`hero-section.component.ts:101,108`). The `btn-dark` class is preserved as a deprecated alias for a new `btn-invert` that reads token-based `--btn-bg`/`--btn-fg`. The theme toggle button is added to the header next to the cart icon (per UX flow F2).

**Phase 3 — Premium polish** applies the type scale and spacing scale across all components, adds `@angular/animations` route transitions (fade + slide-up, ~150ms), implements CSS-only staggered card entrance via `--i` custom property on `@for` loops, adds a `btn-loading` CSS spinner class, and adds a subtle top-divider glow to the footer for dark mode. These changes are visible in both light and dark modes and raise the overall design quality.

**Phase 4 — Layout cleanup** standardises grid utilities (`.grid-4`, `.grid-3`, etc.) and responsive breakpoints (unifying on 980px/720px, eliminating the 560px breakpoint), replaces emoji in empty/error states (`🔍`, `🛍️`, `🧭`) with inline SVGs matching the existing HeaderComponent icon pattern, and adds `aria-live` regions to order-status and cart-confirmation elements for accessibility.

**Key architectural constraints:** All changes are exclusively presentation-layer — no data models (`src/app/data/models.ts`), no services (`cart.service.ts`, `order.service.ts`, `wishlist.service.ts`, `catalog.service.ts`), no routes (`app.routes.ts`), and no mock backend (`mock-backend.interceptor.ts`) are touched. The existing Angular 17 standalone-component pattern with `ChangeDetectionStrategy.OnPush` and signal-based reactive state is preserved throughout.

---

## 2. Architecture — Before / After

### 2.1 Before — Current State (light-mode only)

```
┌─────────────────────────────────────────────────────────┐
│                     index.html                           │
│  (no font loading — Inter falls to system sans-serif)   │
├─────────────────────────────────────────────────────────┤
│                src/styles.css  (:root)                   │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Light-mode tokens only:                            │ │
│  │  --bg: #f6f6f3   --surface: #fff   --ink: #17181c   │ │
│  │  --accent: #4f46e5  --shadow-* (drop, light)        │ │
│  │  No @media (prefers-color-scheme) block             │ │
│  │  No type scale  No spacing scale  No grid utils     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  14 Component files (inline styles)                       │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  ~25 hardcoded light-mode color literals:           │ │
│  │  #efeee9, #e3e2dc, #dcdbd4, #ecebe6,               │ │
│  │  rgba(255,255,255,0.85), #fff, #000, etc.           │ │
│  │  Ad-hoc clamp() type sizes  Ad-hoc gap values       │ │
│  │  No dark-mode-aware backgrounds                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  app.config.ts                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  provideRouter(...)  provideHttpClient(...)         │ │
│  │  No provideAnimations()                             │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  No ThemeService    No dark class    No toggle button    │
└─────────────────────────────────────────────────────────┘
```

### 2.2 After — Dark-Mode-Aware Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     index.html                           │
│  Google Fonts @import Inter wght@400..720&display=swap  │
├─────────────────────────────────────────────────────────┤
│                src/styles.css  (:root + dark)            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Light-mode tokens (existing, unchanged)            │ │
│  │  ───────────────────────────────────────────────── │ │
│  │  Type scale: --text-xs .. --text-4xl               │ │
│  │  Spacing scale: --space-1 .. --space-24            │ │
│  │  Grid utilities: .grid-4, .grid-3, .grid-2         │ │
│  │  Button spinner: .btn-loading                       │ │
│  │  Inverted button: .btn-invert                       │ │
│  │  ───────────────────────────────────────────────── │ │
│  │  @media (prefers-color-scheme: dark) { :root { } } │ │
│  │  :root.dark { }  (same tokens via class)            │ │
│  │  Dark tokens:                                       │ │
│  │  --bg: #0a0a0b  --surface: #151516  --ink: #f5f5f4 │ │
│  │  --accent: #818cf8  --shadow-* (glow, dark)        │ │
│  │  --skeleton-bg, --skeleton-shine                    │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  14 Component files (same inline styles, now token-ref)  │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Hardcoded literals → var(--...) references         │ │
│  │  clamp() sizes → --text-* tokens                   │ │
│  │  Gap values → --space-* tokens                     │ │
│  │  Grid defs → .grid-4/.grid-3 CSS classes           │ │
│  │  emoji → inline SVGs                               │ │
│  │  aria-live regions added                           │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─ app.config.ts ──────────────────────────────────────┐ │
│  │  provideRouter(...)  provideHttpClient(...)          │ │
│  │  NEW: provideAnimations()  (route transitions)       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─ ThemeService ────────────────────────────────────────┐ │
│  │  isDark: signal<boolean> (readonly)                   │ │
│  │  toggle(): void                                       │ │
│  │  constructor reads matchMedia + localStorage          │ │
│  │  syncs .dark class on <html>                          │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  Header component                                        │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  NEW: theme-toggle button (moon/sun SVG icons)      │ │
│  │  Glass background: color-mix(...) instead of hard-  │ │
│  │  coded rgba(255,255,255,0.85)                       │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Theme Service State Diagram (UX Flows F1, F2)

```
                    ┌──────────────┐
                    │  App boot    │
                    └──────┬───────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │  ThemeService.ctor()    │
              │                        │
              │  1. Read localStorage  │
              │     key='aurora-theme' │
              │                        │
              │  2. If 'system' (or    │
              │     absent): read      │
              │     matchMedia('prefers│
              │     -color-scheme:     │
              │     dark')             │
              │                        │
              │  3. Set isDark signal  │
              │  4. Add change listener│
              │     on matchMedia      │
              │  5. syncClass() →      │
              │     toggle .dark on    │
              │     <html>             │
              └──────────┬──────────────┘
                         │
              ┌──────────▼──────────┐
              │  isDark() === true  │◄────── @media (prefers-color-scheme: dark)
              │  ? :root.dark added  │        + :root.dark both apply same tokens
              │  : no .dark class    │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │  Header: toggle btn │
              │  shows moon/sun SVG │
              │  based on isDark()  │
              │                     │
              │  User clicks ───────┤────── UX Flow F2
              │  toggle() fires     │
              │  isDark.update(!v)   │
              │  syncClass()        │
              │  localStorage.set() │
              └─────────────────────┘
```

---

## 3. Data Model

**No changes required.** All existing API types in `src/app/data/models.ts` (Product, Category, CartItem, Cart, Order, FlashSale, Testimonial, Brand, NewsletterResponse, InventoryItem) remain unchanged. The redesign is exclusively a presentation-layer concern — no new backend contracts, no model extensions, no API payload changes.

The `ThemeService` introduced in Phase 2 is a purely client-side service with no HTTP dependencies and no persisted model — its state lives in an Angular signal and `localStorage`.

---

## 4. Contracts

### 4.1 ThemeService API (new file: `src/app/data/theme.service.ts`)

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Readonly signal: true when dark mode is active */
  readonly isDark: Signal<boolean>;

  /** Toggle between dark and light. Persists choice to localStorage. */
  toggle(): void;

  /**
   * Constructor behaviour:
   * 1. Read localStorage key 'aurora-theme' — values: 'dark', 'light', 'system'
   * 2. If 'system' or absent → read window.matchMedia('(prefers-color-scheme: dark)')
   * 3. Set isDark signal
   * 4. Listen for OS preference changes via matchMedia change listener
   * 5. Call syncClass() to toggle .dark on document.documentElement
   * 6. On toggle(): update signal, sync class, persist to localStorage
   */
}
```

### 4.2 No external API contract changes

No HTTP endpoints, no request/response shape, no route parameters, no query strings are affected. The mock backend interceptor (`src/app/mock/mock-backend.interceptor.ts`) is not touched.

### 4.3 CSS custom property contract

The following token categories are added to `:root` in `src/styles.css` and must never be referenced as raw values in component styles:

| Category | Tokens | Scope |
|---|---|---|
| Dark-mode colour | `--bg`, `--surface`, `--surface-2`, `--surface-3`, `--ink`, `--ink-2`, `--ink-3`, `--line`, `--line-strong`, `--accent`, `--accent-strong`, `--accent-soft`, `--on-accent`, `--success`, `--success-soft`, `--warn`, `--warn-soft`, `--danger`, `--danger-soft`, `--sale`, `--shadow-xs`–`--shadow-lg`, `--skeleton-bg`, `--skeleton-shine` | `@media (prefers-color-scheme: dark) { :root }` and `:root.dark` |
| Type scale | `--text-xs` (11px), `--text-sm` (12.5px), `--text-base` (16px), `--text-md` (18px), `--text-lg` (21px), `--text-xl` (26px), `--text-2xl` (34px), `--text-3xl` (44px), `--text-4xl` (56px) | `:root` (both modes) |
| Spacing scale | `--space-1` (4px) through `--space-24` (96px) at steps: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 72, 96 | `:root` (both modes) |
| Grid utilities | `.grid-4`, `.grid-3`, `.grid-2`, `.grid-auto` with responsive breakpoints at 980px and 720px | `src/styles.css` (both modes) |

---

## 5. Affected Files

### 5.1 New files

| File | Phase | Purpose | Pattern to follow |
|---|---|---|---|
| `src/app/data/theme.service.ts` | 2 | Signal-based theme toggle with OS preference detection and localStorage persistence. `isDark` readonly signal, `toggle()` method, constructor reads `matchMedia` + `localStorage`. | `CartService` at `src/app/data/cart.service.ts:13-74` — same `providedIn: 'root'`, signal-based pattern. |

### 5.2 Modified files

| File | Phase | Change summary | Pattern to follow (file:line citation) |
|---|---|---|---|
| `src/styles.css` | 1–4 | Add dark-mode `@media` block (`:root` token overrides), type-scale tokens, spacing-scale tokens, grid utility classes (`.grid-4/3/2/auto` with 980px/720px breakpoints), `.btn-loading` spinner, `.btn-invert` class (`.btn-dark` kept as deprecated alias), `--skeleton-bg`/`--skeleton-shine` tokens, skeleton dark-mode overrides, Inter `@import` with `display=swap` at top | Existing `:root` token pattern at `styles.css:8-63`; existing button variant pattern at `styles.css:210-236` (`.btn-outline`, `.btn-ghost`, `.btn-dark`); existing skeleton pattern at `styles.css:347-370`; existing reduced-motion rule at `styles.css:372-377` |
| `src/app/app.config.ts` | 3 | Add `provideAnimations()` to providers array | Existing provider pattern at `app.config.ts:15-22` — add alongside `provideRouter` and `provideHttpClient` |
| `src/app/layout/header.component.ts` | 2–3 | Replace glass background `rgba(255,255,255,0.85)` (line 76) with `color-mix(in srgb, var(--surface) 80%, transparent)` + fallback; replace `backdrop-filter: saturate(1.4) blur(12px)` (line 77) with `blur(16px)`; add theme toggle button (moon/sun SVG icons, inject ThemeService, wire to `theme.toggle()`, aria-label dynamic per mode) | Inline SVG pattern at `header.component.ts:34-41` (search icon) and `53-61` (cart icon); cart badge pattern at `176-191` for button positioning |
| `src/app/layout/footer.component.ts` | 3 | Add `box-shadow: 0 -1px 0 rgba(255,255,255,0.05)` on dark mode for top-divider glow | Existing `var(--surface)` background at `footer.component.ts:78`; social link hover using `var(--accent)` — already token-driven |
| `src/app/shared/product-card.component.ts` | 2–3 | Replace image placeholder gradient `linear-gradient(135deg, #efeee9, #e3e2dc)` (line 165) with `var(--surface-2)`; replace wish-btn background `rgba(255,255,255,0.85)` (line 193) with token-based fallback; replace qv-btn background `rgba(255,255,255,0.92)` (line 215) with `var(--surface)`; update body padding `16px 16px 18px` → `20px` (line 241); update `.name` font-size `15px` → `16px` (line 251); update `.price` font-size `18px` → `20px` (line 272); update `.cat` font-size `11.5px` → `var(--text-xs)` (line 244); update body gap `8px` → `10px` (line 240); add `border-color: var(--accent-soft)` to hover state (line 136) | Existing token references: `var(--surface)` at line 128, `var(--line)` at line 129, `var(--ink-3)` at line 248; hover transform pattern at line 136 |
| `src/app/shared/star-rating.component.ts` | 2 | Replace `.track` color `#dcdbd4` (line 37) with `var(--line)` | Existing `.fill` color `#f5a623` at line 44 (could also be tokenised to `--warn` in a follow-up, but spec defines only the track as blocking) |
| `src/app/sections/hero-section.component.ts` | 2–3 | Replace hero background gradient `#eef0ff` (line 50) with dark-adapted equivalent using `--accent-soft`; replace blob colours `#c7ccff`/`#8b93f5` (lines 101,108) and `#ffe0c2`/`#ffb27a` with dark-adapted values; replace glass panel background `rgba(255,255,255,0.55)` (line 120) with token-based | Existing `var(--surface)` reference at line 50; existing `var(--ink)` references throughout |
| `src/app/sections/featured-section.component.ts` | 2–4 | Replace inline grid declaration `grid-template-columns: repeat(4, 1fr); gap: 20px` (lines 60-63) with `.grid-4` class; remove inline breakpoint rules at lines 80-95; replace `&mdash;` (line 43) with regular hyphen | Existing class-binding pattern at `home.component.ts:45-49` (sections bind events upward); other sections' grid patterns are identical |
| `src/app/sections/best-sellers-section.component.ts` | 2–4 | Same as featured-section: replace inline grid with `.grid-4` (lines 59-63); remove inline breakpoints; replace `&mdash;` (line 43) with hyphen | Same as featured-section — identical grid pattern |
| `src/app/sections/flash-sale-section.component.ts` | 2–3 | Replace flash-wrap gradient `linear-gradient(180deg, var(--danger-soft) 0%, var(--surface) 40%)` (line 88) with dark-adapted `rgba(251,113,133,0.08) 0%, var(--surface) 45%`; replace inline grid (lines 125-129) with `.grid-4` | Existing gradient at line 88; existing grid pattern matches featured/best-sellers |
| `src/app/sections/recommendations-section.component.ts` | 4 | Replace inline grid with `.grid-4` class; standardise breakpoints to 980px/720px | Grid pattern at `recommendations-section.component.ts` (inline grid-4 with 20px gap, breakpoints 980px/560px) — unify with spec Section 6.4 |
| `src/app/sections/categories-section.component.ts` | 4 | Replace inline grid `gap: 14px` (line 65) with `--space-3` (12px) or `--space-4` (16px); use `.grid-auto` or explicit grid class; standardise breakpoints to 980px/720px | Grid declarations at `categories-section.component.ts:62-65` — 5-col→3-col→2-col pattern |
| `src/app/sections/testimonials-section.component.ts` | 3 | Update card padding `20px` → `24px` (line 100); update gap `12px` → `16px` (line 103); update quote font-size `15px` → `var(--text-base)` (line 130); replace avatar placeholder gradient `linear-gradient(135deg, #efeee9, #e3e2dc)` (line 127) with `var(--surface-2)`; use grid utility classes; standardise breakpoints | Existing card structure at lines 99-130; avatar fallback pattern matches product-card at `product-card.component.ts:165` |
| `src/app/sections/brand-section.component.ts` | 2 | Replace brand avatar placeholder gradient `linear-gradient(135deg, #efeee9, #e3e2dc)` (line 101) with `var(--surface-2)` | Same fix pattern as product-card and testimonials placeholder gradients |
| `src/app/sections/search-section.component.ts` | 2 | Replace focus shadow `rgba(99, 102, 241, 0.15)` (line 75) with `var(--accent-soft)` | Existing form-control focus pattern at `styles.css:329-330` |
| `src/app/sections/newsletter-section.component.ts` | 2 | No token changes needed — already uses `var(--accent-soft)` background (line 88). Verify dark-mode contrast for subscribe button | Already token-driven — minimal change |
| `src/app/pages/product-list.component.ts` | 2–4 | Replace empty-state emoji `🔍` (line 81) with inline SVG search icon; standardise grid breakpoints (line 163-166) from 4→3→2 at 980px/720px to match unified scheme; replace `&mdash;` (line 43) with hyphen | HeaderComponent search SVG at `header.component.ts:34-41` as reference for inline SVG pattern |
| `src/app/pages/cart.component.ts` | 2–3 | Replace empty-state emoji `🛍️` (line 41) with inline SVG shopping-bag icon; replace progress-bar background `#e3e2dc` (line 278) with `var(--line)`; replace thumb placeholder gradient (line 178) with `var(--surface-2)` | HeaderComponent cart SVG at `header.component.ts:53-61` for icon pattern; product-card placeholder fix for gradient |
| `src/app/pages/product-detail.component.ts` | 2–3 | Replace empty-state emoji `🧭` (line 177) with inline SVG icon; replace image placeholder gradient (line 229) with `var(--surface-2)`; add `aria-live="polite"` / `role="status"` to order status div (line 131) | Existing `role="alert"` pattern at `newsletter-section.component.ts:72` for ARIA reference; placeholder fix same as product-card |
| `package.json` | 3 | Add `@angular/animations` dependency (`npm install @angular/animations`) | Existing dependency pattern at `package.json:16-26` |

### 5.3 Files intentionally NOT modified

| File | Rationale |
|---|---|
| `src/app/data/models.ts` | No model changes needed — existing Product, CartItem, Cart, etc. types are sufficient |
| `src/app/data/cart.service.ts` | No business logic changes — signal-based state untouched |
| `src/app/data/catalog.service.ts` | No business logic changes |
| `src/app/data/order.service.ts` | No business logic changes |
| `src/app/data/wishlist.service.ts` | No business logic changes |
| `src/app/app.routes.ts` | No routing changes — route paths, lazy-loading, and titles preserved |
| `src/app/mock/mock-backend.interceptor.ts` | No API contract changes |
| `src/environments/*` | No environment changes |
| `src/app/app.component.ts` | No structural template changes — skip-link preserved |
| `src/app/pages/home.component.ts` | No composition changes — all 10 sections remain in DOM order, event wiring preserved |

---

## 6. Test Strategy

### 6.1 Unit Tests (Jest) — New tests

| Test Target | What to test | Pattern to follow |
|---|---|---|
| `ThemeService` | **Initial state:** When `matchMedia` reports dark, `isDark()` returns `true`. When `matchMedia` reports light, `isDark()` returns `false`. | `src/app/sections/featured-section.util.spec.ts` — utility-function Jest tests with mock data, no DOM. Use `jest.spyOn(window, 'matchMedia')` to mock the media query. |
| `ThemeService` | **toggle():** After `toggle()`, `isDark()` flips. After a second `toggle()`, it flips back. Verify `.dark` class is present/absent on `document.documentElement`. | Same utility-test pattern. Test pure signal behaviour without DOM rendering. |
| `ThemeService` | **localStorage persistence:** After `toggle()`, `localStorage.getItem('aurora-theme')` equals `'dark'` or `'light'`. On re-instantiation, the stored value is respected over `matchMedia`. | Use `jest.spyOn(Storage.prototype, 'getItem')` / `setItem` to mock localStorage. |
| `ThemeService` | **OS preference change listener:** When `matchMedia` fires a change event, `isDark()` updates accordingly (only when no manual override is stored). | Spy on `addEventListener` + mock the change callback. |

### 6.2 Visual Regression Tests (Playwright) — Updated

| Test | Change | Rationale |
|---|---|---|
| `e2e-visual/redesign.screenshot.spec.ts` | Regenerate all baseline screenshots. Add dark-mode captures for each route by: (a) setting `page.emulateMedia({ colorScheme: 'dark' })` before navigation, or (b) clicking the theme-toggle button and waiting for the `.dark` class to apply. | Breakpoint change (560px → 720px), new colour tokens, typography updates, and card padding changes invalidate **all** existing light-mode baselines. Dark-mode captures are new. |
| New: dark-mode desktop/mobile captures | Add `{ colorScheme: 'dark' }` variants for home, products, product-detail, and cart at both viewports (1280×800, 390×844). | UX flow F1 requires dark-mode visual verification for all key pages. |
| New: theme-toggle capture | Capture header before/after toggle click, verifying moon/sun icon swap and `.dark` class application. | UX flow F2 — manual toggle must be visually verified. |

### 6.3 E2E Tests (Playwright) — Potential updates

| Test file | Risk | Action |
|---|---|---|
| `e2e/footer-accessibility.spec.ts` | Low — footer uses token-based colors, no structural changes. | Run existing tests to confirm no regression. |
| Any test using `btn-dark` class selector | Low — `btn-dark` is preserved as deprecated alias with identical rendering. | No selector change needed. Document in the test that `btn-dark` is an alias for `btn-invert`. |

### 6.4 Baseline Regeneration Protocol

Per spec Decision #18 (file:line resolved at `spec.md:795`):

1. Run `npm run test:visual` with `VISUAL_OUT` pointing to a fresh directory.
2. Review each screenshot for correctness in both light and dark mode.
3. Once approved, copy screenshots to `e2e-visual/baselines/` (or the configured baseline directory).
4. Commit new baselines alongside implementation code.
5. Future CI runs compare against these new baselines.

---

## 7. Risks & Rollback

### 7.1 Risk Register

| # | Risk | Likelihood | Impact | Mitigation | Phase |
|---|---|---|---|---|---|
| R1 | **Visual baseline invalidation** — all existing Playwright screenshot baselines become stale | Certain (5/5) | Medium — requires manual re-review of every captured page | Flagged in spec Decision #18; explicitly included in testing phase. Regeneration is part of this task's definition of done. | 2 |
| R2 | **Flash-of-wrong-theme (FOWT)** — user sees light mode briefly before `.dark` class applies | Moderate (3/5) | Medium — jarring UX on slow devices | `ThemeService` constructor runs synchronously (no `APP_INITIALIZER` needed); `document.documentElement.classList.toggle('dark', ...)` fires before the first render completes. The `@media` block in CSS also applies immediately for OS-follow users. | 2 |
| R3 | **`btn-dark` backward compatibility** — existing E2E selectors or component references break | Low (2/5) | Low — preserved as deprecated alias | Both `btn-dark` and `btn-invert` reference the same `--btn-bg`/`--btn-fg` tokens. Add a deprecation comment. No selector changes needed. | 2 |
| R4 | **`color-mix()` browser support** — fallback required for older browsers (Chromium <111, Firefox <113, Safari <16.2) | Low (1/5) | Low — glass backgrounds fall back to solid `var(--surface)` | Provide fallback: `background: var(--surface);` before `background: color-mix(...)`. The CSS cascade ensures unsupported browsers use the fallback. | 2 |
| R5 | **Inter font FOIT** — swap mechanism not honoured by all browsers | Low (1/5) | Low — minor flash of system font | Use `font-display: swap` in the Google Fonts `@import` URL. Add a `preconnect` hint in `index.html`: `<link rel="preconnect" href="https://fonts.googleapis.com">`. | 1 |
| R6 | **`@angular/animations` bundle size increase** — ~15KB additional payload | Low (1/5) | Very low | Acceptable for the perceived-quality improvement. Lazy-loaded pages (all routes) are not affected — the animation payload loads with the main bundle. | 3 |
| R7 | **Breakpoint change from 560px to 720px causes layout shift on mid-size tablets** | Moderate (3/5) | Medium — some 600–700px devices see single-column grids earlier than before | The spec intentionally unifies on 720px as the mobile breakpoint (per `spec.md` Section 6.4). This matches the header's existing nav-hiding breakpoint at `header.component.ts:192`. The change is deliberate and improves consistency. | 4 |

### 7.2 Rollback plan

Each phase is independently revertible:

1. **Phase 1 (tokens):** Remove the added `@media` block, type-scale tokens, spacing-scale tokens, and grid utility classes from `src/styles.css`. Zero visual impact on light-mode output.
2. **Phase 2 (dark-mode activation):** Delete `theme.service.ts`, revert hardcoded-color replacements in all 14 component files, remove theme-toggle button from header. Restores light-mode-only behaviour completely.
3. **Phase 3 (animations, polish):** Remove `provideAnimations()` from `app.config.ts`, remove `@angular/animations` from `package.json`, revert staggered entrance CSS, revert card and testimonial padding/sizing changes.
4. **Phase 4 (layout cleanup):** Restore inline grid declarations, revert to 560px breakpoint, restore emoji, remove `aria-live` additions.

**Rollback priority order:** Phase 2 rollback is highest priority (dark-mode activation is the core feature). Phase 4 can be deferred indefinitely without blocking the launch.

### 7.3 Safe-deployment checklist

- [ ] Phase 1 deploys with zero visual regression — run `npm run test:visual` and confirm all existing baselines pass.
- [ ] Phase 2 adds `page.emulateMedia({ colorScheme: 'dark' })` tests — both modes must pass independently.
- [ ] Before Phase 3: confirm `@angular/animations` builds successfully with `ng build --configuration production`.
- [ ] Before Phase 4: confirm breakpoint changes do not cause layout regressions on real devices at 600px, 768px, 1024px widths.
- [ ] Every commit must pass `npm run test:ci` (Jest) and `npm run lint` before merge.
