<script setup lang="ts">
defineProps<{
  index: number;
  sectionId: string;
  eyebrow?: string;
  title: string;
}>();
</script>

<template>
  <section :id="sectionId" class="scroll-mt-24 py-10 sm:py-14">
    <ScrollReveal>
      <div class="mb-6 flex items-baseline gap-4">
        <span class="font-mono text-sm text-[var(--ui-text-dimmed)]">
          {{ String(index).padStart(2, "0") }}
        </span>
        <div>
          <p
            v-if="eyebrow"
            class="text-primary text-xs font-medium tracking-wide uppercase"
          >
            {{ eyebrow }}
          </p>
          <h2
            class="text-2xl font-semibold tracking-tight text-[var(--ui-text-highlighted)]"
          >
            {{ title }}
          </h2>
        </div>
      </div>
    </ScrollReveal>
    <slot />
  </section>
</template>
