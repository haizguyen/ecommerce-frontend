# Plan Fragment: ProductCardComponent Retrofit

## Source: `plan.md` — "ProductCardComponent contract changes", "Affected Files"

### File: `src/app/shared/product-card.component.ts`

Retrofit the existing component with 3 new UI elements and 2 new outputs + 1 new input.

### New Inputs/Outputs

```typescript
@Input() wishlisted = false;
@Output() toggleWishlist = new EventEmitter<Product>();
@Output() quickView = new EventEmitter<Product>();
```
Existing `@Input({ required: true }) product!: Product` and `@Output() add = new EventEmitter<Product>()` remain unchanged.

### UI additions

1. **Discount badge** (`.badge-sale`): Show in `.tag-row` to the left of existing stock badges when `product.discountPercentage` is truthy. Text: `-20%` format.

2. **Wishlist toggle** (heart icon): `<button>` element in top-right corner of `.media` area. Inline SVG heart — outline when `!wishlisted`, filled when `wishlisted`. SVG stroke-width 1.8, uses `currentColor`. `aria-label` dynamic: "Add <product name> to wishlist" / "Remove from wishlist".

3. **Quick-view overlay**: `<button>` centered in `.media`, visible on hover (`opacity` transition with `--dur`/`--ease`). Text: "Quick view". `aria-label="Quick view <product name>"`. On touch devices (`@media (hover: none)`), always visible.

4. **Original price strikethrough**: In `.price` area, when `product.originalPrice` is set, show `<span class="price-old">$originalPrice</span>` in `--ink-3` with `text-decoration: line-through` beside the discounted price.

### SVG icon pattern
Follow `header.component.ts:34-41` (search icon) and `:54-61` (cart icon) — inline SVG, `stroke-width: 1.8`, `fill="none"` / `fill="currentColor"` based on state.

### Tests
- Discount badge visible when `product.discountPercentage` is set; hidden when null.
- Wishlist heart emits `toggleWishlist` with product on click.
- `wishlisted = true` input renders filled heart SVG; `false` renders outline.
- Quick-view overlay emits `quickView` with product on click.
- Quick-view overlay visible on hover (CSS) — test via class toggling.
- Original price strikethrough visible when `product.originalPrice` set; hidden when null.
- All existing `ProductCardComponent` tests continue to pass (no regressions).
