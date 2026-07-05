import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/** Store footer — brand blurb, navigation columns and a payment/trust strip. */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="ftr">
      <div class="container grid">
        <div class="brand-col">
          <a class="brand" routerLink="/">
            <span class="mark" aria-hidden="true">◆</span> Aurora
          </a>
          <p class="muted">
            Considered gear for the modern desk. Free shipping over $99, 30-day returns.
          </p>
        </div>

        <div class="col">
          <h4>Shop</h4>
          <a routerLink="/products">All products</a>
          <a [routerLink]="['/products']" [queryParams]="{ category: 'audio' }">Audio</a>
          <a [routerLink]="['/products']" [queryParams]="{ category: 'peripherals' }">Peripherals</a>
          <a [routerLink]="['/products']" [queryParams]="{ category: 'displays' }">Displays</a>
        </div>

        <div class="col">
          <h4>Company</h4>
          <a href="#">About</a>
          <a href="#">Sustainability</a>
          <a href="#">Careers</a>
          <a href="#">Contact</a>
        </div>

        <div class="col">
          <h4>Support</h4>
          <a href="#">Shipping</a>
          <a href="#">Returns</a>
          <a href="#">Warranty</a>
          <a href="#">Help center</a>
        </div>
      </div>

      <div class="container strip">
        <span class="muted">© 2026 Aurora Store. A design demo.</span>
        <span class="pays" aria-hidden="true">
          <span>VISA</span><span>MC</span><span>AMEX</span><span>PayPal</span>
        </span>
      </div>
    </footer>
  `,
  styles: [
    `
      .ftr {
        margin-top: 72px;
        border-top: 1px solid var(--line);
        background: var(--surface);
      }
      .grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 40px;
        padding-block: 56px 40px;
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 720;
        font-size: 20px;
        letter-spacing: -0.03em;
        margin-bottom: 12px;
      }
      .mark {
        color: var(--accent);
      }
      .brand-col p {
        max-width: 320px;
        font-size: 14px;
      }
      .col {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .col h4 {
        font-size: 13px;
        letter-spacing: 0.02em;
        margin-bottom: 4px;
      }
      .col a {
        font-size: 14px;
        color: var(--ink-2);
        width: fit-content;
        transition: color var(--dur) var(--ease);
      }
      .col a:hover {
        color: var(--accent);
      }
      .strip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding-block: 22px;
        border-top: 1px solid var(--line);
        font-size: 13px;
      }
      .pays {
        display: flex;
        gap: 8px;
      }
      .pays span {
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.04em;
        color: var(--ink-3);
        border: 1px solid var(--line);
        border-radius: 6px;
      }
      @media (max-width: 860px) {
        .grid {
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
      }
      @media (max-width: 520px) {
        .grid {
          grid-template-columns: 1fr;
        }
        .strip {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `
  ]
})
export class FooterComponent {}
