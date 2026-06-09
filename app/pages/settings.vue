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
import { seedSampleData } from "~/services/seed";
import { isOpfsAvailable } from "~/local-db";

definePageMeta({ title: "Settings" });

const toast = useToast();
const busy = ref(false);

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

// ── Secondary navigation (Claude-style left menu) ───────────────────────────
const sections = [
  { id: "backup", label: "Backup & restore", icon: "i-lucide-database-backup" },
  { id: "export", label: "Brag export", icon: "i-lucide-file-text" },
  { id: "data", label: "Sample data", icon: "i-lucide-sparkles" },
  { id: "about", label: "About", icon: "i-lucide-info" },
] as const;

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
              Load a rich example dataset to explore the app, or wipe everything
              and start fresh.
            </p>
          </div>
          <div class="flex flex-wrap gap-2.5">
            <UButton
              icon="i-lucide-sparkles"
              label="Load sample data"
              color="neutral"
              variant="outline"
              :disabled="busy"
              @click="onSeed"
            />
          </div>
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
