import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CatalogService } from '../data/catalog.service';
import type { Category } from '../data/models';

/**
 * Homepage category grid — 5-column tile navigation.
 *
 * Fetches categories from CatalogService and displays them as clickable tiles
 * linking to /products?category=<slug>. Includes loading, error, and empty states.
 */
@Component({
  selector: 'app-categories-section',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container section">
      <div class="section-head">
        <div>
          <span class="eyebrow">Browse</span>
          <h2>Shop by category</h2>
        </div>
        <a class="link-arrow" routerLink="/products">All products →</a>
      </div>

      @if (loading()) {
        <nav aria-label="Product categories" class="cats">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="cat-tile skeleton sk-cat"></div>
          }
        </nav>
      } @else if (error()) {
        <div class="state-msg">
          <p class="muted">Something went wrong loading this section.</p>
          <button class="btn btn-outline" (click)="retry()">Retry</button>
        </div>
      } @else if (categories().length === 0) {
        <div class="state-msg">
          <p class="muted">No categories available right now.</p>
        </div>
      } @else {
        <nav aria-label="Product categories" class="cats">
          @for (c of categories(); track c.id) {
            <a
              class="cat-tile"
              [routerLink]="['/products']"
              [queryParams]="{ category: c.slug }">
              <div class="cat-name">{{ c.name }}</div>
              <div class="cat-count muted">{{ c.productCount }} items</div>
              <span class="cat-go">→</span>
            </a>
          }
        </nav>
      }
    </section>
  `,
  styles: [
    `
      .cats {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: var(--space-3);
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
      .cat-count {
        font-size: 13px;
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
      .sk-cat {
        min-height: 118px;
        border-radius: var(--r-lg);
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
        .cats {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      @media (max-width: 720px) {
        .cats {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `
  ]
})
export class CategoriesSectionComponent {
  private readonly catalog = inject(CatalogService);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  constructor() {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.catalog.getCategories().subscribe({
      next: (items) => {
        this.categories.set(items);
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
