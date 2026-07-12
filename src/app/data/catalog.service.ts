import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { Brand, Category, FlashSale, InventoryItem, NewsletterResponse, Product, Testimonial } from './models';

/**
 * Catalog data-access layer.
 *
 * The single place the UI reads the product catalogue, categories and live
 * inventory. Components depend on this service, never on HttpClient directly, so
 * the mock→real API swap is entirely contained here (the URLs already point at
 * the `/api` gateway the mock interceptor and the real backend both answer).
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  /** All products in the catalogue (with live stock). */
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products');
  }

  /** A single product by SKU. */
  getProduct(sku: string): Observable<Product> {
    return this.http.get<Product>(`/api/products/${encodeURIComponent(sku)}`);
  }

  /** All categories (with product counts). */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>('/api/categories');
  }

  /** Live inventory read-model for one SKU (drives stock/order UI). */
  getInventoryItem(sku: string): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`/api/inventory/${encodeURIComponent(sku)}`);
  }

  /** Server-side inventory search by name or SKU. */
  searchInventory(query: string): Observable<InventoryItem[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<InventoryItem[]>('/api/inventory/search', { params });
  }

  /** Products tagged as best sellers. */
  getBestSellers(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products/best-sellers');
  }

  /** Current flash sale with discounted products, or null if none active. */
  getFlashSale(): Observable<FlashSale | null> {
    return this.http.get<FlashSale | null>('/api/products/flash-sale');
  }

  /** Customer testimonials for the homepage. */
  getTestimonials(): Observable<Testimonial[]> {
    return this.http.get<Testimonial[]>('/api/testimonials');
  }

  /** Brand logos for the brand strip. */
  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>('/api/brands');
  }

  /** Subscribe an email address to the newsletter. */
  subscribeToNewsletter(email: string): Observable<NewsletterResponse> {
    return this.http.post<NewsletterResponse>('/api/newsletter/subscribe', { email });
  }
}
