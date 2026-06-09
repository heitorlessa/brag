<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  eyebrow?: string;
}>();
</script>

<template>
  <div class="mb-8 flex items-end justify-between gap-4">
    <div>
      <p
        v-if="eyebrow"
        class="text-primary mb-1.5 text-xs font-medium tracking-wide uppercase"
      >
        {{ eyebrow }}
      </p>
      <h1
        class="text-2xl font-semibold tracking-tight text-[var(--ui-text-highlighted)]"
      >
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="mt-1.5 max-w-xl text-sm text-[var(--ui-text-muted)]"
      >
        {{ description }}
      </p>
    </div>
    <div class="shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
