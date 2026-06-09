<script setup lang="ts">
import {
  type BragBackup,
  exportAll,
  importAll,
  isBragBackup,
} from "~/services/backup";
import { listAchievements } from "~/services/achievements";
import { listEnablement } from "~/services/enablement";
import { listAllSessions, listPeople } from "~/services/mentoring";
import { SAMPLE_PREF, seedSampleData } from "~/services/seed";
import { isOpfsAvailable } from "~/local-db";
import { useStorage } from "@vueuse/core";

definePageMeta({ title: "Settings" });

const toast = useToast();
const busy = ref(false);

// Sample-data preference. Turning it off clears the database so the app can be
// used for real, and stops auto-seed from ever bringing demo data back.
const sampleEnabled = useStorage(SAMPLE_PREF, true);

// ── JSON backup ────────────────────────────────────────────────────────────
async function onExportJson(): Promise<void> {
  busy.value = true;
  try {
    const backup = await exportAll();
    downloadText(
      `brag-backup-${today()}.json`,
      JSON.stringify(backup, null, 2),
      "application/json"
    );
    toast.add({ title: "Backup exported", color: "success" });
  } finally {
    busy.value = false;
  }
}

const fileInput = ref<HTMLInputElement | null>(null);

async function onImportFile(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  busy.value = true;
  try {
    const parsed: unknown = JSON.parse(await readFileAsText(file));
    if (!isBragBackup(parsed)) {
      toast.add({ title: "Not a valid Brag backup", color: "error" });
      return;
    }
    if (
      !window.confirm(
        "Importing replaces ALL current data with the backup. Continue?"
      )
    ) {
      return;
    }
    await importAll(parsed as BragBackup);
    toast.add({ title: "Backup restored — reloading…", color: "success" });
    window.location.reload();
  } catch {
    toast.add({ title: "Could not read that file", color: "error" });
  } finally {
    busy.value = false;
    if (fileInput.value) fileInput.value.value = "";
  }
}

// ── Markdown brag export ─────────────────────────────────────────────────────
const from = ref(`${currentYear()}-01-01`);
const to = ref(today());
const preview = ref("");

async function generateBragDoc(): Promise<string> {
  const [achievements, enablement, sessions, people] = await Promise.all([
    listAchievements(),
    listEnablement(),
    listAllSessions(),
    listPeople(),
  ]);
  return buildBragDoc({
    from: from.value,
    to: to.value,
    achievements,
    enablement,
    sessions,
    people,
  });
}

async function onPreviewBragDoc(): Promise<void> {
  busy.value = true;
  try {
    preview.value = await generateBragDoc();
  } finally {
    busy.value = false;
  }
}

async function onDownloadBragDoc(): Promise<void> {
  busy.value = true;
  try {
    const markdown = preview.value || (await generateBragDoc());
    downloadText(
      `brag-${from.value}-to-${to.value}.md`,
      markdown,
      "text/markdown"
    );
    toast.add({ title: "Brag doc downloaded", color: "success" });
  } finally {
    busy.value = false;
  }
}

// ── Sample / clear data ──────────────────────────────────────────────────────
async function onSeed(): Promise<void> {
  busy.value = true;
  try {
    await seedSampleData();
    toast.add({ title: "Sample data added — reloading…", color: "success" });
    window.location.reload();
  } finally {
    busy.value = false;
  }
}

const EMPTY_BACKUP: BragBackup = {
  app: "brag",
  version: 1,
  exportedAt: "",
  data: {
    goals: [],
    achievements: [],
    people: [],
    mentoring_sessions: [],
    enablement: [],
    energy_reflections: [],
  },
};

async function onClearAll(): Promise<void> {
  if (
    !window.confirm("This permanently deletes ALL Brag data. Are you sure?")
  ) {
    return;
  }
  busy.value = true;
  try {
    await importAll(EMPTY_BACKUP);
    toast.add({ title: "All data cleared — reloading…", color: "neutral" });
    window.location.reload();
  } finally {
    busy.value = false;
  }
}

async function onToggleSample(value: boolean): Promise<void> {
  busy.value = true;
  try {
    if (value) {
      sampleEnabled.value = true;
      await seedSampleData();
      toast.add({ title: "Sample data loaded — reloading…", color: "success" });
      window.location.reload();
    } else {
      if (
        !window.confirm(
          "Turn off sample data? This clears the database so you can start fresh."
        )
      ) {
        return; // model-value stays true; switch reverts
      }
      sampleEnabled.value = false;
      await importAll(EMPTY_BACKUP);
      toast.add({ title: "Cleared — ready for your data", color: "neutral" });
      window.location.reload();
    }
  } finally {
    busy.value = false;
  }
}

