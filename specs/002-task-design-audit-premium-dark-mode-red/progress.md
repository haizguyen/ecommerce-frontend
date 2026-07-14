# Progress: Premium Dark-Mode Redesign

| Field | Value |
|---|---|
| **Feature ID** | `002-task-design-audit-premium-dark-mode-red` |
| **Branch** | `aiko/aiko-sdd-lite-fe-task-design-audit-premium-dark-mo-3af83179` |
| **Started** | 2026-07-14 |
| **Status** | In Progress |

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

**Commit:** *(pending)*

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

## Story 4 — Replace Hardcoded Colors in Sections and Pages [PENDING]

**Blocked by:** Story 2

### Targets
- `hero-section.component.ts`: gradient blob colors
- `flash-sale-section.component.ts`: gradient adaptation
- `newsletter-section.component.ts`: background
- `footer.component.ts`: top-glow for dark mode

---

## Story 5 — Type Scale Adoption [PENDING]

**Blocked by:** Story 1 (tokens exist)

---

## Story 6 — Premium Polish [PENDING]

**Blocked by:** Stories 1-4

---

## Story 7 — Layout Cleanup [PENDING]

**Blocked by:** Story 1 (utilities exist)

---

## Story 8 — Accessibility [PENDING]

**Blocked by:** Story 4 (emoji replacement in pages)
