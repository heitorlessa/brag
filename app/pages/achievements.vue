<script setup lang="ts">
import type { Achievement } from "~/local-db";
import type { AchievementInput } from "~/services/achievements";

definePageMeta({ title: "Achievements" });

const { achievements, isLoading, create, update, remove } = useAchievements();
const { goals } = useGoals();
const toast = useToast();

const goalTitleById = computed(() => {
  const map = new Map<string, string>();
  for (const goal of goals.value) map.set(goal.id, goal.title);
  return map;
});

const search = ref("");
const filtered = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) return achievements.value;
  return achievements.value.filter((a) => {
    const haystack = [a.title, a.category, a.description, a.impact, ...a.tags]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
});

const modalOpen = ref(false);
const editing = ref<Achievement | null>(null);

function openCreate(): void {
  editing.value = null;
  modalOpen.value = true;
}

function openEdit(achievement: Achievement): void {
  editing.value = achievement;
  modalOpen.value = true;
}

async function onSaved(
  input: AchievementInput,
  id: string | null
): Promise<void> {
  if (id) {
    await update(id, input);
    toast.add({ title: "Achievement updated", color: "success" });
  } else {
    await create(input);
    toast.add({ title: "Achievement added", color: "success" });
  }
}

async function onDelete(id: string): Promise<void> {
  await remove(id);
  toast.add({ title: "Achievement deleted", color: "neutral" });
}
</script>

<template>
  <div>
    <AppPageHeader
      title="Achievements"
      description="Capture your wins as they happen — the raw material for brag docs and reviews."
      icon="i-lucide-trophy"
    >
      <template #actions>
        <UButton icon="i-lucide-plus" label="Add" @click="openCreate" />
      </template>
    </AppPageHeader>

    <div class="mb-4">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Search achievements…"
        class="max-w-sm"
      />
    </div>

    <div
      v-if="isLoading"
      class="py-10 text-center text-sm text-[var(--ui-text-dimmed)]"
    >
      Loading…
    </div>

    <AppEmptyState
      v-else-if="!achievements.length"
      icon="i-lucide-trophy"
      title="No achievements yet"
      description="Start logging the things you're proud of — big launches or small wins."
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          label="Add your first"
          @click="openCreate"
        />
      </template>
    </AppEmptyState>

    <p
      v-else-if="!filtered.length"
      class="py-10 text-center text-sm text-[var(--ui-text-dimmed)]"
    >
      No matches for “{{ search }}”.
    </p>

    <div v-else class="grid gap-3 md:grid-cols-2">
      <AchievementCard
        v-for="achievement in filtered"
        :key="achievement.id"
        :achievement="achievement"
        :goal-title="
          achievement.goalId ? goalTitleById.get(achievement.goalId) : null
        "
        @edit="openEdit(achievement)"
        @delete="onDelete(achievement.id)"
      />
    </div>

    <AchievementFormModal
      v-model:open="modalOpen"
      :achievement="editing"
      :goals="goals"
      @saved="onSaved"
    />
  </div>
</template>
