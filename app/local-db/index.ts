/** Public surface of the local-first data layer. */

export {
  DB_NAME,
  getDb,
  getClient,
  resetClient,
  isOpfsAvailable,
  type BragDatabase,
} from "./client";
export { nowISO, newId, firstOrNull } from "./helpers";

// Re-export schema (tables, zod insert schemas, row types).
export * from "./schema";

// Re-export the Drizzle query operators used across mutations.
export {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  like,
  lte,
  or,
  sql,
} from "drizzle-orm";
