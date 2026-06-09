<script setup lang="ts">
import type { Goal } from "~/local-db";

const props = defineProps<{ goal: Goal }>();
defineEmits<{ edit: []; delete: [] }>();

const status = computed(() => goalStatusMeta[props.goal.status]);
const expanded = ref(false);
</script>

<template>
  <UCard :ui="{ body: 'space-y-3' }">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="font-semibold text-[var(--ui-text-highlighted)]">
          {{ goal.title }}
        </h3>
        <div
          class="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--ui-text-dimmed)]"
        >
          <UBadge :color="status.color" variant="soft" size="sm">
            {{ status.label }}
          </UBadge>
          <UBadge v-if="goal.category" color="neutral" variant="soft" size="sm">
            {{ goal.category }}
          </UBadge>
          <span v-if="goal.targetDate" class="inline-flex items-center gap-1">
            <UIcon name="i-lucide-flag" class="size-3.5" />
            {{ formatDate(goal.targetDate) }}
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
        <ConfirmButton message="Delete this goal?" @confirm="$emit('delete')" />
      </div>
    </div>

    <div>
      <div
        class="mb-1 flex items-center justify-between text-xs text-[var(--ui-text-muted)]"
      >
        <span>Progress</span>
        <span>{{ goal.progress }}%</span>
      </div>
      <UProgress :model-value="goal.progress" :max="100" size="sm" />
    </div>

    <div v-if="goal.description">
      <MarkdownView v-if="expanded" :source="goal.description" />
      <p v-else class="text-sm text-[var(--ui-text-muted)]">
        {{ markdownExcerpt(goal.description, 120) }}
      </p>
      <UButton
        :label="expanded ? 'Show less' : 'Show more'"
        color="neutral"
        variant="link"
        size="xs"
        class="mt-1 px-0"
        @click="expanded = !expanded"
      />
    </div>
  </UCard>
</template>
