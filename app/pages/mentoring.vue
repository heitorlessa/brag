<script setup lang="ts">
import type { Person } from "~/local-db";
import type { PersonInput } from "~/services/mentoring";

definePageMeta({ title: "Mentoring" });

const { people, isLoading, create, update, remove } = useMentoring();
const toast = useToast();

const modalOpen = ref(false);
const editing = ref<Person | null>(null);

function openCreate(): void {
  editing.value = null;
  modalOpen.value = true;
}

function openEdit(person: Person): void {
  editing.value = person;
  modalOpen.value = true;
}

async function onSaved(input: PersonInput, id: string | null): Promise<void> {
  if (id) {
    await update(id, input);
    toast.add({ title: "Person updated", color: "success" });
  } else {
    await create(input);
    toast.add({ title: "Person added", color: "success" });
  }
}

async function onDelete(id: string): Promise<void> {
  await remove(id);
  toast.add({ title: "Person deleted", color: "neutral" });
}
</script>

<template>
  <div>
    <AppPageHeader
      title="Mentoring"
      description="People you mentor — ad-hoc or regular — and the sessions you've had."
      icon="i-lucide-users"
    >
      <template #actions>
        <UButton icon="i-lucide-plus" label="Add" @click="openCreate" />
      </template>
    </AppPageHeader>

    <div
      v-if="isLoading"
      class="py-10 text-center text-sm text-[var(--ui-text-dimmed)]"
    >
      Loading…
    </div>

    <AppEmptyState
      v-else-if="!people.length"
      icon="i-lucide-users"
      title="No mentees yet"
      description="Add the people you mentor and log your sessions over time."
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          label="Add your first"
          @click="openCreate"
        />
      </template>
    </AppEmptyState>

    <div v-else class="grid gap-3 md:grid-cols-2">
      <PersonCard
        v-for="person in people"
        :key="person.id"
        :person="person"
        @edit="openEdit(person)"
        @delete="onDelete(person.id)"
      />
    </div>

    <PersonFormModal
      v-model:open="modalOpen"
      :person="editing"
      @saved="onSaved"
    />
  </div>
</template>
