<script setup lang="ts">
/** Soft entrance wrapper. Use `delay` (seconds) for staggered lists. */
withDefaults(defineProps<{ delay?: number; y?: number }>(), {
  delay: 0,
  y: 8,
});
</script>

<template>
  <Motion
    :initial="{ opacity: 0, y }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }"
  >
    <slot />
  </Motion>
</template>
