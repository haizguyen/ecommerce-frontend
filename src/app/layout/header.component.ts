import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { CartService } from '../data/cart.service';
import { ThemeService } from '../data/theme.service';

/**
 * Sticky store header: brand, primary nav, catalogue search and the live cart
 * badge (bound to CartService's signal count). The search box submits to the
 * product-list route as a `q` query param, keeping search state in the URL.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="hdr">
      <div class="container bar">
        <a class="brand" routerLink="/" aria-label="Aurora home">
          <span class="mark" aria-hidden="true">◆</span>
          <span class="word">Aurora</span>
        </a>

        <nav class="nav" aria-label="Primary">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
            >Home</a
          >
          <a routerLink="/products" routerLinkActive="active">Shop</a>
        </nav>

        <form class="search" role="search" (ngSubmit)="submitSearch()">
          <svg class="ico" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round" />
          </svg>
          <input
            class="search-input"
            type="search"
            name="q"
            placeholder="Search products…"
            aria-label="Search products"
            data-testid="search-input"
            [(ngModel)]="query" />
        </form>

        <div class="actions">
          <button
            class="theme-btn"
            (click)="theme.toggle()"
            [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
            data-testid="theme-toggle">
            @if (theme.isDark()) {
              <!-- Sun icon -->
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="1.8"/>
                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
                      fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            } @else {
              <!-- Moon icon -->
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"
                      fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            }
          </button>

          <a class="cart" routerLink="/cart" aria-label="Cart" data-testid="cart-link">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 6h15l-1.5 9h-12z M6 6L5 3H2 M9 20a1 1 0 11-2 0 1 1 0 012 0z M19 20a1 1 0 11-2 0 1 1 0 012 0z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            @if (cart.count() > 0) {
              <span class="count" data-testid="cart-count">{{ cart.count() }}</span>
            }
          </a>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .hdr {
        position: sticky;
        top: 0;
        z-index: 50;
        background: var(--surface); /* fallback for older browsers */
        background: color-mix(in srgb, var(--surface) 80%, transparent);
        backdrop-filter: blur(16px);
        border-bottom: 1px solid var(--line);
      }
      .bar {
        height: var(--header-h);
        display: flex;
        align-items: center;
        gap: 24px;
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        font-weight: 720;
        font-size: 19px;
        letter-spacing: -0.03em;
      }
      .mark {
        color: var(--accent);
        font-size: 16px;
      }
      .nav {
        display: flex;
        gap: 6px;
      }
      .nav a {
        padding: 8px 12px;
        border-radius: var(--r-pill);
        font-weight: 550;
        font-size: 14px;
        color: var(--ink-2);
        transition: color var(--dur) var(--ease), background var(--dur) var(--ease);
      }
      .nav a:hover {
        color: var(--ink);
        background: var(--surface-2);
      }
      .nav a.active {
        color: var(--ink);
        background: var(--surface-2);
      }
      .search {
        position: relative;
        flex: 1;
        max-width: 460px;
        margin-inline: auto;
      }
      .search .ico {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        width: 17px;
        height: 17px;
        color: var(--ink-3);
        pointer-events: none;
      }
      .search-input {
        width: 100%;
        padding: 10px 16px 10px 40px;
        font-size: 14px;
        font-family: inherit;
        color: var(--ink);
        background: var(--surface-2);
        border: 1px solid var(--line);
        border-radius: var(--r-pill);
        transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease),
          background var(--dur) var(--ease);
      }
      .search-input::placeholder {
        color: var(--ink-3);
      }
      .search-input:focus {
        outline: none;
        background: var(--surface);
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-soft);
      }
      .actions {
        display: flex;
        align-items: center;
      }
      .cart {
        position: relative;
        display: grid;
        place-items: center;
        width: 42px;
        height: 42px;
        border-radius: var(--r-pill);
        color: var(--ink);
        transition: background var(--dur) var(--ease);
      }
      .cart:hover {
        background: var(--surface-2);
      }
      .cart svg {
        width: 22px;
        height: 22px;
      }
      .count {
        position: absolute;
        top: 2px;
        right: 2px;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        display: grid;
        place-items: center;
        font-size: 11px;
        font-weight: 700;
        color: #fff;
        background: var(--accent);
        border: 2px solid var(--surface);
        border-radius: var(--r-pill);
      }
      .theme-btn {
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        padding: 0;
        border: none;
        border-radius: var(--r-pill);
        background: transparent;
        color: var(--ink-2);
        cursor: pointer;
        transition: color var(--dur) var(--ease), background var(--dur) var(--ease);
      }
      .theme-btn:hover {
        color: var(--ink);
        background: var(--surface-2);
      }
      .theme-btn svg {
        width: 18px;
        height: 18px;
      }
      @media (max-width: 720px) {
        .nav {
          display: none;
        }
        .bar {
          gap: 14px;
        }
      }
    `
  ]
})
export class HeaderComponent {
  readonly cart = inject(CartService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  query = '';

  submitSearch(): void {
    const q = this.query.trim();
    this.router.navigate(['/products'], { queryParams: q ? { q } : {} });
  }
}
