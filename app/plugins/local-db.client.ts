/**
 * Warm the local database on boot (open OPFS + run migrations) so the first
 * query is fast. Intentionally NON-blocking: if init is slow or hangs (e.g. a
 * misconfigured host where the page isn't cross-origin isolated and SQLocal's
 * worker can't initialize), the app must still mount. Pages await `getDb()`
 * themselves and render their own loading/empty states, so correctness never
 * depends on this finishing first — but blocking app mount here would blank the
 * whole SPA.
 */
import { getDb } from "~/local-db/client";

export default defineNuxtPlugin(() => {
  void getDb().catch((error) => {
    console.error("[local-db] Failed to initialize:", error);
  });
});
