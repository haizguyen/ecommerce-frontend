import type { Category } from './types';

/** Category fixtures. `productCount` mirrors PRODUCTS grouping for realism. */
export const CATEGORIES: Category[] = [
  { id: 'audio', name: 'Audio', slug: 'audio', productCount: 2 },
  { id: 'peripherals', name: 'Peripherals', slug: 'peripherals', productCount: 2 },
  { id: 'displays', name: 'Displays', slug: 'displays', productCount: 1 },
  { id: 'accessories', name: 'Accessories', slug: 'accessories', productCount: 1 },
  // Empty category — lets designers review the "no products in this category" state.
  { id: 'wearables', name: 'Wearables', slug: 'wearables', productCount: 0 }
];
