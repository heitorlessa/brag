/**
 * Local SQLite database client (SQLocal + Drizzle ORM, OPFS-backed).
 *
 * The single source of truth for all Brag data. Browser-only: there is no
 * server. `getDb()` lazily initializes the client and runs migrations once
 * before returning a ready-to-query Drizzle instance.
 */
import { SQLocalDrizzle } from "sqlocal/drizzle";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";
import { runMigrations } from "./migrate";

export const DB_NAME = "brag.sqlite3";

export type BragDatabase = SqliteRemoteDatabase<typeof schema>;

let client: SQLocalDrizzle | null = null;
let db: BragDatabase | null = null;
let readyPromise: Promise<void> | null = null;

/** Whether OPFS (durable storage) is available in this browser. */
export function isOpfsAvailable(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "storage" in navigator &&
    "getDirectory" in navigator.storage
  );
}

function initClient(): void {
  if (client && db) return;
  client = new SQLocalDrizzle(DB_NAME);
  db = drizzle(client.driver, client.batchDriver, { schema });
}

async function ensureReady(): Promise<void> {
  initClient();
  readyPromise ??= runMigrations(client as SQLocalDrizzle);
  await readyPromise;
}

/** Get the migrated, ready-to-query Drizzle instance. */
export async function getDb(): Promise<BragDatabase> {
  await ensureReady();
  return db as BragDatabase;
}

/** Get the raw SQLocal client (transactions, import/export, raw SQL). */
export async function getClient(): Promise<SQLocalDrizzle> {
  await ensureReady();
  return client as SQLocalDrizzle;
}

/** Drop the in-memory references (used after an import to force a reconnect). */
export function resetClient(): void {
  client = null;
  db = null;
  readyPromise = null;
}
