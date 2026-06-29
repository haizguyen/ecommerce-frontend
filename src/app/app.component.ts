import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { canOrder, hasDecremented } from './quantity.util';

interface InventoryItem {
  sku: string;
  name?: string;
  stock: number;
}

interface Product {
  sku: string;
  stock: number | null;
  status: string;
  placing: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="store">
      <h1>Widget store — live stock</h1>

      <div class="card search" data-testid="search">
        <input
          type="text"
          placeholder="Search by name or SKU…"
          data-testid="search-input"
          [(ngModel)]="query"
          (ngModelChange)="onSearchChange($event)" />

        <ul *ngIf="results.length > 0" data-testid="search-results">
          <li *ngFor="let r of results" [attr.data-testid]="'search-result-' + r.sku">
            <span>{{ r.name || r.sku }}</span>
            <span class="sku">{{ r.sku }} · {{ r.stock }} in stock</span>
          </li>
        </ul>
        <div *ngIf="searched && results.length === 0" class="empty" data-testid="search-empty">
          No products match "{{ query }}".
        </div>
      </div>

      <div class="card" *ngFor="let p of products" [attr.data-testid]="'card-' + p.sku">
        <div class="stock" [attr.data-testid]="'stock-' + p.sku">{{ p.stock ?? '—' }}</div>
        <div class="sku" [attr.data-testid]="'sku-' + p.sku">{{ p.sku }}</div>

        <button
          [attr.data-testid]="'place-order-' + p.sku"
          [disabled]="p.placing || (p.stock !== null && !canOrder(p.stock, 1))"
          (click)="placeOrder(p)">
          {{ p.placing ? 'Placing…' : 'Place order (qty 1)' }}
        </button>

        <div class="status" [attr.data-testid]="'status-' + p.sku">{{ p.status }}</div>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  readonly products: Product[] = [
    { sku: 'SKU-001', stock: null, status: '', placing: false },
    { sku: 'SKU-002', stock: null, status: '', placing: false }
  ];

  query = '';
  results: InventoryItem[] = [];
  searched = false;

  // Expose the tested helper to the template.
  readonly canOrder = canOrder;

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.products.forEach((p) => this.loadStock(p));
  }

  onSearchChange(value: string): void {
    const q = (value ?? '').trim();
    if (q.length === 0) {
      this.results = [];
      this.searched = false;
      return;
    }
    const params = new HttpParams().set('q', q);
    this.http.get<InventoryItem[]>('/api/inventory/search', { params }).subscribe({
      next: (items) => {
        this.results = items;
        this.searched = true;
      },
      error: () => {
        this.results = [];
        this.searched = true;
      }
    });
  }

  loadStock(p: Product): void {
    this.http.get<InventoryItem>(`/api/inventory/${p.sku}`).subscribe({
      next: (item) => (p.stock = item.stock),
      error: () => (p.status = 'Could not load stock')
    });
  }

  placeOrder(p: Product): void {
    if (p.placing) return;
    const before = p.stock;
    p.placing = true;
    p.status = 'Placing order…';

    this.http.post(`/api/orders`, { sku: p.sku, quantity: 1 }).subscribe({
      next: () => {
        p.status = 'Order placed — waiting for inventory to update…';
        this.pollUntilDecremented(p, before, 30);
      },
      error: () => {
        p.placing = false;
        p.status = 'Order failed';
      }
    });
  }

  /**
   * Eventual consistency: the stock drops only after the OrderPlaced message
   * travels through Service Bus and inventory-service updates its DB. Poll the
   * read model until it reflects the change (no fixed sleep).
   */
  private pollUntilDecremented(p: Product, before: number | null, attemptsLeft: number): void {
    if (attemptsLeft <= 0) {
      p.placing = false;
      p.status = 'Timed out waiting for stock update';
      return;
    }

    this.http.get<InventoryItem>(`/api/inventory/${p.sku}`).subscribe({
      next: (item) => {
        if (hasDecremented(before, item.stock)) {
          p.stock = item.stock;
          p.placing = false;
          p.status = 'Stock updated ✔';
        } else {
          setTimeout(() => this.pollUntilDecremented(p, before, attemptsLeft - 1), 1000);
        }
      },
      error: () => setTimeout(() => this.pollUntilDecremented(p, before, attemptsLeft - 1), 1000)
    });
  }
}
