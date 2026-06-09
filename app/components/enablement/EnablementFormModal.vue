<script setup lang="ts">
import { z } from "zod";
import type { Enablement, EnablementType } from "~/local-db";
import type { EnablementInput } from "~/services/enablement";

const open = defineModel<boolean>("open", { required: true });

const props = defineProps<{ item?: Enablement | null }>();
const emit = defineEmits<{ saved: [EnablementInput, string | null] }>();

const typeItems = (
  Object.entries(enablementTypeMeta) as [
    EnablementType,
    { label: string; icon: string },
  ][]
).map(([value, meta]) => ({ label: meta.label, value }));

interface FormState {
  title: string;
  type: EnablementType;
  date: string;
  audience: string;
  attendees: number | null;
  link: string;
  notes: string;
}

function blank(): FormState {
  return {
    title: "",
    type: "workshop",
    date: today(),
    audience: "",
    attendees: null,
    link: "",
    notes: "",
  };
}

const state = reactive<FormState>(blank());

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
});

const isEdit = computed(() => Boolean(props.item));

watch(open, (isOpen) => {
  if (!isOpen) return;
  const e = props.item;
  Object.assign(
    state,
    e
      ? {
          title: e.title,
          type: e.type,
          date: e.date,
          audience: e.audience,
          attendees: e.attendees,
          link: e.link ?? "",
          notes: e.notes,
        }
      : blank()
  );
});

function onSubmit(): void {
  const input: EnablementInput = {
    title: state.title.trim(),
    type: state.type,
    date: state.date,
    audience: state.audience.trim(),
    attendees:
      state.attendees === null || Number.isNaN(state.attendees)
        ? null
        : state.attendees,
    link: state.link.trim() || null,
    notes: state.notes,
  };
  emit("saved", input, props.item?.id ?? null);
  open.value = false;
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEdit ? 'Edit enablement' : 'New enablement'"
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
            placeholder="e.g. Onboarding workshop"
          />
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-3">
          <UFormField label="Type" name="type">
            <USelectMenu
              v-model="state.type"
              :items="typeItems"
              value-key="value"
            />
          </UFormField>
          <UFormField label="Date" name="date" required>
            <AppDatePicker v-model="state.date" />
          </UFormField>
          <UFormField label="Attendees" name="attendees">
            <UInput v-model.number="state.attendees" type="number" min="0" />
          </UFormField>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Audience" name="audience">
            <UInput
              v-model="state.audience"
              placeholder="e.g. New hires, Platform team"
            />
          </UFormField>
          <UFormField label="Link" name="link">
            <UInput
              v-model="state.link"
              placeholder="Slides, recording, doc…"
            />
          </UFormField>
        </div>

        <UFormField label="Notes" name="notes">
          <RichTextEditor
            v-model="state.notes"
            placeholder="What you covered, feedback, follow-ups…"
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
          {{ isEdit ? "Save changes" : "Add enablement" }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
