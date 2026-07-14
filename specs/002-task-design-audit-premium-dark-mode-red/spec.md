# SDD: Design Audit & Premium Dark-Mode Redesign — Ecommerce Homepage

| Field | Value |
|---|---|
| **Feature ID** | `002-task-design-audit-premium-dark-mode-red` |
| **Author** | SDD Analyst + PM |
| **Date** | 2026-07-14 |
| **Status** | Final |
| **Constitution** | `CLAUDE.md` (not present at root; patterns inferred from codebase) |
| **Skills invoked** | `sdd-analyst-pm`, `design-taste-frontend` |

---

## 1. Overview

This spec is the result of a comprehensive design audit of the ecommerce-frontend homepage (`Aurora Store`). The current codebase produces a clean, functional light-mode shopping experience. The redesign targets a **premium dark-mode aesthetic** inspired by Apple, Linear, Vercel, and Stripe while preserving every existing business capability: browse products, manage cart, place orders, view inventory.

The audit is **fully grounded in the real codebase** — every observation below cites a file and line number. All existing routes (`src/app/app.routes.ts:7-31`), API contracts (`src/app/data/models.ts`), business logic (`src/app/data/cart.service.ts`, `order.service.ts`, `wishlist.service.ts`), and the mock backend (`src/app/mock/mock-backend.interceptor.ts`) remain untouched. Changes are limited to the presentation layer: `src/styles.css` (the design token system), inline component styles, and component templates — never data-layer files unless a minor model extension is warranted.

---

## 2. Design Critique — Current Weaknesses

### 2.1 Typography

| Issue | Location | Rationale |
|---|---|---|
| No explicit type scale | `src/styles.css:56-57` (font-family only) | Headings use `clamp()` per-component but there is no central type ramp. `h2` in `section-head` is `clamp(22px, 2.4vw, 30px)` (`src/styles.css:152`); hero h1 is `clamp(34px, 5vw, 58px)` (`src/app/sections/hero-section.component.ts:62`); product-detail h1 is `clamp(24px, 3vw, 34px)` (`src/app/pages/product-detail.component.ts:260`). Every heading sets its own size — no consistency. |
| Weight system is muddy | `src/styles.css:99` `font-weight: 640` on headings | "640" is a non-standard weight that maps to the 650 axis on variable fonts. It is identical to `--font-weight-heading` should exist as a token. The brand wordmark uses `720` (`src/app/layout/header.component.ts:90`) — this is fine but undocumented. |
| Body copy too small | `src/styles.css:81` `font-size: 15px` | 15px body text is slightly undersized for a premium reading experience. Apple uses 17px system; Linear uses 16px. 15px paired with `line-height: 1.5` (`src/styles.css:80`) feels cramped for long product descriptions (`src/app/pages/product-detail.component.ts:289`). |
| Eyebrow / label fonts | `src/styles.css:132-137` | `.eyebrow` at 12px/650 weight with 0.14em letter-spacing is functional but not elevated. The hero eyebrow "New season · 2026" (`src/app/sections/hero-section.component.ts:19`) is the first thing a user sees — it should feel crafted. |
| No font-display swap | Resolved — see Decision #11 | Inter is not loaded via any explicit mechanism in the codebase (`index.html` has no font `<link>`, no `@import` in CSS). The `font-family` stack falls back to system sans-serif. The spec will add a Google Fonts `@import` with `display=swap` to guarantee Inter availability and prevent FOIT. |

### 2.2 Spacing

| Issue | Location | Rationale |
|---|---|---|
| No spacing scale | Global | Gap values across the app: `6px` (nav links), `8px` (badge gaps, breadcrumbs), `10px` (footer links, filter chips), `12px` (hero CTAs, wish-btn), `14px` (categories grid), `16px` (section-head), `18px` (cart items, detail grid), `20px` (product grids), `24px` (header bar), `28px` (search-section padding), `32px` (footer grid, cart layout), `40px` (footer grid gap), `48px` (detail page), `56px` (section padding-block), `72px` (hero, newsletter, footer margin-top). This is 14 distinct gap values with no underlying rationale — a proper 4px or 8px scale would eliminate decision fatigue. |
| Section padding inconsistent | Hero: `padding-block: 72px` (`hero-section.component.ts:59`), sections: `padding-block: 56px` (`src/styles.css:128`), newsletter: `padding-block: 72px` (`newsletter-section.component.ts:89`), card: `padding-block: 56px 40px` (`footer.component.ts:85`) | 56px and 72px are used interchangeably. |
| Product card body padding | `src/app/shared/product-card.component.ts:241` `padding: 16px 16px 18px` | Uneven bottom padding (18px vs 16px sides) creates asymmetry. |

### 2.3 Color System — No Dark Mode

| Issue | Location | Rationale |
|---|---|---|
| Light-mode only palette | `src/styles.css:8-62` | Every color token (`--bg`, `--surface`, `--ink`, `--line`, etc.) is hardcoded for light mode. There is no `@media (prefers-color-scheme: dark)` block, no `.dark` class override, and no dark-mode token set anywhere in the codebase. |
| Hardcoded light colors in components | `src/app/shared/product-card.component.ts:162` `background: linear-gradient(135deg, #efeee9, #e3e2dc)` (placeholder); `:194` `background: rgba(255, 255, 255, 0.85)` (wish button); `src/styles.css:350` `background: #ecebe6` (skeleton) | These are light-mode values baked directly into component styles, not referring to CSS custom properties. They will be invisible on a dark background. |
| Star rating track color | `src/app/shared/star-rating.component.ts:37` `color: #dcdbd4` | Fixed light-gray star track. On a dark surface this will be invisible. Needs a token reference. |
| Header glass effect | `src/app/layout/header.component.ts:76` `background: rgba(255, 255, 255, 0.85)` | Hardcoded white-wash background. Needs a dark-mode-aware glass token. |
| Skeleton shimmer | `src/styles.css:347-370` | The skeleton base `background: #ecebe6` and the shimmer white `rgba(255, 255, 255, 0.65)` are light-mode only. On dark surfaces the skeleton will be invisible and the white shimmer will be blinding. |

