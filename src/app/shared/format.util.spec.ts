import { formatPrice, stockLevel, stockLabel, formatDate } from './format.util';

describe('formatPrice', () => {
  it('formats known currencies with a symbol and two decimals', () => {
    expect(formatPrice(199.9, 'AUD')).toBe('$199.90');
    expect(formatPrice(129, 'AUD')).toBe('$129.00');
    expect(formatPrice(5, 'EUR')).toBe('€5.00');
  });

  it('falls back to the ISO code for unknown currencies', () => {
    expect(formatPrice(10, 'JPY')).toBe('JPY 10.00');
  });

  it('treats non-finite amounts as zero', () => {
    expect(formatPrice(NaN, 'AUD')).toBe('$0.00');
  });
});

describe('stockLevel / stockLabel', () => {
  it('classifies out of stock', () => {
    expect(stockLevel(0)).toBe('out');
    expect(stockLabel(0)).toBe('Out of stock');
  });

  it('classifies low stock at or below the threshold', () => {
    expect(stockLevel(1)).toBe('low');
    expect(stockLevel(5)).toBe('low');
    expect(stockLabel(3)).toBe('Only 3 left');
  });

  it('classifies healthy stock above the threshold', () => {
    expect(stockLevel(6)).toBe('in');
    expect(stockLabel(42)).toBe('In stock');
  });
});

describe('formatDate', () => {
  it('formats an ISO timestamp as a short date', () => {
    expect(formatDate('2026-07-01T09:15:00.000Z')).toBe('1 Jul 2026');
  });

  it('returns empty string for invalid input', () => {
    expect(formatDate('not-a-date')).toBe('');
  });
});
