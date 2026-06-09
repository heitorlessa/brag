<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  icon?: string;
}>();
</script>

<template>
  <div class="mb-5 flex items-start justify-between gap-4">
    <div class="flex items-start gap-3">
      <span
        v-if="icon"
        class="bg-primary/10 text-primary mt-0.5 flex size-9 items-center justify-center rounded-lg"
      >
        <UIcon :name="icon" class="size-5" />
      </span>
      <div>
        <h2 class="text-lg font-semibold text-[var(--ui-text-highlighted)]">
          {{ title }}
        </h2>
        <p
          v-if="description"
          class="mt-0.5 text-sm text-[var(--ui-text-muted)]"
        >
          {{ description }}
        </p>
      </div>
    </div>
    <div class="shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
