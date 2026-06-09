import { useStorage } from "@vueuse/core";
import { DEMO_PREFIX, removeDemoData, seedDemoData } from "~/services/seed";

/** Whether a row id belongs to the demo dataset. */
function isDemoRow(id: string): boolean {
  return id.startsWith(DEMO_PREFIX);
}

/**
 * Demo-data controls shared by the dashboard cue and Settings.
 *
 * - `load()` seeds the demo dataset; `remove()` deletes only the demo rows.
 * - Both reload the page afterwards so every module's resource picks up the
 *   change (mirrors how Settings handles backup import).
 * - `dismissed` hides the first-run "load demo data" cue once, persisted in
 *   localStorage so it never nags again on this browser.
 * - `isDemoRow(id)` lets a view tell demo rows apart from the user's own.
 */
export function useDemoData() {
  const dismissed = useStorage("brag:demo-cue-dismissed", false);
  const busy = ref(false);

  async function load(): Promise<void> {
    busy.value = true;
    try {
      await seedDemoData();
      window.location.reload();
    } catch (error) {
      busy.value = false;
      throw error;
    }
  }

  async function remove(): Promise<void> {
    busy.value = true;
    try {
      await removeDemoData();
      window.location.reload();
    } catch (error) {
      busy.value = false;
      throw error;
    }
  }

  function dismiss(): void {
    dismissed.value = true;
  }

  return { dismissed, busy, load, remove, dismiss, isDemoRow };
}
