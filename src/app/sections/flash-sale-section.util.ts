/**
 * Pure countdown formatter — converts an ISO end timestamp into a
 * display string and ended-flag.
 *
 * Format rules:
 *  - diff <= 0      → 'Ended' / ended: true
 *  - totalHours <= 24 → 'HH:MM:SS'  (e.g. '24:00:00')
 *  - totalHours > 24  → 'D:HH:MM:SS' (e.g. '2:12:30:00')
 */
export function formatCountdown(endsAt: string): { text: string; ended: boolean } {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return { text: 'Ended', ended: true };
  const totalHours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);
  if (totalHours > 24) {
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return {
      text: `${days}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      ended: false,
    };
  }
  return {
    text: `${String(totalHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    ended: false,
  };
}
