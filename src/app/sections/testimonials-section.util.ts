/**
 * Returns the first 2 uppercase characters from an author name.
 *
 * - For multi-word names, uses the first letter of the first two words.
 *   Example: "Sarah Chen" → "SC"
 * - For single-word names, uses the first 2 characters uppercased.
 *   Example: "Jamie" → "JA"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
