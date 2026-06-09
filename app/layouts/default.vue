<script setup lang="ts">
const route = useRoute();
const { toggle: togglePalette, open: openPalette } = useCommandPalette();

// ⌘K / Ctrl-K opens the command palette anywhere.
defineShortcuts({
  meta_k: () => togglePalette(),
  ctrl_k: () => togglePalette(),
});

const pageTitle = computed(
  () => (route.meta.title as string | undefined) ?? "Brag"
);

const mobileNavOpen = ref(false);
watch(
  () => route.path,
  () => {
    mobileNavOpen.value = false;
  }
);
</script>

<template>
  <div class="flex h-screen bg-[var(--ui-bg)] text-[var(--ui-text)]">
    <!-- Icon rail (desktop) -->
    <aside
      class="hidden w-[72px] shrink-0 flex-col border-r border-[var(--ui-border)]/70 md:flex"
    >
      <AppRail />
    </aside>

    <!-- Main column -->
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-16 shrink-0 items-center gap-3 px-4 sm:px-6">
        <UButton
          class="md:hidden"
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          @click="mobileNavOpen = true"
        />

        <button
          type="button"
          class="group flex h-9 w-full max-w-sm items-center gap-2 rounded-xl bg-[var(--ui-bg-muted)]/60 px-3 text-sm text-[var(--ui-text-dimmed)] ring-1 ring-transparent transition hover:ring-[var(--ui-border)]"
          @click="openPalette()"
        >
          <UIcon name="i-lucide-search" class="size-4" />
          <span>Search or jump to…</span>
          <span class="ms-auto hidden items-center gap-0.5 sm:flex">
            <UKbd value="meta" />
            <UKbd value="k" />
          </span>
        </button>

        <span
          class="ms-auto text-xs font-medium text-[var(--ui-text-dimmed)] sm:hidden"
        >
          {{ pageTitle }}
        </span>
      </header>

      <main class="min-h-0 flex-1 overflow-y-auto">
        <Motion
          :key="route.path"
          :initial="{ opacity: 0, y: 8 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }"
          class="mx-auto w-full max-w-5xl px-4 pt-2 pb-16 sm:px-8"
        >
          <slot />
        </Motion>
      </main>
    </div>

    <!-- Rail (mobile slideover) -->
    <USlideover
      v-model:open="mobileNavOpen"
      side="left"
      :ui="{ content: 'w-64' }"
    >
      <template #content>
        <AppRail expanded />
      </template>
    </USlideover>

    <AppCommandPalette />
  </div>
</template>
