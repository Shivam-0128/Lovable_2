/** Format a Date as YYYY-MM-DD using the local calendar. */
export function toDayString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Last 7 days including today, newest first. */
export function lastSevenDays(today: Date = new Date()): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    return toDayString(d);
  });
}

/** Days in a row, counting back from the most recent completed day. */
export function currentStreak(days: string[]): number {
  if (days.length === 0) return 0;
  const set = new Set(days);
  const sorted = [...set].sort();
  const [y, m, d] = sorted[sorted.length - 1].split("-").map(Number);
  let cursor = new Date(y, m - 1, d);
  let streak = 0;
  while (set.has(toDayString(cursor))) {
    streak++;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  }
  return streak;
}