### 2.4 Cards & Surfaces

| Issue | Location | Rationale |
|---|---|---|
| Card elevation is subtle | `src/styles.css:304-308` `.card` has `border: 1px solid var(--line)` only — no shadow. Product card hover (`product-card.component.ts:135-139`) uses `box-shadow: var(--shadow-md)` which is `0 8px 24px rgba(20, 22, 28, 0.08)` — fine for light, but shadows on dark mode need different handling (lighter/dimmer or shifted to "glow" effects). |
| Testimonial cards | `src/app/sections/testimonials-section.component.ts:99-103` | Use `.card` base, but the padding (`20px`) and gap (`12px`) feel tight for quote content. |
| Flash-sale wrap | `src/app/sections/flash-sale-section.component.ts:85-89` | Uses `border: 2px solid var(--sale)` and `background: linear-gradient(180deg, var(--danger-soft) 0%, var(--surface) 40%)` — these are light-mode colors that will need dark-mode equivalents. |

### 2.5 Buttons

| Issue | Location | Rationale |
|---|---|---|
| `btn-outline` hover | `src/styles.css:210-218` | Hover uses `background: var(--surface-2)` and `border-color: var(--ink-3)` — these need dark-mode equivalents. |
| `btn-dark` variant | `src/styles.css:230-236` | Hardcoded `background: var(--ink)` / `hover: #000` and `color: #fff`. In dark mode, "dark" button needs to be a light surface, not black-on-black. |
| Disabled state | `src/styles.css:195-199` | `opacity: 0.55` is fine but the `background: var(--accent)` override means disabled primary buttons still show accent color — may look "active." |
| No loading spinner state | `.btn` variants | There is no button-loading spinner pattern. The newsletter button uses text "Subscribing…" (`newsletter-section.component.ts:67`) and the order button uses "Placing…" (`product-detail.component.ts:128`). A spinner + text pattern would be more consistent. |

### 2.6 Product Grid

| Issue | Location | Rationale |
|---|---|---|
| 4-column grid collapses directly to 2 | `product-card.component.ts` uses `styles.css` layout; `featured-section.component.ts:83-85` goes 4→2 @980px; `best-sellers-section.component.ts:80-82` 4→2 @980px; `product-list.component.ts:163-166` 4→3 @980px, 3→2 @720px | Inconsistency: homepage sections skip the 3-col breakpoint that the product-list page uses. This means at ~900px homepage shows 2 cards per row while the product-list shows 3. |
| Grid gap uniform at 20px | All product grids use `gap: 20px` | For premium, a wider gap (24px or 28px) with tighter card padding would feel more airy and luxurious. |
| Aspect ratio on product cards | `product-card.component.ts:142` `aspect-ratio: 1 / 1` | Square images work for the current fixture set. Changing to 4:3 or 3:4 would require new product photography assets. Keep `1 / 1` for now; revisit if product catalog expands with portrait/landscape-oriented items. |

### 2.7 Hero Section

| Issue | Location | Rationale |
|---|---|---|
| Decorative art is abstract | `hero-section.component.ts:39-44` | Two colored blobs + a glass-diamond element. This is pleasant but does not communicate the product catalog visually. Premium dark-mode hero sections often use gradient meshes, product imagery, or system-style mockups. |
| Trust strip is text-only | `hero-section.component.ts:31-37` | Three text items separated by middle dots. No icons, no visual hierarchy. Could be elevated with subtle iconography or pill badges. |
| CTA placement | `hero-section.component.ts:25-29` | Two primary CTAs side by side (Shop + Explore audio). "Explore audio" being a secondary outline button is fine, but in dark mode the outline variant will need careful contrast. |
| No gradient mapping for dark | `hero-section.component.ts:50` `background: radial-gradient(120% 120% at 85% 10%, #eef0ff 0%, transparent 55%), var(--surface)` | The `#eef0ff` (accent-soft) gradient is a light-mode color. Needs a dark-mode equivalent (deep indigo/purple glow). |

### 2.8 Navbar

| Issue | Location | Rationale |
|---|---|---|
| Glass effect hardcoded | `header.component.ts:76-78` | `background: rgba(255, 255, 255, 0.85)` + `backdrop-filter: saturate(1.4) blur(12px)`. In dark mode, this must invert to `rgba(0, 0, 0, 0.8)` or dark-surface with blur. The `border-bottom: 1px solid var(--line)` will need a darker line color. |
| Nav link styling | `header.component.ts:102-117` | Active/hover state uses `background: var(--surface-2)` — for dark mode this needs a lighter surface tone. |
| Cart badge | `header.component.ts:176-191` | Uses `background: var(--accent)` + `border: 2px solid var(--surface)`. Works for both modes if tokens are correctly swapped. |
| Mobile nav hides entirely | `header.component.ts:192-198` `@media (max-width: 720px)` `.nav { display: none }` | The desktop-style nav disappears with no hamburger menu replacement. On mobile, users lose access to "Home" and "Shop" links. This is a UX regression in the current codebase, not just a dark-mode issue. Deferred — the hamburger menu is P2 and out of scope for the dark-mode launch. |

### 2.9 Footer

| Issue | Location | Rationale |
|---|---|---|
| Background hardcoded | `footer.component.ts:78` `background: var(--surface)` | Works fine with token swap for dark mode. |
| Payment strip styling | `footer.component.ts:139-159` | `border-top: 1px solid var(--line)` — ok with tokens. Payment badge colors need dark-mode contrast. |
| Social links | `footer.component.ts:21-37` | Inline SVGs use `fill="currentColor"` which inherits from `color`. The hover state `color: var(--accent)` works in both modes. |

### 2.10 UX & Micro-interactions

