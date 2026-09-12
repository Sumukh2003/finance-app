export type CurrencyCode =
  | "INR"
  | "USD"
  | "EUR"
  | "GBP"
  | "AUD"
  | "CAD"
  | "SGD"
  | "JPY";

const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  AUD: "en-AU",
  CAD: "en-CA",
  SGD: "en-SG",
  JPY: "ja-JP",
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AUD: "A$",
  CAD: "C$",
  SGD: "S$",
  JPY: "¥",
};

// Intl.NumberFormat construction is comparatively expensive; reuse instances.
const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(
  currency: CurrencyCode,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = `${currency}:${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency] ?? "en-US", {
      style: "currency",
      currency,
      ...options,
    });
    formatterCache.set(key, formatter);
  }

  return formatter;
}

/**
 * Formats an amount as currency.
 *
 * Fractional digits default to "hide them when the amount is whole", which
 * keeps dashboards readable without rounding away real cents.
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "INR",
  options: { compact?: boolean; showDecimals?: boolean } = {},
): string {
  const value = Number.isFinite(amount) ? amount : 0;
  const showDecimals = options.showDecimals ?? !Number.isInteger(value);

  return getFormatter(currency, {
    notation: options.compact ? "compact" : "standard",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(value);
}

export function formatNumber(value: number, locale = "en-IN"): string {
  return new Intl.NumberFormat(locale).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number, fractionDigits = 1): string {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(fractionDigits).replace(/\.0+$/, "")}%`;
}

/**
 * Percentage change from `previous` to `current`.
 *
 * Returns `null` when there is no baseline — "infinite growth" is not a useful
 * thing to render, and 0 would be a lie.
 */
export function percentChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Formats a stored calendar date.
 *
 * Rendered in UTC because that is the frame the date was stored in. Formatting
 * in the viewer's timezone shifts a date stored as midnight UTC back a day for
 * anyone west of GMT, so an entry dated the 12th would display as the 11th.
 */
export function formatDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", ...options }).format(date);
}

/** Human-friendly relative time: "today", "3 days ago", or a date past a week. */
export function formatRelativeDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  // Compare calendar dates, not elapsed milliseconds: 23 hours ago can still
  // be "yesterday", and 1 hour ago can already be "today".
  const startOfToday = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate(),
  );
  const startOfValue = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  const days = Math.round((startOfToday - startOfValue) / 86_400_000);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days > 1 && days < 7) return `${days} days ago`;
  if (days === -1) return "Tomorrow";
  if (days < -1 && days > -7) return `In ${Math.abs(days)} days`;

  return formatDate(date);
}

/** "2026-03" → "March 2026". */
export function formatMonthLabel(month: string): string {
  const date = new Date(`${month}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return month;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Short axis label for charts: "2026-03" → "Mar 26". */
export function formatMonthShort(month: string): string {
  const date = new Date(`${month}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return month;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "UTC",
    month: "short",
    year: "2-digit",
  }).format(date);
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts.at(-1)![0]}`.toUpperCase();
}
