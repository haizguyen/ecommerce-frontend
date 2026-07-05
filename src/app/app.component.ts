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
    `
  ]
})
export class AppComponent implements OnInit {
  private readonly cart = inject(CartService);

  ngOnInit(): void {
    this.cart.seed();
  }
}