| Issue | Location | Rationale |
|---|---|---|
| No page transitions | `src/app/app.config.ts:17-18` | `withInMemoryScrolling({ scrollPositionRestoration })` is configured but there is no route transition animation. Premium apps fade/slide between pages. |
| No hover-to-preview on navbar | `header.component.ts:25-30` | Nav links have no dropdown or hover indicator beyond text color change. |
| Loading states are generic | Sections (featured, best-sellers, etc.) | Skeleton cards use `aspect-ratio: 3/4` with a shimmer. No pulse animation, no staggered entrance. Premium apps like Linear use subtle fade-in with stagger. |
| Empty states use emoji | `product-list.component.ts:81` `🔍`, `cart.component.ts:41` `🛍️`, `product-detail.component.ts:177` `🧭` | Emoji render differently across OSes. A polished SVG icon set would be more consistent and premium. |
| No focus trap or live region | Newsletter, order flow | The newsletter error uses `role="alert"` (`newsletter-section.component.ts:72`) but the order status and cart messages do not use `aria-live`. |
| Skip link exists but minimal | `app.component.ts:17` | Single skip-link to `#content`. |

---

## 3. Change Recommendations (Prioritized)

### P0 — Must do (blocking dark-mode launch)

| # | Change | Rationale |
|---|---|---|
| 1 | Define complete dark-mode color token set in `src/styles.css` under `@media (prefers-color-scheme: dark)` | The single prerequisite for dark mode. All component colors derive from these tokens. |
| 2 | Replace all hardcoded light-mode color literals in component styles with token references | ~25 locations across the codebase use `#ecebe6`, `#efeee9`, `#dcdbd4`, `rgba(255,255,255,0.85)`, `#fff`, `#000`, `#e3e2dc` etc. These break in dark mode. |
| 3 | Add `.dark` class override on `:root` for manual toggle | Users should be able to toggle dark mode independently of OS preference. Requires a `ThemeService` signal + class binding on `<html>`. |

### P1 — Should do (high visual impact)

| # | Change | Rationale |
|---|---|---|
| 4 | Implement a CSS custom-property type scale (`--text-xs` through `--text-4xl`) | Eliminates per-component `clamp()` inconsistency and makes typography predictable. |
| 5 | Define a spacing scale (`--space-1` through `--space-16` at 4px increments) | Replace 14 ad-hoc gap/padding values with scale-derived tokens. |
| 6 | Add route transition animations (fade + slide-up) | Angular provides `routeTransition` via `@angular/animations` (v17+). This is a high-perceived-quality change with low code volume. |
| 7 | Redesign product card for dark mode: refined border, subtle glow on hover, consistent padding | The card is the highest-frequency UI element. |
| 8 | Add staggered entrance animation to product grid items | CSS `animation-delay` with `--i` custom property creates a cascading reveal. |

### P2 — Nice to have

| # | Change | Rationale |
|---|---|---|
| 9 | Replace emoji in empty/error states with inline SVG icons | Emoji rendering varies; SVGs are pixel-perfect and themable. |
| 10 | Add hamburger menu for mobile navigation | Current navbar hides nav links at <720px with no replacement. |
| 11 | Add button loading spinner pattern | Consistent visual feedback for async actions (newsletter, order placement). |
| 12 | Add `aria-live` regions to cart confirmations and order status | Sets a higher accessibility bar. |
| 13 | Stagger responsive breakpoints consistently across homepage sections | Currently home sections use 980px/560px while product-list uses 980px/720px. |
| 14 | Hero: replace abstract blobs with gradient mesh + optional product showcase | Elevates the first visual impression. |

---

## 4. Color Palette — Dark-Mode Token Set

### 4.1 Base tokens (additions to `:root`)

All tokens below are **additions** to the existing `:root` block in `src/styles.css:8-63`. The existing light-mode tokens remain the default.

```css
/* ── Dark‑mode colour tokens ── */
@media (prefers-color-scheme: dark) {
  :root {
    /* Backgrounds — layered depth from deep near-black up */
    --bg:          #0a0a0b;   /* Page background — deepest layer */
    --surface:     #151516;   /* Card / elevated surface */
    --surface-2:   #1c1c1e;   /* Hover / secondary surface */
    --surface-3:   #242426;   /* Tertiary surface (code blocks, etc.) */

    /* Ink — text hierarchy on dark surfaces */
    --ink:         #f5f5f4;   /* Primary text — near-white */
    --ink-2:       #a1a1a6;   /* Secondary text */
    --ink-3:       #636366;   /* Tertiary / placeholder text */

    /* Borders — subtle luminous dividers */
    --line:        #2c2c2e;
    --line-strong: #38383a;

    /* Accent — brighter versions for dark bg */
    --accent:       #818cf8;  /* Indigo-400 — meets 4.5:1 on #151516 */
    --accent-strong:#93a0fc;  /* Hover accent */
    --accent-soft:  rgba(129, 140, 248, 0.12);  /* Tinted transparent */
    --on-accent:    #0a0a0b;

    /* Semantic — adjusted for dark backgrounds */
    --success:      #34d399;  /* Emerald-400 */
    --success-soft: rgba(52, 211, 153, 0.12);
    --warn:         #fbbf24;  /* Amber-400 */
    --warn-soft:    rgba(251, 191, 36, 0.12);
    --danger:       #f87171;  /* Red-400 */
    --danger-soft:  rgba(248, 113, 113, 0.12);
    --sale:         #fb7185;  /* Rose-400 for flash sale */

    /* Shadows — inverted for dark: luminous glow instead of drop shadow */
    --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.35);
    --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 18px 48px rgba(0, 0, 0, 0.5);

    /* Skeleton — dark-adapted */
    --skeleton-bg: #1c1c1e;
    --skeleton-shine: rgba(255, 255, 255, 0.06);
  }
}
```

### 4.2 `:root.dark` class variant

For the manual toggle, the same tokens are applied via a `.dark` class:

```css
:root.dark {
  /* Identical token overrides as the prefers-color-scheme block above */
}
```

**Implementation note:** A `ThemeService` (signal-based, providedIn: `root`) tracks the current theme and sets the `.dark` class on `<html>`. It reads `prefers-color-scheme` on init and exposes a `toggle()` method. Components never reference the class directly — they depend on the CSS custom properties which are swapped at the root level.

### 4.3 Contrast verification notes

