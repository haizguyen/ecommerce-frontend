import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Homepage search bar — prominent input below the hero.
 * Navigates to /products?q=<query> on Enter.
 */
@Component({
  selector: 'app-search-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section role="search" class="search-section">
      <div class="search-inner">
        <svg
          class="search-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          #searchInput
          type="search"
          class="search-input"
          placeholder="Search 100+ products…"
          aria-label="Search products"
          autofocus
          (keydown.enter)="search()" />
      </div>
    </section>
  `,
  styles: [
    `
      .search-section {
        padding-block: 28px;
      }
      .search-inner {
        position: relative;
        max-width: 640px;
        margin-inline: auto;
      }
      .search-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        translate: 0 -50%;
        color: var(--ink-3);
        pointer-events: none;
      }
      .search-input {
        display: block;
        width: 100%;
        padding: 16px 20px 16px 48px;
        font-size: 18px;
        border: 1px solid var(--line);
        border-radius: var(--r-lg);
        background: var(--surface);
        color: var(--ink-1);
        outline: none;
        transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
      }
      .search-input::placeholder {
        color: var(--ink-3);
      }
      .search-input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
      }
      .search-input::-webkit-search-decoration,
      .search-input::-webkit-search-cancel-button {
        display: none;
      }
    `
  ]
})
export class SearchSectionComponent {
  private readonly router = inject(Router);
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  /** Handle Enter key — navigate to /products?q=<query> if non-empty. */
  search(): void {
    const input = this.searchInput()?.nativeElement;
    if (!input) return;
    const q = input.value.trim();
    if (q) {
      this.router.navigate(['/products', { q }]);
    }
  }
}
