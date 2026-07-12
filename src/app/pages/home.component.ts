import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { CartService } from '../data/cart.service';
import { WishlistService } from '../data/wishlist.service';
import type { Product } from '../data/models';

import { HeroSectionComponent } from '../sections/hero-section.component';
import { SearchSectionComponent } from '../sections/search-section.component';
import { CategoriesSectionComponent } from '../sections/categories-section.component';
import { FeaturedSectionComponent } from '../sections/featured-section.component';
import { BestSellersSectionComponent } from '../sections/best-sellers-section.component';
import { FlashSaleSectionComponent } from '../sections/flash-sale-section.component';
import { RecommendationsSectionComponent } from '../sections/recommendations-section.component';
import { BrandSectionComponent } from '../sections/brand-section.component';
import { TestimonialsSectionComponent } from '../sections/testimonials-section.component';
import { NewsletterSectionComponent } from '../sections/newsletter-section.component';

/**
 * Home / landing page composed entirely of reusable section components.
 *
 * All 10 sections are arranged in DOM order. Event bindings wire product-card
 * actions to the appropriate services and router.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroSectionComponent,
    SearchSectionComponent,
    CategoriesSectionComponent,
    FeaturedSectionComponent,
    BestSellersSectionComponent,
    FlashSaleSectionComponent,
    RecommendationsSectionComponent,
    BrandSectionComponent,
    TestimonialsSectionComponent,
    NewsletterSectionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero-section></app-hero-section>
    <app-search-section></app-search-section>
    <app-categories-section></app-categories-section>
    <app-featured-section
      (add)="onAdd($event)"
      (toggleWishlist)="onToggleWishlist($event)"
      (quickView)="onQuickView($event)"
    ></app-featured-section>
    <app-best-sellers-section
      (add)="onAdd($event)"
      (toggleWishlist)="onToggleWishlist($event)"
      (quickView)="onQuickView($event)"
    ></app-best-sellers-section>
    <app-flash-sale-section
      (add)="onAdd($event)"
      (toggleWishlist)="onToggleWishlist($event)"
      (quickView)="onQuickView($event)"
    ></app-flash-sale-section>
    <app-recommendations-section></app-recommendations-section>
    <app-brand-section></app-brand-section>
    <app-testimonials-section></app-testimonials-section>
    <app-newsletter-section></app-newsletter-section>
  `,
  styles: [``]
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly cart = inject(CartService);
  private readonly wishlist = inject(WishlistService);

  onAdd(product: Product): void {
    this.cart.add(product);
  }

  onToggleWishlist(product: Product): void {
    this.wishlist.toggle(product.sku);
  }

  onQuickView(product: Product): void {
    this.router.navigate(['/products', product.sku]);
  }
}
