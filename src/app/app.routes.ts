import { Routes } from '@angular/router';

/**
 * Application routes. Pages are lazily loaded so each screen is its own bundle
 * and the initial payload stays small.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent),
    title: 'Aurora Store — Considered gear for your desk',
    data: { animation: 'HomePage' }
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/product-list.component').then((m) => m.ProductListComponent),
    title: 'Shop — Aurora Store',
    data: { animation: 'ProductsPage' }
  },
  {
    path: 'products/:sku',
    loadComponent: () =>
      import('./pages/product-detail.component').then((m) => m.ProductDetailComponent),
    title: 'Product — Aurora Store',
    data: { animation: 'ProductDetailPage' }
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart.component').then((m) => m.CartComponent),
    title: 'Your cart — Aurora Store',
    data: { animation: 'CartPage' }
  },
  { path: '**', redirectTo: '' }
];
