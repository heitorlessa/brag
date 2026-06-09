/** Small shared helpers for the data layer. */

/** Current timestamp as an ISO-8601 string. */
export function nowISO(): string {
  return new Date().toISOString();
}

/** A fresh random id for a new row. */
export function newId(): string {
  return crypto.randomUUID();
}

/** First row of a result set, or null when empty. */
export function firstOrNull<T>(rows: T[]): T | null {
  return rows[0] ?? null;
}
