# Plan Fragment: Section Components — 10 New Standalone Components

## Source: `plan.md` — "Section Component Design Details", "Affected Files", UX spec tables

### Common pattern for all data-driven sections

Every section that fetches data follows this reactive contract:

```typescript
readonly loading = signal(true);
readonly error = signal(false);
readonly data = signal<T[]>([]);

private load(): void {
  this.loading.set(true);
  this.error.set(false);
  this.service.getData().subscribe({
    next: (items) => { this.data.set(items); this.loading.set(false); },
    error: () => { this.error.set(true); this.loading.set(false); }
  });
}

retry(): void { this.load(); }
constructor() { this.load(); }
```

Template uses Angular 17 `@if` control flow:
- `@if (loading())` → skeleton
- `@else if (error())` → message + Retry button
- `@else if (data().length === 0)` → empty message
- `@else` → content grid

All components standalone, OnPush change detection, under `src/app/sections/`.

---

### 1. HeroSection (`app-hero-section`)

**Status:** Refactor from existing inline `HomeComponent`.
**Data:** None (presentational).
**Layout:** Full-width radial-gradient bg, two-column grid (copy + decorative art). Eyebrow, h1, lede, two CTAs, trust strip. Existing code at `home.component.ts:20-50` (template), `:112-188` (styles).
**States:** None (always present).
**File:** `src/app/sections/hero-section.component.ts`

---

### 2. SearchSection (`app-search-section`)

**Status:** New.
**Data:** None (form only).
**Layout:** Large input (18px font, 16px 20px padding), placeholder "Search 100+ products…", auto-focus on mount. Submits to `/products?q=` on Enter. `max-width: 640px`, centered. No section-head.
**States:** None (always present).
**Accessibility:** `aria-label="Search products"`, `role="search"` on section.
**File:** `src/app/sections/search-section.component.ts`

---

### 3. CategoriesSection (`app-categories-section`)

**Status:** Extract from existing inline `HomeComponent`.
**Data:** `CatalogService.getCategories()`.
**Layout:** 5-column tile grid (14px gap). Existing pattern at `home.component.ts:63-84`.
**States:** Loading (5 skeleton tiles), Error (msg + retry), Empty ("No categories available right now.").
**Accessibility:** `<nav aria-label="Product categories">`.
**File:** `src/app/sections/categories-section.component.ts`

---

### 4. FeaturedSection (`app-featured-section`)

**Status:** Extract from existing inline `HomeComponent`.
**Data:** `CatalogService.getProducts()` → top 4 by rating.
**Layout:** 4-column grid (20px gap) of `app-product-card`. Eyebrow "Editor's picks", h2 "Featured this week".
**States:** Loading (4 skeleton cards), Error (msg + retry), Empty ("Nothing to feature this week — check back soon.").
**File:** `src/app/sections/featured-section.component.ts`

---

### 5. BestSellersSection (`app-best-sellers-section`)

**Status:** New.
**Data:** `CatalogService.getBestSellers()`.
**Layout:** 4-column grid of `app-product-card`. Eyebrow "Trending", h2 "Best sellers".
**States:** Loading (4 skeleton cards), Error (msg + retry), Empty ("Top sellers coming soon — check back later.").
**File:** `src/app/sections/best-sellers-section.component.ts`

---

### 6. FlashSaleSection (`app-flash-sale-section`)

**Status:** New.
**Data:** `CatalogService.getFlashSale()`.
**Layout:** Sale container with `--sale` border/tint, countdown timer (interval(1000) + signal, `HH:MM:SS`), 4-column product grid. Eyebrow "Limited time", h2 "Flash sale".
**States:** Loading (skeleton timer + 4 skeleton cards), Error (msg + retry), Empty/null ("No active flash sales right now."), Ended (timer shows "Ended"), Null API → hidden entirely (`@if (flashSale(); as sale)` guard).
**Countdown:** `interval(1000)` piped through `takeUntilDestroyed()`. Format `HH:MM:SS` or `DH:MM:SS` if >24h. `aria-live="polite"` on timer.
**File:** `src/app/sections/flash-sale-section.component.ts`

