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
 *
 * S6 retrofit adds: discount badge, wishlist heart toggle, quick-view overlay,
 * original-price strikethrough.
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, StarRatingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="pc" [attr.data-testid]="'product-card-' + product.sku">
      <div class="media">
        <a [routerLink]="['/products', product.sku]" [attr.aria-label]="product.name">
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
        </a>

        <span class="tag-row">
          <span *ngIf="product.discountPercentage" class="badge badge-sale"
            >-{{ product.discountPercentage }}%</span
          >
          <span *ngIf="level === 'out'" class="badge badge-danger">Sold out</span>
          <span *ngIf="level === 'low'" class="badge badge-warn">Low stock</span>
          <span *ngIf="isNew" class="badge badge-accent">New</span>
        </span>

        <button
          class="wish-btn"
          type="button"
          [attr.aria-label]="
            wishlisted ? 'Remove ' + product.name + ' from wishlist' : 'Add ' + product.name + ' to wishlist'
          "
          (click)="toggleWishlist.emit(product)">
          <svg
            *ngIf="!wishlisted; else filledHeart"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <ng-template #filledHeart>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round">
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </ng-template>
        </button>

        <button
          class="qv-btn"
          type="button"
          [attr.aria-label]="'Quick view ' + product.name"
          (click)="quickView.emit(product)">
          Quick view
        </button>
      </div>

      <div class="body">
        <div class="cat">{{ product.categoryId }}</div>
        <h3 class="name">
          <a [routerLink]="['/products', product.sku]">{{ product.name }}</a>
        </h3>
        <app-star-rating [rating]="product.rating"></app-star-rating>

        <div class="foot">
          <div class="price">
            <span *ngIf="product.originalPrice" class="price-old">{{
              originalPrice
            }}</span>
            {{ price }}
          </div>
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
        aspect-ratio: 1 / 1;
        background: var(--surface-2);
        overflow: hidden;
      }
      .media a {
        display: block;
        width: 100%;
        height: 100%;
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
        pointer-events: none;
      }
      .badge-sale {
        background: var(--danger);
        color: #fff;
      }
      .wish-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(4px);
        cursor: pointer;
        color: var(--ink-2);
        transition: color var(--dur) var(--ease), transform var(--dur) var(--ease),
          background var(--dur) var(--ease);
        z-index: 2;
      }
      .wish-btn:hover {
        color: var(--danger);
        transform: scale(1.12);
        background: #fff;
      }
      .qv-btn {
        position: absolute;
        inset: 0;
        margin: auto;
        width: fit-content;
        height: fit-content;
        padding: 10px 22px;
        border: none;
        border-radius: var(--r-lg);
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(6px);
        font-size: 14px;
        font-weight: 600;
        color: var(--ink-1);
        cursor: pointer;
        opacity: 0;
        transition: opacity var(--dur) var(--ease), transform var(--dur) var(--ease);
        z-index: 2;
        pointer-events: none;
      }
      .media:hover .qv-btn,
      @media (hover: none) {
        .qv-btn {
          opacity: 1;
          pointer-events: auto;
        }
      }
      .media:hover .qv-btn {
        opacity: 1;
        pointer-events: auto;
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
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .price-old {
        font-size: 14px;
        font-weight: 500;
        color: var(--ink-3);
        text-decoration: line-through;
      }
      .add {
        padding: 9px 16px;
      }
    `
  ]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() wishlisted = false;
  @Output() add = new EventEmitter<Product>();
  @Output() toggleWishlist = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();

  imageFailed = false;

  get price(): string {
    return formatPrice(this.product.price, this.product.currency);
  }

  get originalPrice(): string {
    return this.product.originalPrice
      ? formatPrice(this.product.originalPrice, this.product.currency)
      : '';
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
