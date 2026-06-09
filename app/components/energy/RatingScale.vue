<script setup lang="ts">
/**
 * A smooth 1–5 rating control: five labelled segments with a sliding thumb.
 * A calmer, more tactile alternative to a native slider.
 */
const model = defineModel<number>({ default: 3 });
defineProps<{ labels: [string, string, string, string, string] }>();
const emit = defineEmits<{ select: [value: number] }>();

function pick(value: number): void {
  model.value = value;
  emit("select", value);
}
</script>

<template>
  <div
    class="relative grid grid-cols-5 rounded-2xl bg-[var(--ui-bg-muted)]/70 p-1"
  >
    <!-- Sliding thumb: translateX by whole cells (100% of its own 1/5 width). -->
    <div
      class="pointer-events-none absolute inset-y-0 left-0 w-1/5 p-1 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      :style="{ transform: `translateX(${(model - 1) * 100}%)` }"
    >
      <div
        class="h-full w-full rounded-xl bg-[var(--ui-bg)] shadow-sm ring-1 ring-[var(--ui-border)]"
      />
    </div>

    <button
      v-for="(label, index) in labels"
      :key="label"
      type="button"
      class="relative z-10 flex flex-col items-center gap-1 rounded-xl py-3 transition-colors"
      :class="
        model === index + 1
          ? 'text-[var(--ui-text-highlighted)]'
          : 'text-[var(--ui-text-dimmed)] hover:text-[var(--ui-text-muted)]'
      "
      @click="pick(index + 1)"
    >
      <span class="text-lg font-semibold">{{ index + 1 }}</span>
      <span class="text-[11px] font-medium">{{ label }}</span>
    </button>
  </div>
</template>
