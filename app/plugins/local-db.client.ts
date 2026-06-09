/**
 * Boot the local database. Uses tab leader-election + self-healing status so a
 * stuck store or a second open tab surfaces a recovery modal instead of
 * hanging. Non-blocking: the app always mounts (see local-db/bootstrap.ts).
 */
import { bootstrapDb } from "~/local-db/bootstrap";

export default defineNuxtPlugin(() => {
  bootstrapDb();
});
