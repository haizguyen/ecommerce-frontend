import { clampQuantity, canOrder, hasDecremented } from './quantity.util';

describe('clampQuantity', () => {
  it('floors to 1 for invalid or low values', () => {
    expect(clampQuantity(0, 10)).toBe(1);
    expect(clampQuantity(-5, 10)).toBe(1);
    expect(clampQuantity(NaN, 10)).toBe(1);
  });

  it('caps at max', () => {
    expect(clampQuantity(99, 10)).toBe(10);
  });

  it('passes through valid integer values', () => {
    expect(clampQuantity(3, 10)).toBe(3);
    expect(clampQuantity(3.7, 10)).toBe(3);
  });
});

describe('canOrder', () => {
  it('allows ordering within stock', () => {
    expect(canOrder(10, 2)).toBe(true);
  });

  it('blocks when out of stock or over-ordering', () => {
    expect(canOrder(0, 1)).toBe(false);
    expect(canOrder(5, 6)).toBe(false);
  });
});

describe('hasDecremented', () => {
  it('is true once the reading drops below the before value', () => {
    expect(hasDecremented(10, 9)).toBe(true);
  });

  it('is false while the reading has not dropped', () => {
    expect(hasDecremented(10, 10)).toBe(false);
    expect(hasDecremented(10, 11)).toBe(false);
  });

  it('treats an unknown before value as already updated', () => {
    expect(hasDecremented(null, 5)).toBe(true);
  });
});
