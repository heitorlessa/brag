<script setup lang="ts">
/**
 * Scroll-triggered reveal (expo-out rise + fade), the explainer-style entrance.
 * Observes against the app's scroll container (<main>), reveals once.
 */
withDefaults(defineProps<{ delay?: number; y?: number }>(), {
  delay: 0,
  y: 28,
});

const el = ref<HTMLElement>();
const shown = ref(false);

onMounted(() => {
  if (!el.value) return;
  const root = document.querySelector("main");
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          shown.value = true;
          io.disconnect();
        }
      }
    },
    { root, threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  io.observe(el.value);
  onBeforeUnmount(() => io.disconnect());
});
</script>

<template>
  <div
    ref="el"
    class="brag-reveal"
    :class="{ shown }"
    :style="{
      '--reveal-y': `${y}px`,
      transitionDelay: delay ? `${delay}s` : undefined,
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.brag-reveal {
  opacity: 0;
  transform: translateY(var(--reveal-y, 28px));
  transition:
    opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.brag-reveal.shown {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .brag-reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
