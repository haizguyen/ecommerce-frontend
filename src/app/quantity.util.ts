/** Framework-free helpers used by the order form. Unit tested via Jest. */

export function clampQuantity(value: number, max: number): number {
  if (Number.isNaN(value) || value < 1) return 1;
  if (value > max) return max;
  return Math.floor(value);
}

export function canOrder(stock: number, quantity: number): boolean {
  return stock > 0 && quantity > 0 && quantity <= stock;
}

/**
 * Eventual-consistency predicate for the order poll loop: true once the read
 * model reflects a drop from the value observed before the order. When the
 * "before" value is unknown (null), any reading counts as updated.
 */
export function hasDecremented(before: number | null, current: number): boolean {
  return before === null || current < before;
}
