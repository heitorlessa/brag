<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

defineProps<{ links: NavigationMenuItem[] }>();
</script>

<template>
  <div class="flex h-full flex-col gap-2 p-3">
    <div class="flex items-center gap-2 px-2 py-3">
      <span
        class="bg-primary flex size-8 items-center justify-center rounded-lg text-white"
      >
        <UIcon name="i-lucide-sparkles" class="size-5" />
      </span>
      <div class="leading-tight">
        <p class="text-sm font-semibold text-[var(--ui-text-highlighted)]">
          Brag
        </p>
        <p class="text-xs text-[var(--ui-text-dimmed)]">record of wins</p>
      </div>
    </div>

    <UNavigationMenu :items="links" orientation="vertical" class="flex-1" />

    <div class="border-t border-[var(--ui-border)] pt-2">
      <UNavigationMenu
        :items="[
          { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' },
        ]"
        orientation="vertical"
      />
    </div>
  </div>
</template>
