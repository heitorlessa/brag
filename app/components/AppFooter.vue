<script setup lang="ts">
const PROFILE = "https://github.com/heitorlessa";
const REPO = "https://github.com/heitorlessa/brag";
</script>

<template>
  <footer class="mt-2 border-t border-[var(--ui-border)]/60">
    <div
      class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5 text-xs text-[var(--ui-text-dimmed)] sm:px-8"
    >
      <p>
        Built by
        <a
          :href="PROFILE"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-primary font-medium text-[var(--ui-text-muted)] transition-colors"
        >
          Heitor Lessa
        </a>
      </p>
      <a
        :href="REPO"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:text-primary inline-flex items-center gap-1.5 transition-colors"
      >
        <UIcon name="i-lucide-github" class="size-4" />
        Source
      </a>
    </div>
  </footer>
</template>
