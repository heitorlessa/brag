<script setup lang="ts">
defineProps<{ expanded?: boolean }>();

const route = useRoute();
const { open: openPalette } = useCommandPalette();

function isActive(to: string): boolean {
  return to === "/" ? route.path === "/" : route.path.startsWith(to);
}
</script>

<template>
  <div class="flex h-full flex-col gap-1.5 p-2.5">
    <!-- Brand -->
    <NuxtLink
      to="/"
      class="mb-1 flex items-center gap-2.5 rounded-xl px-1.5 py-1.5"
      :class="expanded ? '' : 'justify-center'"
    >
      <span
        class="bg-primary flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
      >
        <UIcon name="i-lucide-sparkles" class="size-5" />
      </span>
      <span
        v-if="expanded"
        class="text-base font-semibold tracking-tight text-[var(--ui-text-highlighted)]"
      >
        Brag
      </span>
    </NuxtLink>

    <!-- Primary nav -->
    <nav class="flex flex-col gap-1">
      <AppRailLink
        v-for="link in NAV_LINKS"
        :key="link.to"
        :link="link"
        :expanded="expanded"
        :active="isActive(link.to)"
      />
    </nav>

    <div class="flex-1" />

    <!-- Footer actions -->
    <div class="flex flex-col gap-1">
      <UTooltip
        :text="expanded ? undefined : 'Search  ⌘K'"
        :content="{ side: 'right', sideOffset: 12 }"
      >
        <button
          type="button"
          class="flex h-10 w-full items-center gap-3 rounded-xl px-2.5 text-[var(--ui-text-muted)] transition-colors hover:bg-[var(--ui-bg-muted)] hover:text-[var(--ui-text)]"
          :class="expanded ? '' : 'justify-center'"
          @click="openPalette()"
        >
          <UIcon name="i-lucide-search" class="size-5 shrink-0" />
          <span v-if="expanded" class="text-sm font-medium">Search</span>
        </button>
      </UTooltip>

      <AppRailLink
        :link="SETTINGS_LINK"
        :expanded="expanded"
        :active="isActive(SETTINGS_LINK.to)"
      />

      <div :class="expanded ? 'px-1' : 'flex justify-center'">
        <UColorModeButton />
      </div>
    </div>
  </div>
</template>
