/**
 * Database bootstrap + self-healing status.
 *
 * Brag's OPFS store allows a single writer at a time. We use the Web Locks API
 * for leader election: the first tab acquires the "brag-db-primary" lock, holds
 * it for its lifetime, and owns the database. Other tabs detect they're
 * secondary and surface a recovery modal instead of fighting over the store —
 * and when the primary tab closes, the queued lock resolves and they reload to
 * take over automatically.
 *
 * If init fails for any other reason (a stuck/orphaned OPFS handle, corruption),
 * the status flips to `error` with reason `stuck`, and the modal offers a
 * one-click reset.
 */
import { ref } from "vue";
import { getDb, resetClient, wipeLocalStorage } from "./client";

export type DbState = "initializing" | "ready" | "error";
export type DbReason = "multitab" | "noisolation" | "stuck" | "unknown";

export const dbState = ref<DbState>("initializing");
export const dbReason = ref<DbReason>("unknown");

async function initDb(): Promise<void> {
  dbState.value = "initializing";
  try {
    await getDb();
    dbState.value = "ready";
    dbReason.value = "unknown";
  } catch (error) {
    console.error("[local-db] initialization failed:", error);
    // OPFS persistence needs the page to be cross-origin isolated. If it isn't
    // (a browser extension or injected toolbar stripping/blocking the COEP
    // context), say so specifically — reset won't help that.
    const isolated =
      typeof window === "undefined" || window.crossOriginIsolated !== false;
    dbReason.value = isolated ? "stuck" : "noisolation";
    dbState.value = "error";
  }
}

/** Run once on boot (see plugins/local-db.client.ts). */
export function bootstrapDb(): void {
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;

  // No Web Locks support → just initialize; stuck failures still show the modal.
  if (!locks) {
    void initDb();
    return;
  }

  let callbackRan = false;
  let becameSecondary = false;

  // Queue an exclusive request. If granted immediately we're the primary tab;
  // if another tab holds it we wait here until they close, then reload.
  void locks.request("brag-db-primary", () => {
    callbackRan = true;
    if (becameSecondary) {
      // We were waiting behind another tab that has now closed — reload to
      // initialize cleanly as the new primary.
      window.location.reload();
      return new Promise<void>(() => {});
    }
    // Primary: init the DB, then hold the lock for the tab's lifetime.
    return initDb().then(() => new Promise<void>(() => {}));
  });

  // If the callback hasn't run shortly, another tab owns the lock → secondary.
  window.setTimeout(() => {
    if (!callbackRan) {
      becameSecondary = true;
      dbReason.value = "multitab";
      dbState.value = "error";
    }
  }, 500);
}

/** Retry initialization without wiping (e.g. after closing other tabs). */
export async function retryDb(): Promise<void> {
  resetClient();
  await initDb();
}

/** One-click recovery: wipe the OPFS store and reload into a clean database. */
export async function resetAndReload(): Promise<void> {
  dbState.value = "initializing";
  await wipeLocalStorage();
  window.location.reload();
}
