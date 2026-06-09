/**
 * Warm the local database (open OPFS + run migrations) as soon as the app
 * boots, so the first navigation doesn't pay the init cost. Non-blocking:
 * composables still await `getDb()` themselves, so correctness never depends
 * on this plugin finishing first.
 */
import { getDb } from "~/local-db/client";

export default defineNuxtPlugin(() => {
  void getDb().catch((error) => {
    console.error("[local-db] Failed to initialize:", error);
  });
});