// ── Secondary navigation (Claude-style left menu) ───────────────────────────
const sections = [
  { id: "backup", label: "Backup & restore", icon: "i-lucide-database-backup" },
  { id: "export", label: "Brag export", icon: "i-lucide-file-text" },
  { id: "data", label: "Sample data", icon: "i-lucide-sparkles" },
  { id: "agents", label: "Agent API", icon: "i-lucide-terminal" },
  { id: "about", label: "About", icon: "i-lucide-info" },
] as const;

const agentExample = `// In the browser console or a browser-driving agent:
await brag.addAchievement({
  title: "Shipped the new onboarding flow",
  occurredAt: "2026-06-01",
  impact: "Cut time-to-first-action by 40%",
  tags: ["launch"],
});

// Batch ingest (appends, doesn't replace):
await brag.importMerge({
  goals: [{ title: "Grow as a leader", year: 2026, progress: 30 }],
  achievements: [{ title: "Led the migration", occurredAt: "2026-05-10" }],
});

brag.help(); // full reference`;

type SectionId = (typeof sections)[number]["id"];
const active = ref<SectionId>("backup");
</script>

<template>
  <div>
    <AppPageHeader
      title="Settings"
      description="Your data lives only in this browser. Back it up and export brag docs here."
    />

    <div class="flex flex-col gap-8 lg:flex-row">
      <!-- Secondary nav -->
      <nav class="shrink-0 lg:w-56">
        <div class="flex gap-1 overflow-x-auto lg:sticky lg:top-2 lg:flex-col">
          <button
            v-for="s in sections"
            :key="s.id"
            type="button"
            class="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors"
            :class="
              active === s.id
                ? 'bg-[var(--ui-bg-muted)] font-medium text-[var(--ui-text-highlighted)]'
                : 'text-[var(--ui-text-muted)] hover:bg-[var(--ui-bg-muted)]/50 hover:text-[var(--ui-text)]'
            "
            @click="active = s.id"
          >
            <UIcon :name="s.icon" class="size-4 shrink-0" />
            {{ s.label }}
          </button>
        </div>
      </nav>

      <!-- Right content -->
      <div class="min-w-0 flex-1">
        <!-- Backup & restore -->
        <section v-show="active === 'backup'" class="max-w-xl space-y-5">
          <div>
            <h2
              class="text-lg font-semibold tracking-tight text-[var(--ui-text-highlighted)]"
            >
              Backup &amp; restore
            </h2>
            <p class="mt-1 text-sm text-[var(--ui-text-muted)]">
              Export the whole database to a JSON file, or restore from one.
              Restoring replaces everything.
            </p>
          </div>
          <div class="flex flex-wrap gap-2.5">
            <UButton
              icon="i-lucide-download"
              label="Export JSON"
              color="neutral"
              variant="outline"
              :loading="busy"
              @click="onExportJson"
            />
            <UButton
              icon="i-lucide-upload"
              label="Import JSON"
              color="neutral"
              variant="outline"
              :disabled="busy"
              @click="fileInput?.click()"
            />
            <input
              ref="fileInput"
              type="file"
              accept="application/json"
              class="hidden"
              @change="onImportFile"
            />
          </div>
        </section>

        <!-- Brag export -->
        <section v-show="active === 'export'" class="max-w-2xl space-y-5">
          <div>
            <h2
              class="text-lg font-semibold tracking-tight text-[var(--ui-text-highlighted)]"
            >
              Brag export
            </h2>
            <p class="mt-1 text-sm text-[var(--ui-text-muted)]">
              Generate a Markdown summary of achievements, enablement and
              mentoring for a date range — ready for a review.
            </p>
          </div>
          <div class="flex flex-wrap items-end gap-3">
            <UFormField label="From">
              <AppDatePicker v-model="from" />
            </UFormField>
            <UFormField label="To">
              <AppDatePicker v-model="to" />
            </UFormField>
            <div class="flex gap-2.5">
              <UButton
                icon="i-lucide-eye"
                label="Preview"
                color="neutral"
                variant="ghost"
                :loading="busy"
                @click="onPreviewBragDoc"
              />
              <UButton
                icon="i-lucide-download"
                label="Download"
                color="neutral"
                variant="outline"
                :loading="busy"
                @click="onDownloadBragDoc"
              />
            </div>
          </div>
          <UTextarea
            v-if="preview"
            :model-value="preview"
            :rows="16"
            readonly
            class="w-full font-mono text-xs"
          />
        </section>

        <!-- Sample data -->
        <section v-show="active === 'data'" class="max-w-xl space-y-5">
          <div>
            <h2
              class="text-lg font-semibold tracking-tight text-[var(--ui-text-highlighted)]"
            >
              Sample data
            </h2>
            <p class="mt-1 text-sm text-[var(--ui-text-muted)]">
              Explore with a realistic example dataset, or turn it off to start
              fresh and use Brag for real.
            </p>
          </div>

          <div
            class="surface flex items-center justify-between gap-4 p-4 sm:px-5"
          >
            <div>
              <p class="text-sm font-medium text-[var(--ui-text)]">
                Use sample data
              </p>
              <p class="mt-0.5 text-sm text-[var(--ui-text-muted)]">
                {{
                  sampleEnabled
                    ? "Demo entries are loaded."
                    : "Off — your data only."
                }}
              </p>
            </div>
            <USwitch
              :model-value="sampleEnabled"
              :disabled="busy"
              @update:model-value="onToggleSample"
            />
          </div>

          <UButton
            v-if="sampleEnabled"
            icon="i-lucide-refresh-cw"
            label="Reload sample data"
            color="neutral"
            variant="ghost"
            size="sm"
            :disabled="busy"
            @click="onSeed"
          />

          <div class="bg-error/5 ring-error/20 mt-2 rounded-xl p-4 ring-1">
            <p class="text-sm font-medium text-[var(--ui-text-highlighted)]">
              Danger zone
            </p>
            <p class="mt-1 mb-3 text-sm text-[var(--ui-text-muted)]">
              Permanently delete all achievements, goals, mentoring, enablement
              and energy data.
            </p>
            <UButton
              icon="i-lucide-trash-2"
              label="Clear all data"
              color="error"
              variant="soft"
              :disabled="busy"
              @click="onClearAll"
            />
          </div>
        </section>

        <!-- Agent API -->
        <section v-show="active === 'agents'" class="max-w-2xl space-y-5">
          <div>
            <h2
              class="text-lg font-semibold tracking-tight text-[var(--ui-text-highlighted)]"
            >
              Agent API
            </h2>
            <p class="mt-1 text-sm text-[var(--ui-text-muted)]">
              Brag is local-first — your data lives in this browser, so there's
              no server to POST to. To let an agent add data, drive this page
              (Playwright, a browser extension, or the devtools console) and
              call the <code class="text-primary">window.brag</code> API.
            </p>
          </div>
          <pre
            class="surface overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[var(--ui-text-toned)]"
          ><code>{{ agentExample }}</code></pre>
          <p class="text-sm text-[var(--ui-text-muted)]">
            <code class="text-primary">importMerge</code> appends (it never
            wipes existing data). For a full replace, use a JSON backup under
            Backup &amp; restore.
          </p>
          <p class="text-sm text-[var(--ui-text-muted)]">
            If your browser exposes
            <code class="text-primary">navigator.modelContext</code> (WebMCP),
            Brag also registers these as MCP tools automatically — so a
            WebMCP-capable agent can discover and call them without any glue
            code.
          </p>
        </section>

        <!-- About -->
        <section v-show="active === 'about'" class="max-w-xl space-y-4">
          <h2
            class="text-lg font-semibold tracking-tight text-[var(--ui-text-highlighted)]"
          >
            About
          </h2>
          <dl class="divide-hair surface overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3">
              <dt class="text-sm text-[var(--ui-text-muted)]">Storage</dt>
              <dd class="text-sm font-medium text-[var(--ui-text)]">
                {{ isOpfsAvailable() ? "OPFS (persistent)" : "In-memory" }}
              </dd>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <dt class="text-sm text-[var(--ui-text-muted)]">Sync</dt>
              <dd class="text-sm font-medium text-[var(--ui-text)]">
                None — fully local
              </dd>
            </div>
          </dl>
          <p class="text-sm text-[var(--ui-text-muted)]">
            Brag is local-first and privacy-first: your data never leaves this
            browser. Export a JSON backup regularly, since clearing browser
            storage will erase it.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
