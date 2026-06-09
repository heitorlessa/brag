<script setup lang="ts">
import { z } from "zod";
import type { Person, Relationship } from "~/local-db";
import type { PersonInput } from "~/services/mentoring";

const open = defineModel<boolean>("open", { required: true });

const props = defineProps<{ person?: Person | null }>();
const emit = defineEmits<{ saved: [PersonInput, string | null] }>();

const relationshipItems: { label: string; value: Relationship }[] = [
  { label: "Ad-hoc", value: "ad_hoc" },
  { label: "Regular", value: "regular" },
];

interface FormState {
  name: string;
  role: string;
  relationship: Relationship;
  cadence: string;
  startedAt: string;
  active: boolean;
  notes: string;
}

function blank(): FormState {
  return {
    name: "",
    role: "",
    relationship: "ad_hoc",
    cadence: "",
    startedAt: today(),
    active: true,
    notes: "",
  };
}

const state = reactive<FormState>(blank());
const schema = z.object({ name: z.string().min(1, "Name is required") });
const isEdit = computed(() => Boolean(props.person));

watch(open, (isOpen) => {
  if (!isOpen) return;
  const p = props.person;
  Object.assign(
    state,
    p
      ? {
          name: p.name,
          role: p.role,
          relationship: p.relationship,
          cadence: p.cadence,
          startedAt: p.startedAt ?? "",
          active: p.active,
          notes: p.notes,
        }
      : blank()
  );
});

function onSubmit(): void {
  const input: PersonInput = {
    name: state.name.trim(),
    role: state.role.trim(),
    relationship: state.relationship,
    cadence: state.cadence.trim(),
    startedAt: state.startedAt || null,
    active: state.active,
    notes: state.notes,
  };
  emit("saved", input, props.person?.id ?? null);
  open.value = false;
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEdit ? 'Edit person' : 'New person'"
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
          <UFormField label="Name" name="name" required>
            <UInput v-model="state.name" placeholder="Who are you mentoring?" />
          </UFormField>
          <UFormField label="Role" name="role">
            <UInput v-model="state.role" placeholder="e.g. Junior engineer" />
          </UFormField>
          <UFormField label="Relationship" name="relationship">
            <USelectMenu
              v-model="state.relationship"
              :items="relationshipItems"
              value-key="value"
            />
          </UFormField>
          <UFormField label="Cadence" name="cadence">
            <UInput
              v-model="state.cadence"
              placeholder="e.g. Biweekly, On request"
            />
          </UFormField>
          <UFormField label="Started" name="startedAt">
            <AppDatePicker v-model="state.startedAt" placeholder="Optional" />
          </UFormField>
          <UFormField label="Active" name="active">
            <USwitch v-model="state.active" />
          </UFormField>
        </div>

        <UFormField label="Notes" name="notes">
          <RichTextEditor
            v-model="state.notes"
            placeholder="Context, focus areas, growth themes…"
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
          {{ isEdit ? "Save changes" : "Add person" }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