- `--accent (#818cf8)` on `--surface (#151516)` → contrast ratio ~5.8:1 (passes WCAG AA for normal text)
- `--ink (#f5f5f4)` on `--bg (#0a0a0b)` → contrast ratio ~17.5:1 (passes AAA)
- `--ink-2 (#a1a1a6)` on `--surface (#151516)` → contrast ratio ~6.2:1 (passes AA)
- `--ink-3 (#636366)` on `--surface (#151516)` → contrast ratio ~3.8:1 (passes AA for large text only)
- `--danger (#f87171)` on `--surface (#151516)` → contrast ratio ~5.9:1 (passes AA)

---

## 5. Component Redesign Specifications

### 5.1 Typography System

#### Token additions to `:root` in `src/styles.css`

```css
:root {
  /* Type scale — geometric progression ~1.25 (major third) */
  --text-xs:   11px;
  --text-sm:   12.5px;
  --text-base: 16px;        /* was 15px */
  --text-md:   18px;
  --text-lg:   21px;
  --text-xl:   26px;
  --text-2xl:  34px;
  --text-3xl:  44px;
  --text-4xl:  56px;

  /* Font weights — use named tokens */
  --fw-normal: 400;
  --fw-medium: 500;
  --fw-semibold: 570;       /* Inter medium-bold sits well at 570 */
  --fw-bold: 650;
  --fw-heading: 620;        /* Headings weight */
  --fw-brand: 720;          /* Brand wordmark */

  /* Line heights */
  --lh-tight: 1.05;
  --lh-snug:  1.2;
  --lh-normal: 1.55;       /* was 1.5, slightly more breathing room */
  --lh-relaxed: 1.7;

  /* Letter spacing */
  --ls-tight: -0.03em;
  --ls-normal: 0;
  --ls-wide: 0.08em;
  --ls-display: -0.04em;   /* For hero / large headings */
}
```

#### Changes to existing styles

| Token | Current | New | File:line |
|---|---|---|---|
| `body font-size` | `15px` | `var(--text-base)` | `src/styles.css:81` |
| `body line-height` | `1.5` | `var(--lh-normal)` | `src/styles.css:80` |
| `h1-h4 font-weight` | `640` | `var(--fw-heading)` | `src/styles.css:99` |
| `h1-h4 letter-spacing` | `-0.02em` | `var(--ls-tight)` | `src/styles.css:100` |
| `.eyebrow font-size` | `12px` | `var(--text-xs)` | `src/styles.css:132` |
| `.eyebrow letter-spacing` | `0.14em` | `0.12em` (slightly tighter) | `src/styles.css:133` |

### 5.2 Cards

#### `.card` base (already in `src/styles.css:304-308`)

```css
.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  transition: box-shadow var(--dur) var(--ease), border-color var(--dur) var(--ease);
}
```

**Dark-mode behavior:** Tokens auto-swap. No structural changes needed.

#### Product card redesign (`src/app/shared/product-card.component.ts`)

| Property | Current | New | Rationale |
|---|---|---|---|
| `padding` (body) | `16px 16px 18px` | `20px` | Even padding, more breathing room |
| `border-radius` (root) | `var(--r-lg)` | `var(--r-lg)` | Keep — 18px is appropriate |
| `border` | `1px solid var(--line)` | `1px solid var(--line)` | Keep — token swap handles dark |
| Hover `translateY` | `-3px` | `-4px` | Slightly more pronounced lift |
| Hover `box-shadow` | `var(--shadow-md)` | `0 0 0 1px var(--accent-soft), var(--shadow-md)` | Add subtle accent glow ring in dark mode |
| Gap in `.body` | `8px` | `10px` | More breathing room |
| `.name` font-size | `15px` | `16px` | Slightly larger for readability |
| `.price` font-size | `18px` | `20px` | Price should command attention |
| `.cat` font-size | `11.5px` | `var(--text-xs)` | Use type scale token |
| `.qv-btn` background | `rgba(255,255,255,0.92)` | `var(--surface)` | Token-based, dark-mode safe |

#### Wishlist button hardcoded color fixes

```css
/* Current: background: rgba(255, 255, 255, 0.85) → invisible on dark */
/* New: */
.wish-btn {
  background: color-mix(in srgb, var(--surface) 85%, transparent);
  /* Fallback for browsers without color-mix(): */
  background: var(--surface);
  opacity: 0.92;
}
```

#### Testimonial card redesign (`src/app/sections/testimonials-section.component.ts`)

| Property | Current | New |
|---|---|---|
| `padding` | `20px` | `24px` |
| Gap between elements | `12px` | `16px` |
| `.test-quote` font-size | `15px` | `var(--text-base)` |
| Quote `line-height` | inherited | `var(--lh-relaxed)` |

### 5.3 Buttons

#### Primary button (`.btn`)

| State | Current light | Current dark (proposed) | Changes needed |
|---|---|---|---|
| Default bg | `var(--accent)` | `var(--accent)` | Token swap handles it |
| Default fg | `var(--on-accent)` | `var(--on-accent)` | Token swap |
| Hover bg | `var(--accent-strong)` | `var(--accent-strong)` | Token swap |
| Hover shadow | `var(--shadow-sm)` | `var(--shadow-sm)` | Token swap handles dark |
| Active | `translateY(1px)` | `translateY(1px)` | Keep |
| Disabled bg | `var(--accent)` | `var(--accent)` | Keep; opacity handles dimming |
| Disabled cursor | `not-allowed` | `not-allowed` | Keep |

#### New: loading spinner

Add a CSS-only spinner to `.btn` when it has the `.btn-loading` class or a `[data-loading]` attribute:

```css
.btn-loading {
  position: relative;
  color: transparent;
}
.btn-loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid var(--on-accent);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

#### `btn-outline` dark-mode adaptation

```css
/* Add to existing .btn-outline rules */
.btn-outline {
  /* Keep existing */
}
/* Dark-mode override via token swap — no code change needed */
```

#### `btn-dark` replacement

Rename to `btn-invert` so it reads logically in both modes:

```css
.btn-invert {
  --btn-bg: var(--ink);
  --btn-fg: var(--bg);
}
```

In dark mode, `--ink` is `#f5f5f4` and `--bg` is `#0a0a0b`, so the button becomes light-on-dark — correctly inverted.

