/**
 * Date helpers. All month and day arithmetic goes through these.
 *
 * A transaction date is a *calendar date*, not an instant: "I spent this on the
 * 12th" means the 12th wherever the user is, and must not drift because the
 * server sits in a different timezone.
 *
 * So dates are stored as UTC midnight of that calendar date, and every boundary
 * here is computed in UTC to match. The functions that answer "what is today
 * for the person looking at the screen" - `currentMonth`, `toMonthKey`,
 * `toDateInputValue` - stay local on purpose; they read the viewer's clock and
 * hand the resulting calendar date to the UTC-based machinery.
 */

export function currentMonth(): string {
  return toMonthKey(new Date());
}

export function toMonthKey(date: Date): string {
  // Built from local parts rather than `toISOString()`, which shifts to UTC and
  // can report the previous month for dates early in the month east of GMT.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function isValidMonth(month: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

/**
 * Inclusive start / exclusive end of the given `YYYY-MM`, in UTC.
 *
 * UTC rather than local because that is how dates are stored. Computing the
 * boundary locally on an IST server put anything recorded on the 1st into the
 * previous month, and disagreed with the trend aggregation, which Mongo buckets
 * in UTC — the same screen reported two different totals for one month.
 */
export function monthRange(month: string): { start: Date; end: Date } {
  const [year, monthIndex] = month.split("-").map(Number) as [number, number];
  const start = new Date(Date.UTC(year, monthIndex - 1, 1));
  const end = new Date(Date.UTC(year, monthIndex, 1));
  return { start, end };
}

/**
 * Normalises an instant to UTC midnight of its calendar date.
 *
 * This is the canonical storage form for a transaction date.
 */
export function toCalendarDate(value: Date): Date {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
}

/** The last representable millisecond of a calendar date, in UTC. */
export function endOfCalendarDate(value: Date): Date {
  const start = toCalendarDate(value);
  return new Date(start.getTime() + 86_400_000 - 1);
}

export function shiftMonth(month: string, delta: number): string {
  const [year, monthIndex] = month.split("-").map(Number) as [number, number];
  return toMonthKey(new Date(year, monthIndex - 1 + delta, 1));
}

export function previousMonth(month: string): string {
  return shiftMonth(month, -1);
}

/** The `n` months ending at `month`, oldest first. */
export function lastNMonths(month: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => shiftMonth(month, i - count + 1));
}

/** `YYYY-MM-DD` in local time, for `<input type="date">`. */
export function toDateInputValue(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
