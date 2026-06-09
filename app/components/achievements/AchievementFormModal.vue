<script setup lang="ts">
import { z } from "zod";
import type { Achievement, Goal } from "~/local-db";
import type { AchievementInput } from "~/services/achievements";

const open = defineModel<boolean>("open", { required: true });

const props = defineProps<{
  achievement?: Achievement | null;
  goals: Goal[];
}>();

const emit = defineEmits<{ saved: [AchievementInput, string | null] }>();

interface FormState {
  title: string;
  occurredAt: string;
  category: string;
  tagsText: string;
  goalId: string | null;
  description: string;
  impact: string;
}

function blank(): FormState {
  return {
    title: "",
    occurredAt: today(),
    category: "",
    tagsText: "",
    goalId: null,
    description: "",
    impact: "",
  };
}

const state = reactive<FormState>(blank());

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  occurredAt: z.string().min(1, "Date is required"),
});

const isEdit = computed(() => Boolean(props.achievement));

const goalItems = computed(() => [
  { label: "— No linked goal —", value: null },
  ...props.goals.map((goal) => ({ label: goal.title, value: goal.id })),
]);

watch(open, (isOpen) => {
  if (!isOpen) return;
  const a = props.achievement;
  Object.assign(
    state,
    a
      ? {
          title: a.title,
          occurredAt: a.occurredAt,
          category: a.category,
          tagsText: a.tags.join(", "),
          goalId: a.goalId,
          description: a.description,
          impact: a.impact,
        }
      : blank()
  );
});

function onSubmit(): void {
  const tags = state.tagsText
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const input: AchievementInput = {
    title: state.title.trim(),
    occurredAt: state.occurredAt,
    category: state.category.trim(),
    tags,
    goalId: state.goalId,
    description: state.description,
    impact: state.impact,
  };
  emit("saved", input, props.achievement?.id ?? null);
  open.value = false;
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEdit ? 'Edit achievement' : 'New achievement'"
    :ui="{ content: 'max-w-2xl' }"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Title" name="title" required class="sm:col-span-2">
            <UInput
              v-model="state.title"
              placeholder="What did you accomplish?"
            />
          </UFormField>
          <UFormField label="Date" name="occurredAt" required>
            <UInput v-model="state.occurredAt" type="date" />
          </UFormField>
          <UFormField label="Category" name="category">
            <UInput
              v-model="state.category"
              placeholder="e.g. Delivery, Leadership"
            />
          </UFormField>
          <UFormField label="Tags" name="tagsText" hint="comma-separated">
            <UInput
              v-model="state.tagsText"
              placeholder="oss, mentoring, launch"
            />
          </UFormField>
          <UFormField label="Linked goal" name="goalId">
            <USelectMenu
              v-model="state.goalId"
              :items="goalItems"
              value-key="value"
              placeholder="Optional"
            />
          </UFormField>
        </div>

        <UFormField label="What happened" name="description">
          <RichTextEditor
            v-model="state.description"
            placeholder="Describe the achievement…"
          />
        </UFormField>

        <UFormField label="Impact" name="impact">
          <RichTextEditor
            v-model="state.impact"
            placeholder="Why it mattered — outcomes, metrics, who benefited…"
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
          {{ isEdit ? "Save changes" : "Add achievement" }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
