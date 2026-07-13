import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CatalogService } from '../data/catalog.service';
import type { Product } from '../data/models';
import { ProductCardComponent } from '../shared/product-card.component';

/**
 * Homepage featured products grid — top 4 products by rating.
 *
 * Fetches products from CatalogService, sorts by rating descending, and displays
 * the top 4 as product cards. Includes loading, error, and empty states.
 * Emits add / toggleWishlist / quickView events to the parent.
 */
@Component({
  selector: 'app-featured-section',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container section pt0" aria-labelledby="feat-title">
      <div class="section-head">
        <div>
          <span class="eyebrow">Editor's picks</span>
          <h2 id="feat-title">Featured this week</h2>
        </div>
        <a class="link-arrow" routerLink="/products">See everything &rarr;</a>
      </div>

      @if (loading()) {
        <div class="grid">
          @for (i of [1,2,3,4]; track i) {
            <div class="sk skeleton sk-card"></div>
          }
        </div>
      } @else if (error()) {
        <div class="state-msg">
          <p class="muted">Something went wrong loading this section.</p>
          <button class="btn btn-outline" (click)="retry()">Retry</button>
        </div>
      } @else if (products().length === 0) {
        <div class="state-msg">
          <p class="muted">Nothing to feature this week &mdash; check back soon.</p>
        </div>
      } @else {
        <div class="grid">
          @for (p of products(); track p.sku) {
            <app-product-card
              [product]="p"
              (add)="add.emit($event)"
              (toggleWishlist)="toggleWishlist.emit($event)"
              (quickView)="quickView.emit($event)"></app-product-card>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .pt0 {
      padding-top: 0;
    }
    .sk-card {
      aspect-ratio: 3 / 4;
    }
    .state-msg {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px 20px;
      text-align: center;
    }
    .state-msg p {
      margin: 0;
      font-size: 15px;
    }

    @media (max-width: 980px) {
      .grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 560px) {
      .grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class FeaturedSectionComponent {
  private readonly catalog = inject(CatalogService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  @Output() add = new EventEmitter<Product>();
  @Output() toggleWishlist = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();

  constructor() {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.catalog.getProducts().subscribe({
      next: (items) => {
        const featured = [...items].sort((a, b) => b.rating - a.rating).slice(0, 4);
        this.products.set(featured);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  retry(): void {
    this.load();
  }
}
