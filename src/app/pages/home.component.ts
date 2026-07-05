import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CatalogService } from '../data/catalog.service';
import { CartService } from '../data/cart.service';
import type { Category, Product } from '../data/models';
import { ProductCardComponent } from '../shared/product-card.component';

/**
 * Home / landing page: hero, value props, category tiles and a curated
 * "featured" grid (top-rated products). All data comes from CatalogService.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero -->
    <section class="hero">
      <div class="container hero-in">
        <div class="hero-copy">
          <span class="eyebrow">New season · 2026</span>
          <h1>Gear that earns its place on your desk.</h1>
          <p class="lede muted">
            Audio, peripherals and displays chosen for how they feel every day — not just how
            they spec. Free shipping over $99.
          </p>
          <div class="hero-cta">
            <a class="btn btn-lg" routerLink="/products">Shop the catalogue</a>
            <a class="btn btn-lg btn-outline" [routerLink]="['/products']" [queryParams]="{ category: 'audio' }"
              >Explore audio</a
            >
          </div>
          <div class="trust">
            <span>★ 4.6 average rating</span>
            <span class="dot">·</span>
            <span>30-day returns</span>
            <span class="dot">·</span>
            <span>2-year warranty</span>
          </div>
        </div>
        <div class="hero-art" aria-hidden="true">
          <div class="blob b1"></div>
          <div class="blob b2"></div>
          <div class="glass">◆</div>
        </div>
      </div>
    </section>

    <!-- Value strip -->
    <section class="container values">
      <div class="value" *ngFor="let v of values">
        <div class="v-ico">{{ v.icon }}</div>
        <div>
          <div class="v-title">{{ v.title }}</div>
          <div class="v-sub muted">{{ v.sub }}</div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="container section">
      <div class="section-head">
        <div>
          <span class="eyebrow">Browse</span>
          <h2>Shop by category</h2>
        </div>
        <a class="link-arrow" routerLink="/products">All products →</a>
      </div>

      <div class="cats">
        <a
          class="cat-tile"
          *ngFor="let c of categories()"
          [routerLink]="['/products']"
          [queryParams]="{ category: c.id }">
          <div class="cat-name">{{ c.name }}</div>
          <div class="cat-count muted">{{ c.productCount }} items</div>
          <span class="cat-go">→</span>
        </a>
      </div>
    </section>

    <!-- Featured -->
    <section class="container section pt0">
      <div class="section-head">
        <div>
          <span class="eyebrow">Editor's picks</span>
          <h2>Featured this week</h2>
        </div>
        <a class="link-arrow" routerLink="/products">See everything →</a>
      </div>

      <div class="grid" *ngIf="!loading(); else skeletons">
        <app-product-card
          *ngFor="let p of featured()"
          [product]="p"
          (add)="cart.add($event)"></app-product-card>
      </div>
      <ng-template #skeletons>
        <div class="grid">
          <div class="sk skeleton" *ngFor="let i of [1, 2, 3, 4]"></div>
        </div>
      </ng-template>
    </section>
  `,
  styles: [
    `
      /* Hero */
      .hero {
        background: radial-gradient(120% 120% at 85% 10%, #eef0ff 0%, transparent 55%),
          var(--surface);
        border-bottom: 1px solid var(--line);
      }
      .hero-in {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 40px;
        align-items: center;
        padding-block: 72px;
      }
      .hero-copy h1 {
        font-size: clamp(34px, 5vw, 58px);
        line-height: 1.03;
        margin: 14px 0 18px;
      }
      .lede {
        font-size: 17px;
        max-width: 460px;
      }
      .hero-cta {
        display: flex;
        gap: 12px;
        margin: 28px 0 22px;
        flex-wrap: wrap;
      }
      .trust {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13.5px;
        color: var(--ink-2);
      }
      .trust .dot {
        color: var(--ink-3);
      }
      .hero-art {
        position: relative;
        height: 340px;
      }
      .blob {
        position: absolute;
        border-radius: 50%;
        filter: blur(6px);
        opacity: 0.9;
      }
      .b1 {
        width: 260px;
        height: 260px;
        right: 20px;
        top: 10px;
        background: radial-gradient(circle at 30% 30%, #c7ccff, #8b93f5);
      }
      .b2 {
        width: 170px;
        height: 170px;
        left: 30px;
        bottom: 0;
        background: radial-gradient(circle at 30% 30%, #ffe0c2, #ffb27a);
      }
      .glass {
        position: absolute;
        inset: 0;
        margin: auto;
        width: 150px;
        height: 150px;
        display: grid;
        place-items: center;
        font-size: 60px;
        color: var(--accent);
        background: rgba(255, 255, 255, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.8);
        border-radius: var(--r-xl);
        box-shadow: var(--shadow-lg);
        backdrop-filter: blur(8px);
      }

      /* Value strip */
      .values {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 18px;
        padding-block: 28px;
      }
      .value {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .v-ico {
        display: grid;
        place-items: center;
        width: 42px;
        height: 42px;
        border-radius: var(--r-md);
        background: var(--surface-2);
        border: 1px solid var(--line);
        font-size: 18px;
      }
      .v-title {
        font-weight: 620;
        font-size: 14px;
      }
      .v-sub {
        font-size: 13px;
      }

      /* Categories */
      .cats {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 14px;
      }
      .cat-tile {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 22px 18px;
        min-height: 118px;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: var(--r-lg);
        transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease),
          border-color var(--dur) var(--ease);
      }
      .cat-tile:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-md);
        border-color: var(--line-strong);
      }
      .cat-name {
        font-weight: 620;
        font-size: 16px;
      }
      .cat-go {
        position: absolute;
        right: 16px;
        bottom: 16px;
        color: var(--accent);
        transition: transform var(--dur) var(--ease);
      }
      .cat-tile:hover .cat-go {
        transform: translateX(4px);
      }

      /* Grid */
      .grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
      }
      .pt0 {
        padding-top: 0;
      }
      .sk {
        aspect-ratio: 3 / 4;
      }

      @media (max-width: 980px) {
        .hero-in {
          grid-template-columns: 1fr;
        }
        .hero-art {
          display: none;
        }
        .values {
          grid-template-columns: repeat(2, 1fr);
        }
        .cats {
          grid-template-columns: repeat(3, 1fr);
        }
        .grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 560px) {
        .cats {
          grid-template-columns: repeat(2, 1fr);
        }
        .grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `
  ]
})
export class HomeComponent {
  private readonly catalog = inject(CatalogService);
  readonly cart = inject(CartService);

  readonly categories = signal<Category[]>([]);
  readonly featured = signal<Product[]>([]);
  readonly loading = signal(true);

  readonly values = [
    { icon: '🚚', title: 'Free shipping', sub: 'On orders over $99' },
    { icon: '↩︎', title: '30-day returns', sub: 'No-questions refunds' },
    { icon: '🛡️', title: '2-year warranty', sub: 'On every product' },
    { icon: '⚡', title: 'Fast dispatch', sub: 'Ships within 24h' }
  ];

  constructor() {
    this.catalog.getCategories().subscribe((c) => this.categories.set(c));
    this.catalog.getProducts().subscribe({
      next: (products) => {
        const featured = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);
        this.featured.set(featured);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
