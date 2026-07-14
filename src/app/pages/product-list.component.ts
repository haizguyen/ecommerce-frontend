import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { CatalogService } from '../data/catalog.service';
import { CartService } from '../data/cart.service';
import type { Category, Product } from '../data/models';
import { ProductCardComponent } from '../shared/product-card.component';
import { applyCatalogQuery, SORT_OPTIONS, type SortKey } from '../shared/catalog.util';

/**
 * Product listing page. Category filter and search term live in the URL
 * (?category=&q=) so views are shareable and the header search lands here. The
 * grid is derived reactively via applyCatalogQuery over the fetched catalogue.
 */
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a routerLink="/">Home</a><span>/</span><span class="here">Shop</span>
      </nav>

      <header class="head">
        <div>
          <h1>{{ activeCategoryName() }}</h1>
          <p class="muted" data-testid="result-count">
            {{ visible().length }}
            {{ visible().length === 1 ? 'product' : 'products' }}
            <ng-container *ngIf="query()">for “{{ query() }}”</ng-container>
          </p>
        </div>

        <label class="sort">
          <span class="sr-only">Sort by</span>
          <select class="select" [value]="sort()" (change)="onSort($event)">
            <option *ngFor="let o of sortOptions" [value]="o.key">{{ o.label }}</option>
          </select>
        </label>
      </header>

      <!-- Category filter -->
      <div class="filters" role="group" aria-label="Filter by category">
        <button
          class="chip"
          [class.is-active]="!category()"
          type="button"
          (click)="selectCategory(null)">
          All
        </button>
        <button
          class="chip"
          *ngFor="let c of categories()"
          [class.is-active]="category() === c.id"
          type="button"
          (click)="selectCategory(c.id)">
          {{ c.name }}
          <span class="c-count">{{ c.productCount }}</span>
        </button>
      </div>

      <!-- Grid / states -->
      <div class="section pt0">
        <div class="grid" *ngIf="loading()">
          <div class="sk skeleton" *ngFor="let i of [1, 2, 3, 4, 5, 6]"></div>
        </div>

        <div class="grid" *ngIf="!loading() && visible().length > 0">
          <app-product-card
            *ngFor="let p of visible()"
            [product]="p"
            (add)="cart.add($event)"></app-product-card>
        </div>

        <div class="empty" *ngIf="!loading() && visible().length === 0" data-testid="empty-state">
          <div class="empty-ico"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
          <h3>No products found</h3>
          <p class="muted">
            Nothing matches your current filters. Try clearing the search or picking another
            category.
          </p>
          <button class="btn btn-outline" type="button" (click)="clearAll()">Clear filters</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .crumbs {
        display: flex;
        gap: 8px;
        align-items: center;
        font-size: 13px;
        color: var(--ink-2);
        padding-top: 24px;
      }
      .crumbs a:hover {
        color: var(--accent);
      }
      .crumbs .here {
        color: var(--ink);
        font-weight: 550;
      }
      .head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        margin: 14px 0 22px;
      }
      .head h1 {
        font-size: var(--text-2xl);
        margin-bottom: 6px;
      }
      .sort .select {
        width: auto;
        min-width: 190px;
        cursor: pointer;
      }
      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--line);
      }
      .c-count {
        font-size: 11px;
        font-weight: 700;
        opacity: 0.6;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
      }
      .pt0 {
        padding-top: 28px;
      }
      .sk {
        aspect-ratio: 3 / 4;
      }
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 10px;
        padding: 72px 20px;
      }
      .empty-ico {
        font-size: 40px;
      }
      .empty p {
        max-width: 380px;
        margin-bottom: 8px;
      }
      @media (max-width: 980px) {
        .grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      @media (max-width: 720px) {
        .grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .head {
          flex-direction: column;
          align-items: stretch;
        }
      }
    `
  ]
})
export class ProductListComponent {
  private readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly cart = inject(CartService);

  readonly sortOptions = SORT_OPTIONS;

  private readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);

  // URL-driven state.
  private readonly params = toSignal(
    this.route.queryParamMap.pipe(
      map((p) => ({
        category: p.get('category'),
        query: p.get('q') ?? '',
        sort: (p.get('sort') as SortKey | null) ?? 'featured'
      }))
    ),
    { initialValue: { category: null as string | null, query: '', sort: 'featured' as SortKey } }
  );

  readonly category = computed(() => this.params().category);
  readonly query = computed(() => this.params().query);
  readonly sort = computed(() => this.params().sort);

  readonly visible = computed(() =>
    applyCatalogQuery(this.products(), {
      categoryId: this.category(),
      query: this.query(),
      sort: this.sort()
    })
  );

  readonly activeCategoryName = computed(() => {
    const id = this.category();
    if (!id) return 'All products';
    return this.categories().find((c) => c.id === id)?.name ?? 'Products';
  });

  constructor() {
    this.catalog.getCategories().subscribe((c) => this.categories.set(c));
    this.catalog.getProducts().subscribe({
      next: (p) => {
        this.products.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  selectCategory(id: string | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: id },
      queryParamsHandling: 'merge'
    });
  }

  onSort(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as SortKey;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sort: value === 'featured' ? null : value },
      queryParamsHandling: 'merge'
    });
  }

  clearAll(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }
}
