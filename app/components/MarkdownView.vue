<script setup lang="ts">
import MarkdownIt from "markdown-it";

/** Read-only render of stored Markdown. Cheap (no editor instance). */
const props = defineProps<{ source?: string | null }>();

const md = new MarkdownIt({ html: false, linkify: true, breaks: true });

const html = computed(() => md.render(props.source ?? ""));
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- markdown-it runs with html:false, so any embedded HTML is escaped, not injected -->
  <div v-if="source" class="brag-prose" v-html="html" />
  <p v-else class="text-sm text-[var(--ui-text-dimmed)] italic">—</p>
</template>
