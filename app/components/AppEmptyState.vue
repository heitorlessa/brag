<script setup lang="ts">
defineProps<{
  icon?: string;
  title: string;
  description?: string;
}>();
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--ui-border)] px-6 py-14 text-center"
  >
    <UIcon
      :name="icon ?? 'i-lucide-inbox'"
      class="size-8 text-[var(--ui-text-dimmed)]"
    />
    <p class="mt-3 text-sm font-medium text-[var(--ui-text)]">{{ title }}</p>
    <p
      v-if="description"
      class="mt-1 max-w-sm text-sm text-[var(--ui-text-muted)]"
    >
      {{ description }}
    </p>
    <div class="mt-4">
      <slot name="actions" />
    </div>
  </div>
</template>
