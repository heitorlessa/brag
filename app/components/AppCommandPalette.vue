<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem } from "@nuxt/ui";

const { isOpen, close } = useCommandPalette();
const colorMode = useColorMode();

function go(path: string): void {
  close();
  void navigateTo(path);
}

function create(path: string): void {
  close();
  void navigateTo({ path, query: { new: "1" } });
}

function toggleTheme(): void {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
  close();
}

const groups = computed<CommandPaletteGroup<CommandPaletteItem>[]>(() => [
  {
    id: "go",
    label: "Go to",
    items: [...NAV_LINKS, SETTINGS_LINK].map((link) => ({
      label: link.label,
      icon: link.icon,
      onSelect: () => go(link.to),
    })),
  },
  {
    id: "create",
    label: "Create",
    items: [
      {
        label: "New achievement",
        icon: "i-lucide-trophy",
        onSelect: () => create("/achievements"),
      },
      {
        label: "New goal",
        icon: "i-lucide-target",
        onSelect: () => create("/goals"),
      },
      {
        label: "New mentee",
        icon: "i-lucide-users-round",
        onSelect: () => create("/mentoring"),
      },
      {
        label: "New enablement",
        icon: "i-lucide-presentation",
        onSelect: () => create("/enablement"),
      },
      {
        label: "This week's energy check-in",
        icon: "i-lucide-activity",
        onSelect: () => go("/energy"),
      },
    ],
  },
  {
    id: "quick",
    label: "Quick actions",
    items: [
      {
        label: colorMode.value === "dark" ? "Light mode" : "Dark mode",
        icon: colorMode.value === "dark" ? "i-lucide-sun" : "i-lucide-moon",
        onSelect: () => toggleTheme(),
      },
      {
        label: "Backup & export",
        icon: "i-lucide-download",
        onSelect: () => go("/settings"),
      },
    ],
  },
]);
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :ui="{ content: 'max-w-xl sm:mt-[12vh] sm:items-start' }"
  >
    <template #content>
      <UCommandPalette
        :groups="groups"
        placeholder="Search or jump to…"
        :close="false"
        class="h-[26rem]"
        @update:model-value="close"
      />
    </template>
  </UModal>
</template>
