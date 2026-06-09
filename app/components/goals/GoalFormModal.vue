<script setup lang="ts">
import { z } from "zod";
import type { Goal, GoalStatus } from "~/local-db";
import type { GoalInput } from "~/services/goals";

const open = defineModel<boolean>("open", { required: true });

const props = defineProps<{ goal?: Goal | null }>();
const emit = defineEmits<{ saved: [GoalInput, string | null] }>();

const statusItems: { label: string; value: GoalStatus }[] = [
  { label: "Not started", value: "not_started" },
  { label: "In progress", value: "in_progress" },
  { label: "Done", value: "done" },
  { label: "Dropped", value: "dropped" },
];

interface FormState {
  title: string;
  year: number;
  category: string;
  status: GoalStatus;
  progress: number;
  targetDate: string;
  description: string;
}

function blank(): FormState {
  return {
    title: "",
    year: currentYear(),
    category: "",
    status: "not_started",
    progress: 0,
    targetDate: "",
    description: "",
  };
}

const state = reactive<FormState>(blank());

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  year: z.number().int().min(2000).max(2100),
  progress: z.number().min(0).max(100),
});

const isEdit = computed(() => Boolean(props.goal));

watch(open, (isOpen) => {
  if (!isOpen) return;
  const g = props.goal;
  Object.assign(
    state,
    g
      ? {
          title: g.title,
          year: g.year,
          category: g.category,
          status: g.status,
          progress: g.progress,
          targetDate: g.targetDate ?? "",
          description: g.description,
        }
      : blank()
  );
});

function onSubmit(): void {
  const input: GoalInput = {
    title: state.title.trim(),
    year: state.year,
    category: state.category.trim(),
    status: state.status,
    progress: state.progress,
    targetDate: state.targetDate || null,
    description: state.description,
  };
  emit("saved", input, props.goal?.id ?? null);
  open.value = false;
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEdit ? 'Edit goal' : 'New goal'"
    :ui="{ content: 'max-w-2xl' }"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Title" name="title" required>
          <UInput
            v-model="state.title"
            placeholder="What do you want to achieve?"
          />
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-3">
          <UFormField label="Year" name="year" required>
            <UInput v-model.number="state.year" type="number" />
          </UFormField>
          <UFormField label="Status" name="status">
            <USelectMenu
              v-model="state.status"
              :items="statusItems"
              value-key="value"
            />
          </UFormField>
          <UFormField label="Target date" name="targetDate">
            <AppDatePicker v-model="state.targetDate" placeholder="Optional" />
          </UFormField>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Category" name="category">
            <UInput
              v-model="state.category"
              placeholder="e.g. Growth, Health"
            />
          </UFormField>
          <UFormField
            label="Progress"
            name="progress"
            :hint="`${state.progress}%`"
          >
            <USlider v-model="state.progress" :min="0" :max="100" :step="5" />
          </UFormField>
        </div>

        <UFormField label="Notes" name="description">
          <RichTextEditor
            v-model="state.description"
            placeholder="Paste your goal in Markdown, add context, success criteria…"
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="open = false">
          Cancel
        </UButton>
        <UButton color="primary" @click="onSubmit">
          {{ isEdit ? "Save changes" : "Add goal" }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