---

### 7. RecommendationsSection (`app-recommendations-section`)

**Status:** New — placeholder.
**Data:** None (static placeholder).
**Layout:** 4 skeleton cards with overlay pill: "Personalized recommendations coming soon". h2 "Picked for you".
**States:** Always-inherent placeholder (no data fetching).
**File:** `src/app/sections/recommendations-section.component.ts`

---

### 8. BrandSection (`app-brand-section`)

**Status:** New.
**Data:** `CatalogService.getBrands()`.
**Layout:** Horizontal flex-wrap row of `.brand-tile` (80px height, 120px width). Logo image or initials fallback. Eyebrow "Partners", h2 "Brands we love".
**States:** Loading (6 skeleton circles), Error (msg + retry), Empty → hidden (no DOM).
**Image fallback:** `(error)` handler → initials fallback (first 2 chars, gradient bg).
**File:** `src/app/sections/brand-section.component.ts`

---

### 9. TestimonialsSection (`app-testimonials-section`)

**Status:** New.
**Data:** `CatalogService.getTestimonials()`.
**Layout:** 3-column grid (20px gap) of testimonial cards. Avatar (48px circle), quote (3-line clamp), author name, optional title, `app-star-rating`. Eyebrow "Real reviews", h2 "What our customers say".
**States:** Loading (3 skeleton cards), Error (msg + retry), Empty → hidden.
**Avatar fallback:** Initials from author name, gradient bg.
**File:** `src/app/sections/testimonials-section.component.ts`

---

### 10. NewsletterSection (`app-newsletter-section`)

**Status:** New.
**Data:** `CatalogService.subscribeToNewsletter()`.
**Layout:** Full-width `--accent-soft` bg, centered column (max-width 520px). h2 "Stay in the loop", subtitle "Get 10% off your first order." Inline form: email input + Subscribe button.
**States:** Idle (form visible), Submitting (button "Subscribing…", input disabled), Success (thank-you message replaces form), Error (inline error, form remains), Validation (inline "Please enter a valid email address." with `--danger`).
**Validation:** `FormControl` with `Validators.email` + `Validators.required`. Validate on submit, not keystroke.
**Accessibility:** `aria-label="Email address for newsletter"`, error uses `role="alert"`.
**File:** `src/app/sections/newsletter-section.component.ts`

---

### Section-level state messages summary

| Section | Loading skeleton | Empty message | Error message |
|---------|-----------------|---------------|---------------|
| CategoriesSection | 5 skeleton `.sk-cat` tiles | "No categories available right now." | Standard + Retry |
| FeaturedSection | 4 skeleton `.sk-card` tiles | "Nothing to feature this week — check back soon." | Standard + Retry |
| BestSellersSection | 4 skeleton `.sk-card` tiles | "Top sellers coming soon — check back later." | Standard + Retry |
| FlashSaleSection | Skeleton timer + 4 cards | "No active flash sales right now. Check back soon!" | Standard + Retry |
| BrandSection | 6 skeleton `.sk-brand` tiles | Hidden entirely (no DOM) | Standard + Retry |
| TestimonialsSection | 3 skeleton testimonial cards | Hidden entirely (no DOM) | Standard + Retry |
| RecommendationsSection | 4 skeleton cards + overlay | N/A (always placeholder) | N/A |
| NewsletterSection | Submitting disabled state | N/A | Validation + server errors inline |

Standard error: "Something went wrong loading this section." + `.btn-outline` Retry button.

### Key design decisions (from spec)
- Testimonials: static 3-column grid (no carousel infrastructure exists).
- Recommendations: visible placeholder with skeletons + overlay (no data fetching; honest placeholder).
- Flash sale null: hidden entirely from DOM (`@if (flashSale(); as sale)`).
