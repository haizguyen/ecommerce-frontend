import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import type { Product } from '../data/models';
import { formatPrice, stockLevel } from './format.util';
import { StarRatingComponent } from './star-rating.component';

/**
 * Catalogue product card — the repeating unit of every product grid. Handles the
 * fixture edge cases by design: null/broken image → branded placeholder, long
 * titles → clamped to two lines, out-of-stock → disabled add button + badge.
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, StarRatingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="pc" [attr.data-testid]="'product-card-' + product.sku">
      <a class="media" [routerLink]="['/products', product.sku]" [attr.aria-label]="product.name">
        <img
          *ngIf="product.imageUrl && !imageFailed; else placeholder"
          [src]="product.imageUrl"
          [alt]="product.name"
          loading="lazy"
          (error)="imageFailed = true" />
        <ng-template #placeholder>
          <div class="ph" aria-hidden="true">
            <span>{{ initials }}</span>
          </div>
        </ng-template>

        <span class="tag-row">
          <span *ngIf="level === 'out'" class="badge badge-danger">Sold out</span>
          <span *ngIf="level === 'low'" class="badge badge-warn">Low stock</span>
          <span *ngIf="isNew" class="badge badge-accent">New</span>
        </span>
      </a>

      <div class="body">
        <div class="cat">{{ product.categoryId }}</div>
        <h3 class="name">
          <a [routerLink]="['/products', product.sku]">{{ product.name }}</a>
        </h3>
        <app-star-rating [rating]="product.rating"></app-star-rating>

        <div class="foot">
          <div class="price">{{ price }}</div>
          <button
            class="btn add"
            type="button"
            [disabled]="level === 'out'"
            [attr.data-testid]="'add-' + product.sku"
            (click)="add.emit(product)">
            {{ level === 'out' ? 'Sold out' : 'Add' }}
          </button>
        </div>
      </div>
    </article>
  `,
  styles: [
    `
      .pc {
        display: flex;
        flex-direction: column;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: var(--r-lg);
        overflow: hidden;
        transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease),
          border-color var(--dur) var(--ease);
      }
      .pc:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-md);
        border-color: var(--line-strong);
      }
      .media {
        position: relative;
        display: block;
        aspect-ratio: 1 / 1;
        background: var(--surface-2);
        overflow: hidden;
      }
      .media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 400ms var(--ease);
      }
      .pc:hover .media img {
        transform: scale(1.04);
      }
      .ph {
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #efeee9, #e3e2dc);
        color: var(--ink-3);
        font-weight: 700;
        font-size: 34px;
        letter-spacing: 0.04em;
      }
      .tag-row {
        position: absolute;
        top: 12px;
        left: 12px;
        display: flex;
        gap: 6px;
      }
      .body {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px 16px 18px;
      }
      .cat {
        font-size: 11.5px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ink-3);
      }
      .name {
        font-size: 15px;
        font-weight: 600;
        line-height: 1.35;
        letter-spacing: -0.01em;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 2.7em;
      }
      .name a:hover {
        color: var(--accent);
      }
      .foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 4px;
      }
      .price {
        font-size: 18px;
        font-weight: 680;
        letter-spacing: -0.02em;
      }
      .add {
        padding: 9px 16px;
      }
    `
  ]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() add = new EventEmitter<Product>();

  imageFailed = false;

  get price(): string {
    return formatPrice(this.product.price, this.product.currency);
  }

  get level() {
    return stockLevel(this.product.stock);
  }

  get isNew(): boolean {
    return this.product.tags.includes('new');
  }

  get initials(): string {
    return this.product.name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] ?? '')
      .join('')
      .toUpperCase();
  }
}
