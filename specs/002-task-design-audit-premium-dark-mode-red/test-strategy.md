# Test Strategy: Premium Dark-Mode Redesign — Aurora Store

## Overview

This test strategy covers the dark-mode redesign of the Aurora Store homepage. Testing spans unit tests (Jest) for the new ThemeService, visual regression tests (Playwright) for dark-mode screenshots, and selective E2E verification for backward compatibility.

---

## 1. Unit Tests — ThemeService

### MUST — Core behavior

| # | Test | Assertion |
|---|---|---|
| UT-1 | Constructor reads `matchMedia` and sets `isDark` accordingly | When `window.matchMedia('(prefers-color-scheme: dark)').matches` returns `true`, `isDark()` returns `true`. When it returns `false`, `isDark()` returns `false`. Use `jest.spyOn`. |
| UT-2 | `toggle()` flips state | After `toggle()`, `isDark()` inverts. After a second `toggle()`, it inverts again. |
| UT-3 | `toggle()` syncs `.dark` class on `<html>` | After `toggle()` to dark, `document.documentElement.classList.contains('dark')` is `true`. After toggle to light, it is `false`. |
| UT-4 | `toggle()` persists to localStorage | After toggling dark, `localStorage.getItem('aurora-theme')` equals `'dark'`. After toggling light, equals `'light'`. Use `jest.spyOn(Storage.prototype, 'setItem')`. |
| UT-5 | Constructor reads stored localStorage value first | Mock `localStorage.getItem('aurora-theme')` to return `'dark'`. Despite `matchMedia` returning light, `isDark()` returns `true`. |
| UT-6 | OS preference change listener updates signal (no manual override) | Mock `matchMedia` change event. When no localStorage override exists, firing the change callback updates `isDark()`. |
| UT-7 | OS preference change ignored when manual override stored | Mock `localStorage` to `'light'`. Fire OS change event to dark. `isDark()` remains `false`. |

### SHOULD — Edge cases

| # | Test | Assertion |
|---|---|---|
| UT-8 | Constructor handles missing localStorage gracefully | `localStorage.getItem` throws or returns `null` → defaults to `'system'` (OS-following). No uncaught error. |
| UT-9 | Multiple `toggle()` calls are idempotent | Call `toggle()` 3 times → state equals one `toggle()` (odd flips, even returns to original). |
| UT-10 | `localStorage` key is exactly `'aurora-theme'` | Verify the string is used consistently in getItem and setItem. |

---

## 2. Visual Regression Tests (Playwright)

### MUST — Baseline regeneration

| # | Test | Assertion |
|---|---|---|
| VR-1 | Homepage light mode matches new baseline | Navigate to `/` with `colorScheme: 'light'`. Screenshot matches `home-light.png`. |
| VR-2 | Homepage dark mode matches new baseline | Navigate to `/` with `colorScheme: 'dark'`. Screenshot matches `home-dark.png`. |
| VR-3 | Products page light mode | `/products` light. Matches `products-light.png`. |
| VR-4 | Products page dark mode | `/products` dark. Matches `products-dark.png`. |
| VR-5 | Product detail light mode | `/products/1` light. Matches `product-detail-light.png`. |
| VR-6 | Product detail dark mode | `/products/1` dark. Matches `product-detail-dark.png`. |
| VR-7 | Cart light mode | `/cart` light. Matches `cart-light.png`. |
| VR-8 | Cart dark mode | `/cart` dark. Matches `cart-dark.png`. |
| VR-9 | Theme toggle button state | Capture header before/after toggle click. Before: moon icon (light mode). After: sun icon (dark mode). Verify `.dark` class on `<html>`. |

### SHOULD — Additional viewports

| # | Test | Assertion |
|---|---|---|
| VR-10 | Mobile viewport 390×844, homepage dark | Dark-mode homepage at mobile width. Matches `home-mobile-dark.png`. |
| VR-11 | Tablet viewport 768×1024, homepage dark | Dark-mode homepage at tablet width. Matches `home-tablet-dark.png`. |
| VR-12 | Flash-sale section dark mode | Verify `--sale: #fb7185` border and glow shadow are present. |

---

## 3. E2E Tests (Playwright)

### MUST — Backward compatibility

| # | Test | Assertion |
|---|---|---|
| E2E-1 | `btn-dark` selector still works | Elements with `class="btn btn-dark"` render identically to `btn-invert`. No broken styles. |
| E2E-2 | Cart badge still visible in dark mode | Cart badge has `background: var(--accent)` + `border: 2px solid var(--surface)`. Screenshot verification. |

### SHOULD — Theme toggle interaction

| # | Test | Assertion |
|---|---|---|
| E2E-3 | Manual toggle persistence | Click toggle → reload page → verify `.dark` class (or absence) is preserved. |
| E2E-4 | Theme toggle focusable by keyboard | Tab to toggle, press Enter/Space → theme flips. `aria-label` updates. |

---

## 4. Accessibility Verification

### MUST — Contrast and ARIA

| # | Test | Assertion |
|---|---|---|
| AX-1 | Dark-mode accent contrast | `--accent (#818cf8)` on `--surface (#151516)` ≥ 4.5:1. Use `@axe-core/playwright` or manual verification. |
| AX-2 | Dark-mode ink contrast | `--ink (#f5f5f4)` on `--bg (#0a0a0b)` ≥ 7:1. |
| AX-3 | Order status `aria-live` | Product detail order status div has `aria-live="polite"` or `role="status"`. |
| AX-4 | Cart confirmation `aria-live` | Cart empty-state replace has `aria-live="polite"` alongside existing `role="status"`. |
| AX-5 | Theme toggle accessible name | Button has dynamic `aria-label` matching current mode. |

### SHOULD — Reduced motion

| # | Test | Assertion |
|---|---|---|
| AX-6 | Animations respect `prefers-reduced-motion` | With reduced motion enabled, staggered card entrance, button press scale, and heart pulse are disabled. Route transitions may still fire (Angular animation vs CSS). |

---

## 5. Visual Inspection Checklist

| # | Item | How to verify |
|---|---|---|
| VI-1 | Skeleton colors in dark mode | Open DevTools → toggle dark mode → observe skeleton cards: base `#1c1c1e`, shimmer `rgba(255,255,255,0.06)` — no white flash. |
| VI-2 | Star rating track in dark | Star track is `var(--line)` — visible as subtle divider on `--surface`. |
| VI-3 | Header glass effect in dark | Header background is dark-surface mix (`color-mix(in srgb, var(--surface) 80%, transparent)`), not white-wash. |
| VI-4 | Hero blob colors in dark | Indigo blobs are deeper (`#6366f1`/`#4338ca` with `opacity: 0.3`), warm blobs muted (`#f59e0b`/`#d97706` with `opacity: 0.2`). |
| VI-5 | Flash-sale glow | `.flash-wrap` has `box-shadow: 0 0 20px rgba(251, 113, 133, 0.1)` in dark mode. |
| VI-6 | Card hover glow | Hovering a product card adds `0 0 0 1px var(--accent-soft)` ring. |
| VI-7 | Footer top glow in dark | Footer has `box-shadow: 0 -1px 0 rgba(255,255,255,0.05)` alongside border-top. |
| VI-8 | Button loading spinner | `.btn-loading` shows spinning border, text hidden. |
| VI-9 | Grid breakpoints at 720px | Resize to <720px → all product grids collapse to 1 column. |
| VI-10 | Emoji replaced with SVGs | Empty states show SVG icon (search, bag, compass) — no emoji characters. |
