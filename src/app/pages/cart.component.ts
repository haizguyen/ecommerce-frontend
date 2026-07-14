import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CartService } from '../data/cart.service';
import { formatPrice } from '../shared/format.util';
import { lineTotal } from '../shared/cart.util';
import type { CartItem } from '../data/models';

/** Free-shipping threshold and flat rate below it. */
const FREE_SHIPPING_AT = 99;
const SHIPPING_FLAT = 9.9;

/**
 * Cart page: editable line items (quantity steppers + remove), a live order
 * summary with a free-shipping progress nudge, and an empty state. All numbers
 * come from CartService's signals, so edits reflect instantly here and in the
 * header badge.
 */
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <header class="head">
        <h1>Your cart</h1>
        <p class="muted" *ngIf="lines().length">
          {{ cart.count() }} {{ cart.count() === 1 ? 'item' : 'items' }}
        </p>
      </header>

      <!-- Checkout confirmation (persists after the cart is cleared) -->
      <div class="confirm" *ngIf="message()" data-testid="checkout-msg" role="status">
        <span class="check">✓</span>{{ message() }}
      </div>

      <!-- Empty -->
      <div class="empty" *ngIf="lines().length === 0; else full" data-testid="cart-empty">
        <div class="empty-ico"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg></div>
        <h2>Your cart is empty</h2>
        <p class="muted">Browse the catalogue and add something you love.</p>
        <a class="btn btn-lg" routerLink="/products">Start shopping</a>
      </div>

      <ng-template #full>
        <div class="layout">
          <!-- Line items -->
          <ul class="items" data-testid="cart-items">
            <li class="item" *ngFor="let it of lines()" [attr.data-testid]="'cart-item-' + it.sku">
              <a class="thumb" [routerLink]="['/products', it.sku]" aria-hidden="true">
                <span>{{ initials(it) }}</span>
              </a>
              <div class="info">
                <a class="name" [routerLink]="['/products', it.sku]">{{ it.name }}</a>
                <div class="sku muted">{{ it.sku }}</div>
                <button class="remove" type="button" (click)="cart.remove(it.sku)">Remove</button>
              </div>

              <div class="qty" role="group" aria-label="Quantity">
                <button
                  type="button"
                  (click)="cart.setQuantity(it.sku, it.quantity - 1)"
                  [disabled]="it.quantity <= 1"
                  aria-label="Decrease quantity">
                  −
                </button>
                <span class="qval">{{ it.quantity }}</span>
                <button
                  type="button"
                  (click)="cart.setQuantity(it.sku, it.quantity + 1)"
                  aria-label="Increase quantity">
                  +
                </button>
              </div>

              <div class="line-price">{{ money(total(it)) }}</div>
            </li>
          </ul>

          <!-- Summary -->
          <aside class="summary card">
            <h2>Order summary</h2>

            <div class="ship-nudge" *ngIf="remainingForFree() > 0">
              Add <strong>{{ money(remainingForFree()) }}</strong> for free shipping
              <div class="bar"><span [style.width.%]="freeProgress()"></span></div>
            </div>
            <div class="ship-nudge ok" *ngIf="remainingForFree() <= 0">
              ✓ You've unlocked free shipping
            </div>

            <dl class="rows">
              <div class="row">
                <dt>Subtotal</dt>
                <dd data-testid="summary-subtotal">{{ money(cart.subtotal()) }}</dd>
              </div>
              <div class="row">
                <dt>Shipping</dt>
                <dd>{{ shipping() === 0 ? 'Free' : money(shipping()) }}</dd>
              </div>
              <div class="row total">
                <dt>Total</dt>
                <dd data-testid="summary-total">{{ money(orderTotal()) }}</dd>
              </div>
            </dl>

            <button class="btn btn-lg btn-block" type="button" (click)="checkout()">
              Checkout
            </button>
            <a class="continue" routerLink="/products">← Continue shopping</a>

            <div class="pay-note muted">Secure checkout · Encrypted payment</div>
          </aside>
        </div>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .head {
        display: flex;
        align-items: baseline;
        gap: 14px;
        padding: 28px 0 22px;
      }
      .head h1 {
        font-size: var(--text-2xl);
      }
      /* Empty */
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 10px;
        padding: 80px 20px 96px;
      }
      .empty-ico {
        font-size: 46px;
      }
      .empty p {
        margin-bottom: 10px;
      }
      /* Layout */
      .layout {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: 32px;
        align-items: start;
        padding-bottom: 24px;
      }
      .items {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
      }
      .item {
        display: grid;
        grid-template-columns: 84px 1fr auto auto;
        gap: 18px;
        align-items: center;
        padding: 20px 0;
        border-bottom: 1px solid var(--line);
      }
      .item:first-child {
        padding-top: 0;
      }
      .thumb {
        width: 84px;
        height: 84px;
        display: grid;
        place-items: center;
        border-radius: var(--r-md);
        background: var(--surface-2);
        color: var(--ink-3);
        font-weight: 700;
        font-size: 22px;
      }
      .info {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }
      .name {
        font-weight: 600;
        font-size: 15px;
        line-height: 1.35;
      }
      .name:hover {
        color: var(--accent);
      }
      .sku {
        font-size: 12.5px;
      }
      .remove {
        align-self: flex-start;
        margin-top: 6px;
        padding: 0;
        border: 0;
        background: none;
        font-size: 13px;
        color: var(--ink-3);
        cursor: pointer;
        transition: color var(--dur) var(--ease);
      }
      .remove:hover {
        color: var(--danger);
      }
      .qty {
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--line-strong);
        border-radius: var(--r-pill);
        overflow: hidden;
      }
      .qty button {
        width: 38px;
        height: 40px;
        border: 0;
        background: var(--surface);
        font-size: 18px;
        cursor: pointer;
        transition: background var(--dur) var(--ease);
      }
      .qty button:hover:not(:disabled) {
        background: var(--surface-2);
      }
      .qty button:disabled {
        color: var(--ink-3);
        cursor: not-allowed;
      }
      .qval {
        min-width: 36px;
        text-align: center;
        font-weight: 650;
        font-variant-numeric: tabular-nums;
      }
      .line-price {
        font-weight: 680;
        font-size: 16px;
        min-width: 84px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      /* Summary */
      .summary {
        position: sticky;
        top: calc(var(--header-h) + 20px);
        padding: 24px;
      }
      .summary h2 {
        font-size: 18px;
        margin-bottom: 18px;
      }
      .ship-nudge {
        font-size: 13px;
        color: var(--ink-2);
        background: var(--surface-2);
        border: 1px solid var(--line);
        border-radius: var(--r-md);
        padding: 12px 14px;
        margin-bottom: 18px;
      }
      .ship-nudge.ok {
        color: var(--success);
        background: var(--success-soft);
        border-color: transparent;
        font-weight: 600;
      }
      .ship-nudge .bar {
        height: 6px;
        border-radius: var(--r-pill);
        background: var(--line);
        margin-top: 10px;
        overflow: hidden;
      }
      .ship-nudge .bar span {
        display: block;
        height: 100%;
        background: var(--accent);
        transition: width var(--dur) var(--ease);
      }
      .rows {
        margin: 0 0 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .row {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: var(--ink-2);
      }
      .row dd {
        margin: 0;
        font-variant-numeric: tabular-nums;
      }
      .row.total {
        padding-top: 14px;
        border-top: 1px solid var(--line);
        font-size: 18px;
        font-weight: 720;
        color: var(--ink);
      }
      .continue {
        display: block;
        text-align: center;
        margin-top: 14px;
        font-size: 14px;
        color: var(--ink-2);
      }
      .continue:hover {
        color: var(--accent);
      }
      .confirm {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 18px;
        margin-bottom: 24px;
        border-radius: var(--r-md);
        background: var(--success-soft);
        color: var(--success);
        font-size: 14px;
        font-weight: 550;
      }
      .confirm .check {
        display: grid;
        place-items: center;
        width: 22px;
        height: 22px;
        border-radius: var(--r-pill);
        background: var(--success);
        color: #fff;
        font-size: 13px;
        flex: none;
      }
      .pay-note {
        text-align: center;
        font-size: 12px;
        margin-top: 16px;
      }
      @media (max-width: 860px) {
        .layout {
          grid-template-columns: 1fr;
        }
        .summary {
          position: static;
        }
      }
      @media (max-width: 520px) {
        .item {
          grid-template-columns: 64px 1fr auto;
          grid-template-areas:
            'thumb info info'
            'thumb qty price';
          row-gap: 12px;
        }
        .thumb {
          grid-area: thumb;
          width: 64px;
          height: 64px;
        }
        .info {
          grid-area: info;
        }
        .qty {
          grid-area: qty;
        }
        .line-price {
          grid-area: price;
        }
      }
    `
  ]
})
export class CartComponent {
  readonly cart = inject(CartService);
  readonly lines = this.cart.lines;
  readonly message = signal('');

  readonly shipping = computed(() =>
    this.cart.subtotal() >= FREE_SHIPPING_AT || this.cart.subtotal() === 0 ? 0 : SHIPPING_FLAT
  );
  readonly orderTotal = computed(() => round2(this.cart.subtotal() + this.shipping()));
  readonly remainingForFree = computed(() => round2(FREE_SHIPPING_AT - this.cart.subtotal()));
  readonly freeProgress = computed(() =>
    Math.min(100, (this.cart.subtotal() / FREE_SHIPPING_AT) * 100)
  );

  money(amount: number): string {
    return formatPrice(amount, this.cart.currency());
  }

  total(item: CartItem): number {
    return lineTotal(item);
  }

  initials(item: CartItem): string {
    return item.name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] ?? '')
      .join('')
      .toUpperCase();
  }

  checkout(): void {
    this.message.set(
      `Thanks! This is a mock checkout — no payment was taken. Order total ${this.money(
        this.orderTotal()
      )}.`
    );
    this.cart.clear();
  }
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
