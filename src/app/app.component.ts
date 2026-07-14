import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

import { HeaderComponent } from './layout/header.component';
import { FooterComponent } from './layout/footer.component';
import { CartService } from './data/cart.service';
import { routeAnimations } from './animations';

/**
 * Root shell: sticky header, routed page content and footer. The cart is seeded
 * once from the API on boot so the header badge is populated immediately.
 *
 * Route transitions (fade + slide-up 150ms) are disabled when the user prefers
 * reduced motion.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  animations: [routeAnimations],
  template: `
    <a href="#content" class="skip-link">Skip to main content</a>
    <app-header></app-header>
    <main id="content" tabindex="-1">
      <div [@.disabled]="animationsDisabled">
        <div [@routeAnimations]="getRouteAnimation(outlet)">
          <router-outlet #outlet="outlet"></router-outlet>
        </div>
      </div>
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
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly animationsDisabled =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  ngOnInit(): void {
    this.cart.seed();
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        document.getElementById('content')?.focus({ preventScroll: true });
        // Scroll to top so the new page starts at the top.
        window.scrollTo(0, 0);
      });
  }

  getRouteAnimation(outlet: RouterOutlet): string {
    return outlet?.activatedRouteData?.['animation'] ?? '';
  }
}
