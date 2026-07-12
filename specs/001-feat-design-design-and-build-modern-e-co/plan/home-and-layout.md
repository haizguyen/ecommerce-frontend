# Plan Fragment: HomeComponent Refactor, FooterComponent, AppComponent

## Source: `plan.md` — "Affected Files", UX spec "Components", spec "Component tree"

### HomeComponent refactor (`src/app/pages/home.component.ts`)

**Before:** Monolithic component with inline hero (template lines 20-50), categories (63-84), featured (86-107), and inline styles.

**After:** Template composed of section components in order:

```html
<app-hero-section />
<app-search-section />
<app-categories-section (categoryClick)="…" />
<app-featured-section
  (add)="cart.add($event)"
  (toggleWishlist)="wishlist.toggle($event.sku)"
  (quickView)="viewProduct($event)" />
<app-best-sellers-section
  (add)="cart.add($event)"
  (toggleWishlist)="wishlist.toggle($event.sku)"
  (quickView)="viewProduct($event)" />
<app-flash-sale-section
  (add)="cart.add($event)"
  (toggleWishlist)="wishlist.toggle($event.sku)"
  (quickView)="viewProduct($event)" />
<app-recommendations-section />
<app-brand-section />
<app-testimonials-section />
<app-newsletter-section (subscribed)="…" />
```

**Wiring:**
- `add` → `CartService.add(product)`
- `toggleWishlist` → `WishlistService.toggle(product.sku)`
- `quickView` → `router.navigate(['/products', product.sku])`

**State:** CartService already injected (line 100). Add `WishlistService` and `Router` injection.

**Remove:** Inline hero, categories, featured template blocks; inline styles for those sections.

---

### FooterComponent — social links (`src/app/layout/footer.component.ts`)

Add `.social-row` div in brand column (between brand tagline `<p>` and payment strip `.strip`):

```html
<div class="social-row">
  <a href="#" class="social-link" aria-label="Twitter / X">
    <!-- inline SVG: 20x20, currentColor -->
  </a>
  <a href="#" class="social-link" aria-label="Instagram">
    <!-- inline SVG -->
  </a>
  <a href="#" class="social-link" aria-label="GitHub">
    <!-- inline SVG -->
  </a>
</div>
```

SVG style: 20px × 20px, `fill: currentColor`, `--ink-2` default, `--accent` on hover. Flex row 12px gap. Pattern matches `header.component.ts:34-41`.

---

### AppComponent — skip-to-content link (`src/app/app.component.ts`)

Add as first child of template:

```html
<a href="#content" class="skip-link">Skip to main content</a>
```

Position off-screen, visible on `:focus` with `position: absolute; top: 8px; left: 8px; z-index: 10000; background: var(--surface); color: var(--ink); padding: 8px 16px; border-radius: var(--r-md);` or use existing `.sr-only` class with focus variant. Target `<main id="content">` which wraps the `<router-outlet>`.

### Tests
- **HomeComponent:** All section components render in DOM in correct order.
- **HomeComponent:** `add` event from section children → `CartService.add()` called.
- **HomeComponent:** `toggleWishlist` → `WishlistService.toggle()` called with correct SKU.
- **HomeComponent:** `quickView` → `router.navigate()` called with correct route.
- **FooterComponent:** Social link SVGs render with correct `aria-label` values.
- **AppComponent:** Skip-to-content link is first focusable element in DOM.
