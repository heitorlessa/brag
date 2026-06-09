/**
 * Date helpers. All week math is done in UTC on date-only (YYYY-MM-DD) values
 * to stay free of timezone drift — weeks are Monday-started (ISO).
 */

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1));
}

/** Format a Date as a YYYY-MM-DD string (UTC). */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Today as YYYY-MM-DD (local calendar day). */
export function today(): string {
  const now = new Date();
  return toISODate(
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  );
}

/** The Monday (ISO week start) of the week containing the given date. */
export function isoWeekStart(input: string | Date): string {
  const base =
    typeof input === "string"
      ? parseDateOnly(input)
      : new Date(
          Date.UTC(input.getFullYear(), input.getMonth(), input.getDate())
        );
  const dayOfWeek = base.getUTCDay(); // 0 = Sunday … 6 = Saturday
  const sinceMonday = (dayOfWeek + 6) % 7;
  base.setUTCDate(base.getUTCDate() - sinceMonday);
  return toISODate(base);
}

/** ISO week start for the current week. */
export function currentWeekStart(): string {
  return isoWeekStart(new Date());
}

/** Shift a week-start date by N weeks (negative = earlier). */
export function addWeeks(weekStart: string, weeks: number): string {
  const date = parseDateOnly(weekStart);
  date.setUTCDate(date.getUTCDate() + weeks * 7);
  return toISODate(date);
}

/** Human label for a week, e.g. "Jun 9 – 15, 2026". */
export function formatWeekLabel(weekStart: string): string {
  const start = parseDateOnly(weekStart);
  const end = parseDateOnly(addWeeks(weekStart, 1));
  end.setUTCDate(end.getUTCDate() - 1);
  const monthDay = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  const startLabel = monthDay.format(start);
  const endLabel = (
    sameMonth
      ? new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone: "UTC" })
      : monthDay
  ).format(end);
  return `${startLabel} – ${endLabel}, ${end.getUTCFullYear()}`;
}

/** Friendly date label, e.g. "Jun 9, 2026". Empty input → "". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = iso.length <= 10 ? parseDateOnly(iso) : new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** The current calendar year. */
export function currentYear(): number {
  return new Date().getFullYear();
}
