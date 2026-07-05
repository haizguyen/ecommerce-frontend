/**
 * Framework-free formatting helpers. Pure and unit-tested via Jest
 * (`*.util.spec.ts`) so they need no browser or Angular.
 */

/** Currency symbols for the currencies used by the fixtures. */
const CURRENCY_SYMBOLS: Record<string, string> = {
  AUD: '$',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

/**
 * Format a decimal amount as a price string, e.g. formatPrice(199.9, 'AUD')
 * → "$199.90". Unknown currencies fall back to the ISO code as a prefix.
 */
export function formatPrice(amount: number, currency: string): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  return `${symbol}${safe.toFixed(2)}`;
}

/**
 * Human stock label + severity for badges.
 *   stock <= 0            → out of stock
 *   0 < stock <= lowAt    → low stock
 *   otherwise             → in stock
 */
export type StockLevel = 'out' | 'low' | 'in';

export function stockLevel(stock: number, lowAt = 5): StockLevel {
  if (stock <= 0) return 'out';
  if (stock <= lowAt) return 'low';
  return 'in';
}

export function stockLabel(stock: number, lowAt = 5): string {
  switch (stockLevel(stock, lowAt)) {
    case 'out':
      return 'Out of stock';
    case 'low':
      return `Only ${stock} left`;
    default:
      return 'In stock';
  }
}

/** Format an ISO timestamp as a short date, e.g. "1 Jul 2026". Empty on bad input. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const day = date.getUTCDate();
  const month = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ][date.getUTCMonth()];
  return `${day} ${month} ${date.getUTCFullYear()}`;
}
