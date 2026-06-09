<script setup lang="ts">
import type { Goal } from "~/local-db";
import type { GoalInput } from "~/services/goals";

definePageMeta({ title: "Goals" });

const { goals, isLoading, create, update, remove } = useGoals();
const toast = useToast();

// Group by year, most recent first (goals already come sorted by year desc).
const groupedByYear = computed(() => {
  const groups = new Map<number, Goal[]>();
  for (const goal of goals.value) {
    const bucket = groups.get(goal.year) ?? [];
    bucket.push(goal);
    groups.set(goal.year, bucket);
  }
  return [...groups.entries()].toSorted((a, b) => b[0] - a[0]);
});

const modalOpen = ref(false);
const editing = ref<Goal | null>(null);

function openCreate(): void {
  editing.value = null;
  modalOpen.value = true;
}

function openEdit(goal: Goal): void {
  editing.value = goal;
  modalOpen.value = true;
}

async function onSaved(input: GoalInput, id: string | null): Promise<void> {
  if (id) {
    await update(id, input);
    toast.add({ title: "Goal updated", color: "success" });
  } else {
    await create(input);
    toast.add({ title: "Goal added", color: "success" });
  }
}

async function onDelete(id: string): Promise<void> {
  await remove(id);
  toast.add({ title: "Goal deleted", color: "neutral" });
}

useCreateIntent(openCreate);
</script>

<template>
  <div>
    <AppPageHeader
      title="Goals"
      description="The outcomes you're aiming for this year — track status and progress."
    >
      <template #actions>
        <UButton icon="i-lucide-plus" label="New" @click="openCreate" />
      </template>
    </AppPageHeader>

    <div
      v-if="isLoading"
      class="py-10 text-center text-sm text-[var(--ui-text-dimmed)]"
    >
      Loading…
    </div>

    <AppEmptyState
      v-else-if="!goals.length"
      icon="i-lucide-target"
      title="No goals yet"
      description="Set a few goals for the year and watch them move."
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          label="Add your first"
          @click="openCreate"
        />
      </template>
    </AppEmptyState>

    <div v-else class="space-y-9">
      <section v-for="[year, yearGoals] in groupedByYear" :key="year">
        <h3
          class="mb-4 text-xs font-semibold tracking-wide text-[var(--ui-text-dimmed)] uppercase"
        >
          {{ year }}
        </h3>
        <div class="grid gap-4 md:grid-cols-2">
          <GoalCard
            v-for="goal in yearGoals"
            :key="goal.id"
            :goal="goal"
            @edit="openEdit(goal)"
            @delete="onDelete(goal.id)"
          />
        </div>
      </section>
    </div>

    <GoalFormModal v-model:open="modalOpen" :goal="editing" @saved="onSaved" />
  </div>
</template>