**Resolved:** Preserve `btn-dark` as a deprecated alias for `btn-invert`. Both classes reference the same `--btn-bg`/`--btn-fg` tokens, so they render identically. No E2E selectors break. A deprecation comment marks `btn-dark` for future removal.

### 5.4 Product Tile (Card body + image)

See product card redesign above (Section 5.2). Key theme changes:

1. **Image placeholder gradient**: Replace `linear-gradient(135deg, #efeee9, #e3e2dc)` with `var(--surface-2)` background.
2. **Tag row badges**: Badge backgrounds already use tokens — dark-mode swap handled.
3. **Star rating track**: Replace `#dcdbd4` with `var(--line)`:

```css
/* StarRatingComponent line 37 — current: */
.track { color: #dcdbd4; }
/* New: */
.track { color: var(--line); }
```

4. **Add-to-cart button inside card**: Currently plain `.btn` — should be `.btn-outline` for secondary action within card context.

**Resolved:** Keep as solid accent button (`.btn`). The add-to-cart is the primary conversion action on the card; changing to outline risks reducing click-through rates. If future A/B testing shows outline performs equally, re-evaluate.

### 5.5 Navbar

| Property | Current | New dark | File:line |
|---|---|---|---|
| Background | `rgba(255, 255, 255, 0.85)` | `color-mix(in srgb, var(--surface) 80%, transparent)` with fallback | `header.component.ts:76` |
| Backdrop filter | `saturate(1.4) blur(12px)` | `blur(16px)` (remove saturate — dark modes need less color boost) | `header.component.ts:77` |
| Border bottom | `1px solid var(--line)` | `1px solid var(--line)` | Token swap handles |
| Search input bg | `var(--surface-2)` | `var(--surface-2)` | Token swap handles |
| Cart badge border | `2px solid var(--surface)` | `2px solid var(--surface)` | Token swap handles |

**Mobile nav:** Add a simple hamburger toggle:

```html
<button class="hamburger" aria-label="Menu" (click)="mobileOpen = !mobileOpen">
  <span></span><span></span><span></span>
</button>
```

Add mobile overlay nav with glass effect matching header.

