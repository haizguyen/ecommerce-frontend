import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';

import { CatalogService } from '../data/catalog.service';
import { CartService } from '../data/cart.service';
import { OrderService } from '../data/order.service';
import type { Product } from '../data/models';
import { StarRatingComponent } from '../shared/star-rating.component';
import { formatPrice, stockLabel, stockLevel } from '../shared/format.util';
import { canOrder, clampQuantity, hasDecremented } from '../quantity.util';

/**
 * Product detail page.
 *
 * Besides the marketing layout (gallery, price, rating, description) this page
 * carries the live order flow the app has always had: it reads live stock from
 * the inventory read-model, places an order, then polls until the eventual-
 * consistency decrement is visible. The original per-SKU test ids
 * (stock-/sku-/place-order-/status-) are preserved so the E2E flow still targets
 * them — the flow simply moved from the old single page onto the product page.
 */
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, StarRatingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container" *ngIf="product() as p; else other">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a routerLink="/">Home</a><span>/</span>
        <a [routerLink]="['/products']" [queryParams]="{ category: p.categoryId }">{{
          p.categoryId
        }}</a
        ><span>/</span><span class="here">{{ p.name }}</span>
      </nav>

      <div class="detail">
        <!-- Gallery -->
        <div class="gallery">
          <div class="frame">
            <img
              *ngIf="p.imageUrl && !imageFailed; else ph"
              [src]="p.imageUrl"
              [alt]="p.name"
              (error)="imageFailed = true" />
            <ng-template #ph>
              <div class="ph" aria-hidden="true"><span>◆</span></div>
            </ng-template>
          </div>
          <div class="thumbs" aria-hidden="true">
            <div class="thumb is-active"></div>
            <div class="thumb"></div>
            <div class="thumb"></div>
          </div>
        </div>

        <!-- Buy box -->
        <div class="buy">
          <div class="cat">{{ p.categoryId }}</div>
          <h1>{{ p.name }}</h1>

          <div class="meta">
            <app-star-rating [rating]="p.rating"></app-star-rating>
            <span class="sku" [attr.data-testid]="'sku-' + p.sku">{{ p.sku }}</span>
          </div>

          <div class="price">{{ price(p) }}</div>

          <div class="stock-line">
            <span
              class="badge"
              [class.badge-success]="level(liveStock() ?? p.stock) === 'in'"
              [class.badge-warn]="level(liveStock() ?? p.stock) === 'low'"
              [class.badge-danger]="level(liveStock() ?? p.stock) === 'out'">
              {{ stockText(liveStock() ?? p.stock) }}
            </span>
            <span class="units muted">
              <span [attr.data-testid]="'stock-' + p.sku">{{ liveStock() ?? '—' }}</span>
              in stock
            </span>
          </div>

          <p class="desc">{{ p.description }}</p>

          <div class="tags" *ngIf="p.tags.length">
            <span class="badge" *ngFor="let t of p.tags">#{{ t }}</span>
          </div>

          <!-- Purchase controls -->
          <div class="controls">
            <div class="qty" role="group" aria-label="Quantity">
              <button
                type="button"
                (click)="setQty(quantity() - 1, p)"
                [disabled]="quantity() <= 1"
                aria-label="Decrease quantity">
                −
              </button>
              <span class="qval" data-testid="qty">{{ quantity() }}</span>
              <button
                type="button"
                (click)="setQty(quantity() + 1, p)"
                [disabled]="!canBuy(p) || quantity() >= (liveStock() ?? p.stock)"
                aria-label="Increase quantity">
                +
              </button>
            </div>

            <button
              class="btn btn-lg add"
              type="button"
              [disabled]="!canBuy(p)"
              data-testid="add-to-cart"
              (click)="addToCart(p)">
              {{ canBuy(p) ? 'Add to cart · ' + price(p) : 'Sold out' }}
            </button>
          </div>

          <button
            class="btn btn-lg btn-dark btn-block place"
            type="button"
            [attr.data-testid]="'place-order-' + p.sku"
            [disabled]="placing() || !canBuy(p)"
            (click)="placeOrder(p)">
            {{ placing() ? 'Placing…' : 'Buy now (qty ' + quantity() + ')' }}
          </button>

          <div class="status" aria-live="polite" [attr.data-testid]="'status-' + p.sku" [class.on]="status()">
            {{ status() }}
          </div>

          <div class="assurances">
            <span>🚚 Free shipping over $99</span>
            <span>↩︎ 30-day returns</span>
          </div>
        </div>
      </div>

      <!-- You may also like -->
      <section class="section related" *ngIf="related().length">
        <div class="section-head">
          <h2>You may also like</h2>
          <a class="link-arrow" [routerLink]="['/products']" [queryParams]="{ category: p.categoryId }"
            >More in {{ p.categoryId }} →</a
          >
        </div>
        <div class="rel-grid">
          <a class="rel" *ngFor="let r of related()" [routerLink]="['/products', r.sku]">
            <div class="rel-media">
              <img *ngIf="r.imageUrl" [src]="r.imageUrl" [alt]="r.name" loading="lazy" />
              <div class="ph small" *ngIf="!r.imageUrl" aria-hidden="true">◆</div>
            </div>
            <div class="rel-name">{{ r.name }}</div>
            <div class="rel-price">{{ price(r) }}</div>
          </a>
        </div>
      </section>
    </div>

    <ng-template #other>
      <div class="container">
        <div class="state" *ngIf="loading()">
          <div class="detail">
            <div class="frame skeleton"></div>
            <div class="buy-sk">
              <div class="skeleton l1"></div>
              <div class="skeleton l2"></div>
              <div class="skeleton l3"></div>
            </div>
          </div>
        </div>

        <div class="state notfound" *ngIf="!loading()">
          <div class="empty-ico"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg></div>
          <h2>Product not found</h2>
          <p class="muted">We couldn't find that product. It may have sold out or moved.</p>
          <a class="btn" routerLink="/products">Back to shop</a>
        </div>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .crumbs {
        display: flex;
        gap: 8px;
        align-items: center;
        font-size: 13px;
        color: var(--ink-2);
        padding: 24px 0 20px;
        flex-wrap: wrap;
      }
      .crumbs a:hover {
        color: var(--accent);
      }
      .crumbs .here {
        color: var(--ink);
        font-weight: 550;
      }
      .detail {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 48px;
        align-items: start;
      }
      /* Gallery */
      .frame {
        aspect-ratio: 1 / 1;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: var(--r-xl);
        overflow: hidden;
      }
      .frame img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .ph {
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
        font-size: 72px;
        color: var(--ink-3);
        background: var(--surface-2);
      }
      .ph.small {
        font-size: 26px;
        border-radius: var(--r-md);
      }
      .thumbs {
        display: flex;
        gap: 12px;
        margin-top: 14px;
      }
      .thumb {
        width: 72px;
        height: 72px;
        border-radius: var(--r-md);
        background: var(--surface-2);
        border: 1px solid var(--line);
      }
      .thumb.is-active {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-soft);
      }
      /* Buy box */
      .cat {
        font-size: 12px;
        font-weight: 650;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ink-3);
      }
      .buy h1 {
        font-size: var(--text-2xl);
        margin: 8px 0 12px;
      }
      .meta {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .meta .sku {
        font-size: 12.5px;
        color: var(--ink-3);
        font-variant-numeric: tabular-nums;
      }
      .price {
        font-size: 32px;
        font-weight: 700;
        letter-spacing: -0.02em;
        margin: 18px 0 12px;
      }
      .stock-line {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      }
      .units {
        font-size: 13px;
      }
      .desc {
        font-size: 15px;
        color: var(--ink-2);
        line-height: 1.65;
        max-width: 52ch;
      }
      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 18px 0 4px;
      }
      .controls {
        display: flex;
        gap: 12px;
        margin: 24px 0 12px;
      }
      .qty {
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--line-strong);
        border-radius: var(--r-pill);
        overflow: hidden;
      }
      .qty button {
        width: 44px;
        height: 46px;
        border: 0;
        background: var(--surface);
        font-size: 20px;
        color: var(--ink);
        cursor: pointer;
        transition: background var(--dur) var(--ease);
      }
      .qty button:hover:not(:disabled) {
        background: var(--surface-2);
      }
      .qty button:disabled {
        color: var(--ink-3);
        cursor: not-allowed;
      }
      .qval {
        min-width: 44px;
        text-align: center;
        font-weight: 650;
        font-variant-numeric: tabular-nums;
      }
      .add {
        flex: 1;
      }
      .place {
        margin-top: 4px;
      }
      .status {
        min-height: 20px;
        margin-top: 12px;
        font-size: 14px;
        color: var(--ink-2);
        opacity: 0;
        transition: opacity var(--dur) var(--ease);
      }
      .status.on {
        opacity: 1;
      }
      .assurances {
        display: flex;
        gap: 18px;
        margin-top: 18px;
        padding-top: 18px;
        border-top: 1px solid var(--line);
        font-size: 13px;
        color: var(--ink-2);
      }
      /* Related */
      .related {
        padding-top: 64px;
      }
      .rel-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
      }
      .rel {
        display: block;
      }
      .rel-media {
        aspect-ratio: 1 / 1;
        border-radius: var(--r-lg);
        overflow: hidden;
        background: var(--surface-2);
        border: 1px solid var(--line);
        margin-bottom: 10px;
      }
      .rel-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 400ms var(--ease);
      }
      .rel:hover .rel-media img {
        transform: scale(1.05);
      }
      .rel-media .ph {
        font-size: 30px;
      }
      .rel-name {
        font-size: 14px;
        font-weight: 550;
        line-height: 1.35;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .rel:hover .rel-name {
        color: var(--accent);
      }
      .rel-price {
        font-size: 14px;
        font-weight: 650;
        color: var(--ink-2);
        margin-top: 2px;
      }
      /* States */
      .state {
        padding: 8px 0 40px;
      }
      .buy-sk {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .buy-sk .l1 {
        height: 34px;
        width: 70%;
      }
      .buy-sk .l2 {
        height: 20px;
        width: 40%;
      }
      .buy-sk .l3 {
        height: 120px;
      }
      .notfound {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 10px;
        padding: 90px 20px;
      }
      .empty-ico {
        font-size: 44px;
      }
      @media (max-width: 860px) {
        .detail {
          grid-template-columns: 1fr;
          gap: 28px;
        }
        .rel-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `
  ]
})
export class ProductDetailComponent {
  private readonly catalog = inject(CatalogService);
  private readonly orders = inject(OrderService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly cart = inject(CartService);

  readonly product = signal<Product | null>(null);
  readonly related = signal<Product[]>([]);
  readonly liveStock = signal<number | null>(null);
  readonly loading = signal(true);
  readonly quantity = signal(1);
  readonly placing = signal(false);
  readonly status = signal('');

  imageFailed = false;

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const sku = params.get('sku') ?? '';
          this.reset();
          return this.catalog.getProduct(sku);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (p) => {
          this.product.set(p);
          this.liveStock.set(p.stock);
          this.loading.set(false);
          this.loadRelated(p);
          this.refreshStock(p.sku);
        },
        error: () => {
          this.product.set(null);
          this.loading.set(false);
        }
      });
  }

  price(p: Product): string {
    return formatPrice(p.price, p.currency);
  }

  level(stock: number) {
    return stockLevel(stock);
  }

  stockText(stock: number): string {
    return stockLabel(stock);
  }

  canBuy(p: Product): boolean {
    return canOrder(this.liveStock() ?? p.stock, 1);
  }

  setQty(next: number, p: Product): void {
    const max = Math.max(1, this.liveStock() ?? p.stock);
    this.quantity.set(clampQuantity(next, max));
  }

  addToCart(p: Product): void {
    this.cart.add(p, this.quantity());
    this.status.set(`Added ${this.quantity()} × ${p.name} to your cart.`);
  }

  /** Place an order and poll the read-model until stock reflects the decrement. */
  placeOrder(p: Product): void {
    if (this.placing()) return;
    const before = this.liveStock();
    const qty = this.quantity();
    this.placing.set(true);
    this.status.set('Placing order…');

    this.orders.placeOrder(p.sku, qty, p.name, p.price, p.currency).subscribe({
      next: () => {
        this.status.set('Order placed — waiting for inventory to update…');
        this.pollUntilDecremented(p.sku, before, 30);
      },
      error: () => {
        this.placing.set(false);
        this.status.set('Order failed. Please try again.');
      }
    });
  }

  private pollUntilDecremented(sku: string, before: number | null, attemptsLeft: number): void {
    if (attemptsLeft <= 0) {
      this.placing.set(false);
      this.status.set('Timed out waiting for stock update.');
      return;
    }
    this.catalog.getInventoryItem(sku).subscribe({
      next: (item) => {
        if (hasDecremented(before, item.stock)) {
          this.liveStock.set(item.stock);
          this.placing.set(false);
          this.status.set('Stock updated ✔ — thanks for your order!');
        } else {
          setTimeout(() => this.pollUntilDecremented(sku, before, attemptsLeft - 1), 1000);
        }
      },
      error: () => setTimeout(() => this.pollUntilDecremented(sku, before, attemptsLeft - 1), 1000)
    });
  }

  private refreshStock(sku: string): void {
    this.catalog.getInventoryItem(sku).subscribe({
      next: (item) => this.liveStock.set(item.stock),
      error: () => {
        /* keep the catalogue stock as a fallback */
      }
    });
  }

  private loadRelated(current: Product): void {
    this.catalog.getProducts().subscribe((all) => {
      this.related.set(
        all.filter((p) => p.categoryId === current.categoryId && p.sku !== current.sku).slice(0, 4)
      );
    });
  }

  private reset(): void {
    this.loading.set(true);
    this.product.set(null);
    this.liveStock.set(null);
    this.quantity.set(1);
    this.placing.set(false);
    this.status.set('');
    this.imageFailed = false;
  }
}
