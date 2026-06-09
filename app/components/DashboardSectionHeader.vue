<script setup lang="ts">
defineProps<{ title: string; to?: string }>();
</script>

<template>
  <div class="mb-3 flex items-center justify-between">
    <h2 class="text-sm font-semibold text-[var(--ui-text-highlighted)]">
      {{ title }}
    </h2>
    <UButton
      v-if="to"
      label="View all"
      :to="to"
      color="neutral"
      variant="link"
      size="xs"
      trailing-icon="i-lucide-arrow-right"
      :ui="{ base: 'px-0' }"
    />
  </div>
</template>
