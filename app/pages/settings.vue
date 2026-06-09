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
</script>

<template>
  <div class="space-y-6">
    <AppPageHeader
      title="Settings"
      description="Your data lives only in this browser. Back it up and export brag docs here."
      icon="i-lucide-settings"
    />

    <UCard :ui="{ body: 'space-y-4' }">
      <div>
        <h3 class="font-semibold text-[var(--ui-text-highlighted)]">
          Backup &amp; restore
        </h3>
        <p class="mt-1 text-sm text-[var(--ui-text-muted)]">
          Export the whole database to a JSON file, or restore from one.
          Restoring replaces everything.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton
          icon="i-lucide-download"
          label="Export JSON"
          :loading="busy"
          @click="onExportJson"
        />
        <UButton
          icon="i-lucide-upload"
          label="Import JSON"
          color="neutral"
          variant="soft"
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
    </UCard>

    <UCard :ui="{ body: 'space-y-4' }">
      <div>
        <h3 class="font-semibold text-[var(--ui-text-highlighted)]">
          Markdown brag export
        </h3>
        <p class="mt-1 text-sm text-[var(--ui-text-muted)]">
          Generate a Markdown summary of achievements, enablement and mentoring
          for a date range.
        </p>
      </div>
      <div class="flex flex-wrap items-end gap-3">
        <UFormField label="From">
          <UInput v-model="from" type="date" />
        </UFormField>
        <UFormField label="To">
          <UInput v-model="to" type="date" />
        </UFormField>
        <UButton
          icon="i-lucide-eye"
          label="Preview"
          color="neutral"
          variant="soft"
          :loading="busy"
          @click="onPreviewBragDoc"
        />
        <UButton
          icon="i-lucide-download"
          label="Download .md"
          :loading="busy"
          @click="onDownloadBragDoc"
        />
      </div>
      <UTextarea
        v-if="preview"
        :model-value="preview"
        :rows="14"
        readonly
        class="w-full font-mono text-xs"
      />
    </UCard>

    <UCard :ui="{ body: 'space-y-4' }">
      <div>
        <h3 class="font-semibold text-[var(--ui-text-highlighted)]">Data</h3>
        <p class="mt-1 text-sm text-[var(--ui-text-muted)]">
          Storage:
          <span class="font-medium">
            {{
              isOpfsAvailable() ? "OPFS (persistent)" : "in-memory (ephemeral)"
            }}
          </span>
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton
          icon="i-lucide-sparkles"
          label="Load sample data"
          color="neutral"
          variant="soft"
          :disabled="busy"
          @click="onSeed"
        />
        <UButton
          icon="i-lucide-trash-2"
          label="Clear all data"
          color="error"
          variant="soft"
          :disabled="busy"
          @click="onClearAll"
        />
      </div>
    </UCard>
  </div>
</template>
