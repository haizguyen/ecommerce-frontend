import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './layout/header.component';
import { FooterComponent } from './layout/footer.component';
import { CartService } from './data/cart.service';

/**
 * Root shell: sticky header, routed page content and footer. The cart is seeded
 * once from the API on boot so the header badge is populated immediately.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <a href="#content" class="skip-link">Skip to main content</a>
    <app-header></app-header>
    <main id="content">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      main {
        flex: 1 0 auto;
      }
      .skip-link {
        position: absolute;
        top: -100%;
        left: 8px;
        z-index: 10000;
        background: var(--surface);
        color: var(--ink);
        padding: 8px 16px;
        border-radius: var(--r-md);
        text-decoration: none;
        font-size: 14px;
        font-weight: 600;
      }
      .skip-link:focus {
        top: 8px;
      }
    `
  ]
})
export class AppComponent implements OnInit {
  private readonly cart = inject(CartService);

  ngOnInit(): void {
    this.cart.seed();
  }
}
