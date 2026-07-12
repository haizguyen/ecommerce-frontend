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
          <div class="social-row">
            <a href="#" aria-label="Twitter / X" class="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" aria-label="Instagram" class="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="#" aria-label="GitHub" class="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
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
      .social-row {
        display: flex;
        gap: 12px;
        margin-top: 20px;
      }
      .social-link {
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        border-radius: var(--r-pill);
        color: var(--ink-2);
        transition: color var(--dur) var(--ease), background var(--dur) var(--ease);
      }
      .social-link:hover {
        color: var(--accent);
        background: var(--accent-soft);
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
