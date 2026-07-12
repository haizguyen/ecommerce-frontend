import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CatalogService } from '../data/catalog.service';
import { CartService } from '../data/cart.service';
import type { Product } from '../data/models';
import { ProductCardComponent } from '../shared/product-card.component';
import { HeroSectionComponent } from '../sections/hero-section.component';
import { CategoriesSectionComponent } from '../sections/categories-section.component';

/**
 * Home / landing page: hero, value props, category tiles and a curated
 * "featured" grid (top-rated products). All data comes from CatalogService.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, HeroSectionComponent, CategoriesSectionComponent],
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

    <app-categories-section></app-categories-section>

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
        .grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 560px) {
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

  readonly featured = signal<Product[]>([]);
  readonly loading = signal(true);

  readonly values = [
    { icon: '🚚', title: 'Free shipping', sub: 'On orders over $99' },
    { icon: '↩︎', title: '30-day returns', sub: 'No-questions refunds' },
    { icon: '🛡️', title: '2-year warranty', sub: 'On every product' },
    { icon: '⚡', title: 'Fast dispatch', sub: 'Ships within 24h' }
  ];

  constructor() {
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