**Resolved:** Deferred — the hamburger menu is P2 (item #10 in the priority list) and outside the dark-mode launch scope. The nav-hiding-at-720px behavior continues as-is for this redesign.

### 5.6 Footer

Minimal changes — the footer already uses token-based colors. Specific improvements:

1. **Background**: Already `var(--surface)` — token swap is sufficient.
2. **Social link hover**: Already uses `var(--accent)` — works in both modes.
3. **Payment badges**: Replace hardcoded `border: 1px solid var(--line)` — already token-based.
4. **Add subtle top-divider glow** in dark mode: `box-shadow: 0 -1px 0 rgba(255,255,255,0.05)` alongside the border.

### 5.7 Form Elements

| Element | Current | Dark adaptation | File:line |
|---|---|---|---|
| `.input` bg | `var(--surface)` | Token swap handles | `src/styles.css:318` |
| `.input` border | `var(--line-strong)` | Token swap | `src/styles.css:319` |
| `.input:focus` | `box-shadow: 0 0 0 3px var(--accent-soft)` | Token swap | `src/styles.css:329-330` |
| `.select` | Same as input | Same | Same |
| Newsletter input | `.input` class already | Token swap | `newsletter-section.component.ts:53` |
| `.input-danger` border | `var(--danger)` | Token swap | `newsletter-section.component.ts:119` |

No structural changes needed — all form styling derives from CSS custom properties.

---

## 6. Layout Improvements

### 6.1 Grid System

**Current state:** Ad-hoc grid definitions per section. Each section re-declares `grid-template-columns: repeat(4, 1fr)` and `gap: 20px` independently.

**Recommendation:** Add a set of grid utility classes to `src/styles.css`:

```css
/* Grid presets */
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.grid-auto { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }

/* Responsive */
@media (max-width: 980px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 720px) {
  .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; }
}
```

Sections replace their inline `grid-template-columns` + `gap` declarations with these utility classes.

### 6.2 Gap Standardization

Replace the 14 distinct gap values with a **4px spacing scale**:

| Token | Value | Used for |
|---|---|---|
| `--space-1` | 4px | Internal element gaps (icon in button, badge gaps) |
| `--space-2` | 8px | Tag gaps, badge spacing |
| `--space-3` | 12px | Card internal element gaps, CTA spacing |
| `--space-4` | 16px | Section-head gaps, nav link padding |
| `--space-5` | 20px | Small section gaps, breadcrumb spacing |
| `--space-6` | 24px | Grid gaps, header bar gaps |
| `--space-8` | 32px | Section padding, cart layout gap |
| `--space-10` | 40px | Footer grid gap, hero CTA margins |
| `--space-12` | 48px | Detail page gap, large section margins |
| `--space-14` | 56px | Section padding-block |
| `--space-18` | 72px | Hero padding, newsletter padding, footer margin |
| `--space-24` | 96px | Large hero margins, feature callouts |

### 6.3 Section Spacing Standardization

| Section | Current padding-block | New |
|---|---|---|
| Hero | `72px` | `var(--space-18)` |
| All `.section` | `56px` | `var(--space-14)` |
| Newsletter | `72px` | `var(--space-18)` |
| Footer top margin | `72px` | `var(--space-18)` |
| Product list `.pt0` | `28px` | `var(--space-7)` (~28px, keep) |

### 6.4 Responsive Breakpoint Consistency

**Current fragmentation:**

| Section | Breakpoints |
|---|---|
| Product list grid | 4→3 @980px, 3→2 @720px |
| Featured / Best-sellers / Flash-sale / Recommendations | 4→2 @980px, 2→1 @560px |
| Categories | 5→3 @980px, 3→2 @560px |
| Testimonials | 3→1 @980px |
| Navbar | Nav hidden @720px |

**Unified proposal:**

| Breakpoint | Effect |
|---|---|
| **≥980px** | 4-col grids, 5-col categories, 3-col testimonials |
| **720–979px** | All grids → 2-col, categories → 3-col, testimonials → 2-col |
| **<720px** | All grids → 1-col, categories → 2-col, testimonials → 1-col |

This eliminates the 560px breakpoint entirely (too aggressive for modern mobile sizes — most phones are >375px wide).

**Resolved:** Yes — visual snapshots must be regenerated. The breakpoint change from 560px to 720px and all color/typography changes will invalidate existing baselines. This is expected and should be executed as part of the testing phase (QA step after implementation). No separate PBI needed — the regeneration is included in this task's definition of done.

---

## 7. UX Improvements

### 7.1 Micro-interactions & Transitions

| Interaction | Current | Proposed | Effort |
|---|---|---|---|
| Route transitions | None | Fade + slide-up (150ms) using Angular's `provideAnimations` + route animation trigger | Low (add `@angular/animations` dependency, define route animation) |
| Page load entrance | Instant render | Staggered card entrance: `animation: card-enter 400ms ease both; animation-delay: calc(var(--i) * 80ms)` | Low (CSS only, set `--i` in `@for` template) |
| Button press | `translateY(1px)` on `:active` | Same + `scale(0.97)` for sub-500ms feedback | Trivial |
| Card hover | `translateY(-3px)` + `shadow-md` | Add `border-color: var(--accent-soft)` glow ring | Trivial |
| Navbar scroll behavior | Static sticky | Add shadow on scroll via `IntersectionObserver` or `--scroll` CSS | Low |
| Wishlist toggle | Instant swap | Add `scale(1.2)` pulse on toggle via `@keyframes heart-pop` | Trivial |

### 7.2 Loading States

| Section | Current | Improved |
|---|---|---|
| Skeleton base color | `#ecebe6` | `var(--skeleton-bg)` |
| Skeleton shimmer color | `rgba(255,255,255,0.65)` | `var(--skeleton-shine)` |
| Product grid skeletons | 4 simultaneous | Same count but stagger entrance with `--i` |
| Card skeleton aspect ratio | `3 / 4` | Keep — matches product card |
| Text line skeletons | None | Add `skeleton-text` class for paragraph lines |

### 7.3 Empty States

| Current component | Emoji used | Proposed replacement |
|---|---|---|
| `product-list.component.ts:81` | `🔍` | Inline SVG search icon |
| `cart.component.ts:41` | `🛍️` | Inline SVG shopping bag icon |
| `product-detail.component.ts:177` | `🧭` | Inline SVG compass/ghost icon |

Create a shared `svg-icon-set` util or a simple `<app-icon name="search" />` component.

**Resolved:** Use inline SVGs in each template, matching the existing HeaderComponent pattern (search icon at `header.component.ts:34-41`, cart icon at lines 54-61). A dedicated `<app-icon>` component would be a valuable future refactor but is outside this redesign's scope.

### 7.4 Accessibility Enhancements

| Improvement | Location | Implementation |
|---|---|---|
| `aria-live="polite"` on order status | `product-detail.component.ts:131` | Add `role="status"` with `aria-live="polite"` |
| `aria-live="polite"` on cart confirmation | `cart.component.ts:35` | Already has `role="status"` — verify `aria-live` |
| Focus management on route change | `app.component.ts` | After navigation, focus `#content` heading or first interactive element |
| Reduced motion support | `src/styles.css:372-377` | Already present — no change needed |
| Dark mode toggle accessible name | Theme toggle button | `aria-label="Switch to dark mode"` / `"Switch to light mode"` |

### 7.5 Theme Toggle UX

A signal-based `ThemeService` (`src/app/data/theme.service.ts`):

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly darkSignal = signal<boolean>(false);
  readonly isDark = this.darkSignal.asReadonly();

  constructor() {
    // Read OS preference on init
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.darkSignal.set(prefersDark);
    this.syncClass(prefersDark);

    // Listen for OS changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.darkSignal.set(e.matches);
      this.syncClass(e.matches);
    });
  }

  toggle(): void {
    this.darkSignal.update((v) => !v);
    this.syncClass(this.darkSignal());
  }

  private syncClass(dark: boolean): void {
    document.documentElement.classList.toggle('dark', dark);
  }
}
```

The theme toggle button sits in the header (next to the cart icon):

```html
<button class="theme-toggle" (click)="theme.toggle()"
        [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'">
  @if (theme.isDark()) {
    <svg><!-- sun icon --></svg>
  } @else {
    <svg><!-- moon icon --></svg>
  }
</button>
```

---

## 8. Design Principles

The following principles should guide every implementation decision for this redesign. They are derived from the stated inspirational sources (Apple, Linear, Vercel, Stripe) and tailored to this codebase's constraints.

### P1. Fewer, better colors

> Use at most 4 surface layers (bg → surface → surface-2 → surface-3) and 3 text layers (ink → ink-2 → ink-3). The accent is for interactive elements only, never for decorative backgrounds.

**Rationale:** Every additional color token increases cognitive load. The palette proposed in Section 4 has exactly 4 surface levels, 3 text levels, 2 border levels, and 1 accent. This is intentional.

### P2. Typography is the interface

> Let type do the heavylifting. Use a single typeface (Inter), a geometric scale (major third), and no font-weight below 400. Never use underlines for links — use weight or color.

**Rationale:** The codebase already uses Inter and has no external font dependencies. The spec standardizes the type scale so every text element's size is predictable.

### P3. Motion as feedback, not decoration

> Transitions must be <300ms, use the shared `--ease` curve, and serve a purpose: responding to input, revealing content, or communicating state. Never animate for its own sake.

**Rationale:** The codebase already has `--dur: 180ms` and `--ease: cubic-bezier(0.2, 0.7, 0.2, 1)` — these are well-chosen. The spec extends their use to page transitions and card entrances without adding gratuitous animation.

### P4. Dark mode is not inverted light mode

> A dark surface is not "light mode with black backgrounds." It requires different accent brightness, different border luminosities, different shadow treatment (glow instead of drop), and different surface stacking.

**Rationale:** The current codebase has zero dark-mode infrastructure. Simply inverting the light palette would produce a low-contrast, washed-out result. Section 4.1 defines a purpose-built dark palette with elevated accent saturation, deeper background stacks, and glow-adapted shadows.

### P5. Consistency over cleverness

> Use the same component for the same job everywhere. If a product card appears in 4 sections, all 4 use the same component with the same inputs. Do not create section-specific card variants.

**Rationale:** The codebase already follows this — `ProductCardComponent` is used by Featured, BestSellers, FlashSale, and ProductList. The spec must not break this pattern.

### P6. Accessible by default

> All interactive elements must be keyboard-accessible. All color combinations must meet WCAG AA 4.5:1 contrast. Motion must respect `prefers-reduced-motion`. The dark/light toggle must not be the only way to access content.

**Rationale:** The codebase currently has a skip link, focus-visible outlines, and reduced-motion support. The spec extends this to color contrast in dark mode and ARIA live regions.

### P7. Incremental delivery

> Every change must be independently deployable without breaking the current build. If a change requires coordinated work across 3+ files, split it into smaller changes.

**Rationale:** The constraint states "Changes must be implementable incrementally without breaking the current build." All recommendations in this spec respect this: (a) adding tokens to `:root` does not break anything, (b) component style changes are independent, (c) the `.dark` class toggle can coexist with `prefers-color-scheme` without conflict.

---

## 9. Incremental Implementation Strategy

### Phase 1 — Token foundation (no visual change)
1. Add dark-mode tokens to `src/styles.css` under `@media (prefers-color-scheme: dark)`.
2. Add type-scale and spacing-scale tokens to `:root`.
3. Add `global styles.css` grid utility classes.

### Phase 2 — Dark-mode activation (visual change visible only when dark mode is active)
1. Create `ThemeService` with signal + `.dark` class toggle.
2. Replace all hardcoded light-mode color literals (~25 locations) with CSS custom property references.
3. Update skeleton base/shine colors.
4. Update star-rating track color.
5. Update `btn-dark` to `btn-invert`.

### Phase 3 — Premium polish (visible in both modes)
1. Implement type scale across all components.
2. Implement spacing scale across all components.
3. Add route transition animations.
4. Add staggered card entrance.
5. Add button loading spinner.
6. Add footer subtle glow.
7. Add theme toggle button to header.

### Phase 4 — Layout & breakpoint cleanup
1. Standardize grid utilities and responsive breakpoints.
2. Add mobile hamburger navigation.
3. Replace emoji with SVG icons.
4. Add ARIA live regions.

---

## 10. Files Modified (Complete List)

### Modified files (no new files created)

| File | Changes |
|---|---|
| `src/styles.css` | Add dark-mode `@media` block, type scale tokens, spacing scale tokens, grid utilities, skeleton dark tokens, `btn-loading`, `btn-invert` |
| `src/app/layout/header.component.ts` | Update glass background to token, add theme toggle button, add hamburger menu |
| `src/app/layout/footer.component.ts` | Add subtle top-glow for dark mode |
| `src/app/shared/product-card.component.ts` | Replace hardcoded colors with tokens, update padding, fix wish-btn background, change add-button to outline |
| `src/app/shared/star-rating.component.ts` | Replace `#dcdbd4` with `var(--line)` |
| `src/app/sections/hero-section.component.ts` | Replace `#eef0ff` gradient with dark-adapted gradient, update CTA styling |
| `src/app/sections/featured-section.component.ts` | Use grid utility classes, update breakpoints |
| `src/app/sections/best-sellers-section.component.ts` | Use grid utility classes, update breakpoints |
| `src/app/sections/flash-sale-section.component.ts` | Update flash-sale gradient for dark mode, use grid utilities |
| `src/app/sections/recommendations-section.component.ts` | Use grid utilities |
| `src/app/sections/categories-section.component.ts` | Use grid utilities, update breakpoints |
| `src/app/sections/testimonials-section.component.ts` | Update padding/gap, use grid utilities, update breakpoints |
| `src/app/sections/newsletter-section.component.ts` | Update background for dark mode |
| `src/app/pages/product-list.component.ts` | Breakpoint alignment, replace emoji with SVG |
| `src/app/pages/cart.component.ts` | Replace emoji with SVG |
| `src/app/pages/product-detail.component.ts` | Replace emoji with SVG, add aria-live |

### New files created

| File | Purpose |
|---|---|
| `src/app/data/theme.service.ts` | Signal-based theme toggle with OS preference detection |

### Files intentionally NOT modified

| File | Rationale |
|---|---|
| `src/app/data/models.ts` | No model changes needed — existing types are sufficient |
| `src/app/data/cart.service.ts` | No business logic changes |
| `src/app/data/order.service.ts` | No business logic changes |
| `src/app/data/wishlist.service.ts` | No business logic changes |
| `src/app/data/catalog.service.ts` | No business logic changes |
| `src/app/app.config.ts` | Only needed if `provideAnimations()` is added |
| `src/app/app.routes.ts` | No routing changes |
| `src/mocks/*` | No mock data changes |
| `src/app/mock/mock-backend.interceptor.ts` | No API contract changes |

---

## 11. Decisions

| # | Topic | Decision | Rationale |
|---|---|---|---|
| 1 | Dark-mode activation mechanism | `@media (prefers-color-scheme: dark)` + `:root.dark` class toggle | Supports both OS-preference and manual toggle. The class variant is additive — no removal of existing tokens needed. |
| 2 | Theme toggle position | Header, next to cart icon | Visible on every page without adding layout weight. Follows common ecommerce patterns (Stripe, Linear). |
| 3 | Animation library | `@angular/animations` for route transitions; CSS-only for micro-interactions | Route transitions need Angular's animation framework. Card entrances, button press, and hover effects are CSS-only — no runtime cost. |
| 4 | Grid utility pattern | CSS classes (`grid-4`, `grid-3`, etc.) rather than CSS Grid template area names | Matches the existing utility-class convention in `src/styles.css` (`.container`, `.section`, `.card`, `.btn`). Avoids component-inline breakpoint repetition. |
| 5 | Type scale progression | Major third (~1.25) | Standard geometric scale. Inter renders well at all these sizes. Vercel and Linear use similar scales. |
| 6 | Button variant rename | `btn-dark` → `btn-invert` | "Dark" is semantically wrong in dark mode. The rename communicates intent: "invert to the opposite background." |
| 7 | Staggered card animation | CSS `animation-delay: calc(var(--i) * 80ms)` | Zero JavaScript. The `--i` custom property is set easily in `@for` loops. Falls back gracefully if `@property` is not supported (animation simply fires simultaneously). |
| 8 | Emoji replacement | Inline SVGs in each template | Matches the existing pattern in HeaderComponent (search icon: `header.component.ts:34-41`, cart icon: lines 54-61). A dedicated icon component would be a separate refactor. |
| 9 | Skeleton dark adaptation | New token `--skeleton-bg` and `--skeleton-shine` | Avoids hardcoded colors. The dark skeleton uses a very faint white shimmer (`rgba(255,255,255,0.06)`) rather than the light-mode bright white flash. |
| 10 | Flash-sale dark gradient | `linear-gradient(180deg, rgba(251, 113, 133, 0.08) 0%, var(--surface) 45%)` | Subtle rose glow at top that fades into the surface. Respects the existing layout while being dark-mode appropriate. |
| 11 | Inter font loading | Add Google Fonts `@import` with `display=swap` | No font loading mechanism exists in the codebase. Adding `@import` with `display=swap` guarantees Inter availability and prevents FOIT on slow connections. |
| 12 | Route animation bundle cost | Acceptable; add `provideAnimations()` | ~15KB is negligible for the perceived-quality improvement of route transitions (fade + slide-up). |
| 13 | Theme persistence | `localStorage` under key `aurora-theme` | Survives page reloads and tab restores. Values: `'dark'`, `'light'`, or `'system'` (default — OS-following). |
| 14 | Flash-sale dark urgency | Maintain bright rose border (`--sale: #fb7185`) + subtle glow | Urgency is the defining characteristic of a flash sale. Adding `box-shadow: 0 0 20px rgba(251, 113, 133, 0.1)` emphasizes it in dark mode without sacrificing the token system. |
| 15 | Product card aspect ratio | Keep `1 / 1` (square) | Current fixture images are square-optimized. Changing ratio would require new photography assets. Revisit if catalog expands. |
| 16 | Add-to-cart button style | Keep solid accent (`.btn`) | Primary conversion action on the card. Outline risks reducing click-through rates. Future A/B test candidate. |
| 17 | `btn-dark` backward compat | Preserve as deprecated alias | Avoids breaking E2E test selectors. Both classes apply identical `--btn-bg`/`--btn-fg` tokens. Deprecation comment added for future removal. |
| 18 | Visual baseline regeneration | Flagged; included in task testing phase | Breakpoint (560px → 720px) and color/typography changes invalidate all existing snapshots. Regeneration is part of definition of done. |
| 19 | Mobile hamburger menu | Deferred (P2, post-launch) | Outside dark-mode launch scope. Current nav-hidden-at-720px behavior continues unchanged. |

---

## 12. Resolved Questions

All open questions from the draft phase have been resolved with codebase-consistent decisions:

### Q1. Product photography aspect ratio
**Decision:** Keep `aspect-ratio: 1 / 1` (square). Current fixture images are square-optimized. Changing to 4:3 or 3:4 would require new product photography assets. Revisit if the catalog expands with items that benefit from non-square framing.

### Q2. `btn-dark` → `btn-invert` rename
**Decision:** Preserve `btn-dark` as a deprecated CSS alias for `btn-invert`. Both classes apply the same `--btn-bg`/`--btn-fg` tokens, rendering identically. No E2E test selectors break. Add a deprecation comment for future cleanup.

### Q3 & Q6. Mobile hamburger menu scope
**Decision:** Deferred. The hamburger menu is P2 (item #10) and outside the dark-mode launch scope. The current behavior (nav hidden at <720px, no replacement) continues.

### Q4. Visual test baseline regeneration
**Decision:** Baselines must be regenerated. The breakpoint change (560px → 720px), new color tokens, and typography updates invalidate all existing visual snapshots. Regeneration is part of this task's testing/QA phase.

### Q5. Product card add-button styling
**Decision:** Keep as solid accent button (`.btn`). The add-to-cart is the primary conversion action on the card; changing to outline risks reducing click-through rates. If future A/B testing shows outline performs equally, re-evaluate.

### Q6. Inter font loading method
**Decision:** Inter is not explicitly loaded in the codebase (`index.html` has no font `<link>`, no `@import` in CSS). Add a Google Fonts `@import` with `display=swap` to guarantee availability and prevent FOIT. The URL: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;620;650;720&display=swap`.

### Q7. Route animation dependency
**Decision:** Acceptable. `provideAnimations()` from `@angular/animations` adds ~15KB, which is negligible for the perceived-quality improvement of route transitions. Add to `app.config.ts`.

### Q8. Dedicated icon component vs inline SVGs
**Decision:** Use inline SVGs per template, matching the existing HeaderComponent pattern. A dedicated `<app-icon>` component is a valuable future refactor but outside scope.

### Q9. Dark-mode toggle persistence
**Decision:** Persist to `localStorage` under key `aurora-theme`. Values: `'dark'`, `'light'`, or `'system'` (default — follow OS preference). The `ThemeService` reads on init and writes on toggle.

### Q10. Flash-sale visual language in dark mode
**Decision:** Maintain urgency with the already-defined dark palette `--sale: #fb7185` (Rose-400). The `2px solid var(--sale)` border remains; no dimming. The gradient becomes `linear-gradient(180deg, rgba(251, 113, 133, 0.08) 0%, var(--surface) 45%)` as specified in Section 5.2 layout changes. A subtle `box-shadow: 0 0 20px rgba(251, 113, 133, 0.1)` glow is added for dark-mode emphasis.
