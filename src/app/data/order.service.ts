import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { Order, PlaceOrderResponse } from './models';

/**
 * Order data access. POST /api/orders acknowledges immediately; the inventory
 * read-model reflects the decrement a moment later (eventual consistency), which
 * the product page polls for. Order history comes from GET /api/orders.
 */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);

  placeOrder(sku: string, quantity: number): Observable<PlaceOrderResponse> {
    return this.http.post<PlaceOrderResponse>('/api/orders', { sku, quantity });
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>('/api/orders');
  }
}
