import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CatalogService } from '../data/catalog.service';
import { CartService } from '../data/cart.service';
import type { Category, Product } from '../data/models';
import { ProductCardComponent } from '../shared/product-card.component';
import { HeroSectionComponent } from '../sections/hero-section.component';

/**
 * Home / landing page: hero, value props, category tiles and a curated
 * "featured" grid (top-rated products). All data comes from CatalogService.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, HeroSectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero-section></app-hero-section>

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
