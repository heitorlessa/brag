<script setup lang="ts">
import {
  dbReason,
  dbState,
  resetAndReload,
  retryDb,
} from "~/local-db/bootstrap";

// Shown whenever the database is in an error state. Not dismissible — the app
// can't function without storage, so we guide the user to a fix.
const open = computed({
  get: () => dbState.value === "error",
  set: () => {},
});

const busy = ref(false);

async function onReset(): Promise<void> {
  busy.value = true;
  try {
    await resetAndReload();
  } finally {
    busy.value = false;
  }
}

async function onRetry(): Promise<void> {
  busy.value = true;
  try {
    await retryDb();
  } finally {
    busy.value = false;
  }
}

function reloadNow(): void {
  window.location.reload();
}
</script>

<template>
  <UModal
    v-model:open="open"
    :dismissible="false"
    :close="false"
    :ui="{ content: 'max-w-md' }"
  >
    <template #content>
      <!-- Another tab owns the database -->
      <div v-if="dbReason === 'multitab'" class="p-6 text-center">
        <span
          class="bg-warning/10 text-warning mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl"
        >
          <UIcon name="i-lucide-copy" class="size-6" />
        </span>
        <h2 class="text-lg font-semibold text-[var(--ui-text-highlighted)]">
          Brag is open in another tab
        </h2>
        <p class="mt-2 text-sm text-[var(--ui-text-muted)]">
          Brag uses a single tab at a time to keep your local data safe. Close
          the other Brag tabs — this one will continue automatically.
        </p>
        <div
          class="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--ui-text-dimmed)]"
        >
          <UIcon name="i-lucide-loader-circle" class="size-3.5 animate-spin" />
          Waiting for the other tab…
        </div>
        <div class="mt-5 flex justify-center">
          <UButton
            label="Reload now"
            color="neutral"
            variant="outline"
            @click="reloadNow"
          />
        </div>
      </div>

      <!-- Page isn't cross-origin isolated (extension / toolbar interfering) -->
      <div v-else-if="dbReason === 'noisolation'" class="p-6 text-center">
        <span
          class="bg-warning/10 text-warning mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl"
        >
          <UIcon name="i-lucide-shield-alert" class="size-6" />
        </span>
        <h2 class="text-lg font-semibold text-[var(--ui-text-highlighted)]">
          Storage is blocked here
        </h2>
        <p class="mt-2 text-sm text-[var(--ui-text-muted)]">
          Brag needs cross-origin isolation to save your data, but this page
          isn't isolated — usually a browser extension or an injected toolbar
          interfering. Nothing is being saved.
        </p>
        <ul
          class="mx-auto mt-3 max-w-xs space-y-1 text-left text-sm text-[var(--ui-text-muted)]"
        >
          <li class="flex gap-2">
            <UIcon
              name="i-lucide-dot"
              class="text-primary mt-0.5 size-4 shrink-0"
            />
            Open Brag in an Incognito / Private window, or
          </li>
          <li class="flex gap-2">
            <UIcon
              name="i-lucide-dot"
              class="text-primary mt-0.5 size-4 shrink-0"
            />
            Disable extensions for this site (or use a clean profile).
          </li>
        </ul>
        <div class="mt-5 flex justify-center">
          <UButton
            icon="i-lucide-refresh-cw"
            label="Reload"
            color="neutral"
            variant="outline"
            @click="reloadNow"
          />
        </div>
      </div>

      <!-- Stuck / corrupt store -->
      <div v-else class="p-6 text-center">
        <span
          class="bg-error/10 text-error mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl"
        >
          <UIcon name="i-lucide-database-backup" class="size-6" />
        </span>
        <h2 class="text-lg font-semibold text-[var(--ui-text-highlighted)]">
          Couldn't open local storage
        </h2>
        <p class="mt-2 text-sm text-[var(--ui-text-muted)]">
          Brag's local database didn't respond — usually a stuck storage state.
          Reset it to start clean. This only affects Brag, and your data is
          local anyway.
        </p>
        <div class="mt-5 flex justify-center gap-2.5">
          <UButton
            icon="i-lucide-refresh-cw"
            label="Reset &amp; reload"
            color="primary"
            :loading="busy"
            @click="onReset"
          />
          <UButton
            label="Try again"
            color="neutral"
            variant="outline"
            :disabled="busy"
            @click="onRetry"
          />
        </div>
        <p class="mt-4 text-xs text-[var(--ui-text-dimmed)]">
          Still stuck? Fully quit your browser and reopen, or clear this site's
          data.
        </p>
      </div>
    </template>
  </UModal>
</template>
