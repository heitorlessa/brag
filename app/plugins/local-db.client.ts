/**
 * Initialize the local database on boot (open OPFS + run migrations) so the
 * first page render is ready to query. Demo data is no longer auto-seeded — a
 * first-time visitor loads it in one click from the dashboard (see
 * useDemoData / services/seed).
 */
import { getDb } from "~/local-db/client";

export default defineNuxtPlugin(async () => {
  try {
    await getDb();
  } catch (error) {
    console.error("[local-db] Failed to initialize:", error);
  }
});
