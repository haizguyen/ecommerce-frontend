import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CatalogService } from '../data/catalog.service';
import type { FlashSale, Product } from '../data/models';
import { ProductCardComponent } from '../shared/product-card.component';
import { formatCountdown } from './flash-sale-section.util';

/**
 * Homepage flash sale section — time-limited discounted products.
 *
 * Fetches a FlashSale from CatalogService. If the API returns null the section
 * is hidden entirely. While active a countdown timer ticks down to endsAt.
 * When expired the timer shows "Sale ended" but products remain visible.
 */
@Component({
  selector: 'app-flash-sale-section',
  standalone: true,
  imports: [ProductCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container section" aria-labelledby="flash-title">
      @if (loading()) {
        <div class="flash-wrap card">
          <div class="flash-head">
            <div>
              <span class="eyebrow">Limited time</span>
              <h2 id="flash-title">Flash sale</h2>
            </div>
            <div class="skeleton sk-timer"></div>
          </div>
          <div class="grid-4">
            @for (i of [1,2,3,4]; track i) {
              <div class="skeleton sk-card"></div>
            }
          </div>
        </div>
      } @else if (error()) {
        <div class="section-head">
          <div>
            <span class="eyebrow">Limited time</span>
            <h2 id="flash-title">Flash sale</h2>
          </div>
        </div>
        <div class="state-msg">
          <p class="muted">Something went wrong loading this section.</p>
          <button class="btn btn-outline" (click)="retry()">Retry</button>
        </div>
      } @else {
        @if (flashSale(); as sale) {
        <div class="flash-wrap card">
          <div class="flash-head">
            <div>
              <span class="eyebrow">Limited time</span>
              <h2 id="flash-title">Flash sale</h2>
            </div>
            @if (sale.products.length > 0 && ended()) {
              <div class="countdown-ended">Sale ended</div>
            } @else if (sale.products.length > 0) {
              <div class="countdown" aria-live="polite" aria-atomic="true">{{ countdownStr() }}</div>
            }
          </div>
          @if (sale.products.length === 0) {
            <div class="state-msg">
              <p class="muted">No active flash sales right now. Check back soon!</p>
            </div>
          } @else {
            <div class="grid-4">
              @for (p of sale.products; track p.sku) {
                <app-product-card
                  [product]="p"
                  (add)="add.emit($event)"
                  (toggleWishlist)="toggleWishlist.emit($event)"
                  (quickView)="quickView.emit($event)"></app-product-card>
              }
            </div>
          }
        </div>
        }
      }
    </section>
  `,
  styles: [`
    .flash-wrap {
      border: 2px solid var(--sale);
      border-radius: var(--r-lg);
      background: linear-gradient(180deg, var(--danger-soft) 0%, var(--surface) 40%);
      padding: 32px;
    }
    .flash-head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 28px;
      gap: 16px;
    }
    .flash-head h2 {
      margin: 0;
    }
    .countdown {
      font-family: ui-monospace, 'SF Mono', Monaco, 'Cascadia Code', monospace;
      font-size: 28px;
      font-weight: 700;
      color: var(--sale);
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
      line-height: 1;
    }
    .countdown-ended {
      font-family: inherit;
      font-size: 16px;
      font-weight: 600;
      color: var(--ink-2);
      background: var(--surface);
      border: 1px solid var(--line);
      padding: 8px 16px;
      border-radius: var(--r-pill);
    }
    .sk-timer {
      height: 36px;
      width: 180px;
      border-radius: var(--r-md);
    }
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
      .grid-4 { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 560px) {
      .grid-4 { grid-template-columns: 1fr; }
    }
  `]
})
export class FlashSaleSectionComponent implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly destroyRef = inject(DestroyRef);

  readonly flashSale = signal<FlashSale | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly countdownStr = signal('');
  readonly ended = signal(false);

  @Output() add = new EventEmitter<Product>();
  @Output() toggleWishlist = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();

  constructor() {
    this.load();
  }

  ngOnInit(): void {
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.tick());
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.catalog.getFlashSale().subscribe({
      next: (sale) => {
        this.flashSale.set(sale);
        this.loading.set(false);
        if (sale) {
          this.tick();
        }
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  private tick(): void {
    const sale = this.flashSale();
    if (!sale) return;
    const { text, ended } = formatCountdown(sale.endsAt);
    this.countdownStr.set(text);
    this.ended.set(ended);
  }

  retry(): void {
    this.load();
  }
}
