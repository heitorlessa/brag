<script setup lang="ts">
import { z } from "zod";
import type { MentoringSessionInput } from "~/services/mentoring";

const open = defineModel<boolean>("open", { required: true });

defineProps<{ personName: string }>();
const emit = defineEmits<{
  saved: [Omit<MentoringSessionInput, "personId">];
}>();

interface FormState {
  date: string;
  topic: string;
  notes: string;
}

function blank(): FormState {
  return { date: today(), topic: "", notes: "" };
}

const state = reactive<FormState>(blank());
const schema = z.object({ date: z.string().min(1, "Date is required") });

watch(open, (isOpen) => {
  if (isOpen) Object.assign(state, blank());
});

function onSubmit(): void {
  emit("saved", {
    date: state.date,
    topic: state.topic.trim(),
    notes: state.notes,
  });
  open.value = false;
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="`Log session — ${personName}`"
    :ui="{ content: 'max-w-xl' }"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Date" name="date" required>
            <AppDatePicker v-model="state.date" />
          </UFormField>
          <UFormField label="Topic" name="topic">
            <UInput v-model="state.topic" placeholder="e.g. Career planning" />
          </UFormField>
        </div>
        <UFormField label="Notes" name="notes">
          <RichTextEditor
            v-model="state.notes"
            placeholder="What you discussed, action items…"
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="open = false">
          Cancel
        </UButton>
        <UButton color="primary" @click="onSubmit">Log session</UButton>
      </div>
    </template>
  </UModal>
</template>
