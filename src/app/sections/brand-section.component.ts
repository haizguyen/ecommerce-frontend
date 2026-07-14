import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { CatalogService } from '../data/catalog.service';
import type { Brand } from '../data/models';
import { getInitials } from './brand-section.util';

/**
 * Homepage brand strip — horizontal row of partner logo tiles.
 *
 * Fetches brands from CatalogService. Brands without a logo or whose image
 * fails to load display a letter-initials fallback. Empty response hides
 * the section entirely.
 */
@Component({
  selector: 'app-brand-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container section" aria-label="Partner brands">
      @if (loading()) {
        <div class="section-head">
          <div>
            <span class="eyebrow">Partners</span>
            <h2>Brands we love</h2>
          </div>
        </div>
        <div class="brand-row">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="skeleton sk-brand"></div>
          }
        </div>
      } @else if (error()) {
        <div class="section-head">
          <div>
            <span class="eyebrow">Partners</span>
            <h2>Brands we love</h2>
          </div>
        </div>
        <div class="section-error">
          <p>Something went wrong loading this section.</p>
          <button class="btn btn-outline" (click)="retry()">Retry</button>
        </div>
      } @else {
        @if (brands().length > 0) {
        <div class="section-head">
          <div>
            <span class="eyebrow">Partners</span>
            <h2>Brands we love</h2>
          </div>
        </div>
        <div class="brand-row">
          @for (b of brands(); track b.id) {
            <div class="brand-tile">
              @if (b.logoUrl && !imgFailed().has(b.id)) {
                <img [src]="b.logoUrl" [alt]="b.name" (error)="onImgError(b.id)" />
              } @else {
                <div class="brand-init">{{ getInitials(b.name) }}</div>
              }
            </div>
          }
        </div>
      }
      }
    </section>
  `,
  styles: [`
    .brand-row {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: center;
    }
    .brand-tile {
      width: 120px;
      height: 80px;
      display: grid;
      place-items: center;
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--r-lg);
      transition: box-shadow var(--dur) var(--ease), border-color var(--dur) var(--ease);
      overflow: hidden;
    }
    .brand-tile:hover {
      box-shadow: var(--shadow-sm);
      border-color: var(--line-strong);
    }
    .brand-tile img {
      max-height: 48px;
      object-fit: contain;
      display: block;
    }
    .brand-init {
      font-size: 24px;
      font-weight: 700;
      color: var(--ink-3);
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      background: var(--surface-2);
    }
    .sk-brand {
      width: 80px;
      height: 80px;
      border-radius: var(--r-pill);
    }
    .section-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px 20px;
      text-align: center;
    }
    .section-error p {
      margin: 0;
      font-size: 15px;
    }
  `]
})
export class BrandSectionComponent {
  private readonly catalog = inject(CatalogService);

  readonly brands = signal<Brand[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly imgFailed = signal<Set<string>>(new Set());

  constructor() {
    this.load();
  }

  getInitials(name: string): string {
    return getInitials(name);
  }

  onImgError(id: string): void {
    this.imgFailed.update(s => {
      const next = new Set(s);
      next.add(id);
      return next;
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.catalog.getBrands().subscribe({
      next: (list) => {
        this.brands.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  retry(): void {
    this.load();
  }
}
