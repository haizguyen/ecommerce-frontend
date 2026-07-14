import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CatalogService } from '../data/catalog.service';
import type { Product } from '../data/models';
import { ProductCardComponent } from '../shared/product-card.component';

/**
 * Homepage best sellers grid — top-selling products from CatalogService.
 *
 * Fetches best-selling products and displays them in a 4-column grid of product
 * cards. Includes loading, error, and empty states.
 * Emits add / toggleWishlist / quickView events to the parent.
 */
@Component({
  selector: 'app-best-sellers-section',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container section" aria-labelledby="bs-title">
      <div class="section-head">
        <div>
          <span class="eyebrow">Trending</span>
          <h2 id="bs-title">Best sellers</h2>
        </div>
        <a class="link-arrow" routerLink="/products">Shop all &rarr;</a>
      </div>

      @if (loading()) {
        <div class="grid-4">
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
          <p class="muted">Top sellers coming soon &mdash; check back later.</p>
        </div>
      } @else {
        <div class="grid-4">
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
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
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
      .grid-4 {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 560px) {
      .grid-4 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BestSellersSectionComponent {
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
    this.catalog.getBestSellers().subscribe({
      next: (items) => {
        this.products.set(items);
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
