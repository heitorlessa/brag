<script setup lang="ts">
import type { NavLink } from "~/composables/useNavigation";

defineProps<{ link: NavLink; expanded?: boolean; active?: boolean }>();
</script>

<template>
  <UTooltip
    :text="expanded ? undefined : link.label"
    :content="{ side: 'right', sideOffset: 12 }"
  >
    <NuxtLink
      :to="link.to"
      :aria-label="link.label"
      class="group relative flex h-10 items-center gap-3 rounded-xl px-2.5 transition-colors duration-150"
      :class="[
        expanded ? '' : 'justify-center',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-[var(--ui-text-muted)] hover:bg-[var(--ui-bg-muted)] hover:text-[var(--ui-text)]',
      ]"
    >
      <span
        v-if="active"
        class="bg-primary absolute top-1/2 -left-2.5 h-5 w-1 -translate-y-1/2 rounded-r-full"
      />
      <UIcon :name="link.icon" class="size-5 shrink-0" />
      <span v-if="expanded" class="text-sm font-medium">{{ link.label }}</span>
    </NuxtLink>
  </UTooltip>
</template>
