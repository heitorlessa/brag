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

/**
 * Reject after `ms` so a blocked storage worker (e.g. a stale tab loaded before
 * the cross-origin headers were fixed) surfaces an error instead of hanging
 * forever — callers can show "reload" guidance rather than spinning.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          "Database initialization timed out — the storage worker may be blocked. Reload the page."
        )
      );
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

async function ensureReady(): Promise<void> {
  initClient();
  readyPromise ??= withTimeout(runMigrations(client as SQLocalDrizzle), 15000);
  try {
    await readyPromise;
  } catch (error) {
    // Allow a later call (e.g. after a reload) to retry instead of caching the
    // failure forever.
    readyPromise = null;
    throw error;
  }
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
