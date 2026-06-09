/**
 * Initialize the local database on boot (open OPFS + run migrations), then
 * seed sample data once on a brand-new database so the deployed showcase isn't
 * empty. Awaited so the first page render already has data.
 */
import { getDb } from "~/local-db/client";
import { autoSeedIfEmpty } from "~/services/seed";

export default defineNuxtPlugin(async () => {
  try {
    await getDb();
    await autoSeedIfEmpty();
  } catch (error) {
    console.error("[local-db] Failed to initialize:", error);
  }
});
