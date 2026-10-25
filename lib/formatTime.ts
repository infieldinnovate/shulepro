// Relative-time and date formatting helpers. Locale-aware via Intl; no
// external date library required for these presentational labels.

type DateInput = Date | string | number | undefined | null;

const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
});

const DIVISIONS: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

/**
 * Format a timestamp (epoch ms or ISO string) as a relative label,
 * e.g. "3 minutes ago", "in 2 days". Returns an empty string for
 * invalid input.
 */
export function formatRelativeTime(timestamp: DateInput): string {
  const date = toDate(timestamp);
  if (!date) return "";

  let duration = (date.getTime() - Date.now()) / 1000;
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return RELATIVE_FORMATTER.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return "";
}

/**
 * Format a timestamp as an absolute date-time string suitable for
 * a `title`/`datetime` attribute on a <time> element.
 */
export function formatAbsolute(timestamp: DateInput): string {
  const date = toDate(timestamp);
  if (!date) return "";
  return date.toLocaleString();
}

/**
 * Format a date as a calendar-style string using the default locale
 * date format (no time component). Returns an empty string for
 * invalid input.
 */
export function formatDate(timestamp: DateInput): string {
  const date = toDate(timestamp);
  if (!date) return "";
  return date.toLocaleDateString();
}

/**
 * Format a date with a medium-length month, e.g. "5 Mar 2026".
 */
export function formatDateMedium(timestamp: DateInput): string {
  const date = toDate(timestamp);
  if (!date) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date with a long month name, e.g. "5 March 2026".
 */
export function formatDateLong(timestamp: DateInput): string {
  const date = toDate(timestamp);
  if (!date) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toDate(value: DateInput): Date | null {
  if (value === undefined || value === null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
