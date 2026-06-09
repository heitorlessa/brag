<script setup lang="ts">
import type { Achievement } from "~/local-db";

const props = defineProps<{
  achievement: Achievement;
  goalTitle?: string | null;
}>();

defineEmits<{ edit: []; delete: [] }>();

const expanded = ref(false);
const excerpt = computed(() => markdownExcerpt(props.achievement.description));
const hasBody = computed(
  () =>
    Boolean(props.achievement.description) || Boolean(props.achievement.impact)
);
</script>

<template>
  <UCard :ui="{ body: 'space-y-3' }">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="font-semibold text-[var(--ui-text-highlighted)]">
          {{ achievement.title }}
        </h3>
        <div
          class="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--ui-text-dimmed)]"
        >
          <span class="inline-flex items-center gap-1">
            <UIcon name="i-lucide-calendar" class="size-3.5" />
            {{ formatDate(achievement.occurredAt) }}
          </span>
          <UBadge
            v-if="achievement.category"
            color="neutral"
            variant="soft"
            size="sm"
          >
            {{ achievement.category }}
          </UBadge>
          <span
            v-if="goalTitle"
            class="text-primary inline-flex items-center gap-1"
          >
            <UIcon name="i-lucide-target" class="size-3.5" />
            {{ goalTitle }}
          </span>
        </div>
      </div>
      <div class="flex shrink-0 gap-1">
        <UButton
          icon="i-lucide-pencil"
          color="neutral"
          variant="ghost"
          size="xs"
          aria-label="Edit"
          @click="$emit('edit')"
        />
        <ConfirmButton
          message="Delete this achievement?"
          @confirm="$emit('delete')"
        />
      </div>
    </div>

    <p v-if="!expanded && excerpt" class="text-sm text-[var(--ui-text-muted)]">
      {{ excerpt }}
    </p>

    <div v-if="expanded" class="space-y-3">
      <MarkdownView :source="achievement.description" />
      <div v-if="achievement.impact">
        <p
          class="text-xs font-semibold tracking-wide text-[var(--ui-text-dimmed)] uppercase"
        >
          Impact
        </p>
        <MarkdownView :source="achievement.impact" class="mt-1" />
      </div>
    </div>

    <div
      v-if="achievement.tags.length || hasBody"
      class="flex items-center justify-between gap-2"
    >
      <div class="flex flex-wrap gap-1">
        <UBadge
          v-for="tag in achievement.tags"
          :key="tag"
          color="primary"
          variant="soft"
          size="sm"
        >
          {{ tag }}
        </UBadge>
      </div>
      <UButton
        v-if="hasBody"
        :label="expanded ? 'Show less' : 'Show more'"
        :trailing-icon="
          expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
        "
        color="neutral"
        variant="link"
        size="xs"
        @click="expanded = !expanded"
      />
    </div>
  </UCard>
</template>
