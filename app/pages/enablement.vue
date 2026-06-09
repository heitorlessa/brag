<script setup lang="ts">
import type { Enablement } from "~/local-db";
import type { EnablementInput } from "~/services/enablement";

definePageMeta({ title: "Enablement" });

const { enablement, isLoading, create, update, remove } = useEnablement();
const toast = useToast();

const modalOpen = ref(false);
const editing = ref<Enablement | null>(null);

function openCreate(): void {
  editing.value = null;
  modalOpen.value = true;
}

function openEdit(item: Enablement): void {
  editing.value = item;
  modalOpen.value = true;
}

async function onSaved(
  input: EnablementInput,
  id: string | null
): Promise<void> {
  if (id) {
    await update(id, input);
    toast.add({ title: "Enablement updated", color: "success" });
  } else {
    await create(input);
    toast.add({ title: "Enablement added", color: "success" });
  }
}

async function onDelete(id: string): Promise<void> {
  await remove(id);
  toast.add({ title: "Enablement deleted", color: "neutral" });
}
</script>

<template>
  <div>
    <AppPageHeader
      title="Enablement"
      description="Workshops, talks, training and docs you ran to level others up."
      icon="i-lucide-presentation"
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
      v-else-if="!enablement.length"
      icon="i-lucide-presentation"
      title="No enablement logged yet"
      description="Record the sessions and materials you delivered for others."
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          label="Add your first"
          @click="openCreate"
        />
      </template>
    </AppEmptyState>

    <div v-else class="space-y-3">
      <UCard
        v-for="item in enablement"
        :key="item.id"
        :ui="{ body: 'space-y-2' }"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-start gap-3">
            <span
              class="bg-secondary/10 text-secondary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg"
            >
              <UIcon
                :name="enablementTypeMeta[item.type].icon"
                class="size-5"
              />
            </span>
            <div class="min-w-0">
              <h3 class="font-semibold text-[var(--ui-text-highlighted)]">
                {{ item.title }}
              </h3>
              <div
                class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--ui-text-dimmed)]"
              >
                <span>{{ enablementTypeMeta[item.type].label }}</span>
                <span class="inline-flex items-center gap-1">
                  <UIcon name="i-lucide-calendar" class="size-3.5" />
                  {{ formatDate(item.date) }}
                </span>
                <span v-if="item.audience">{{ item.audience }}</span>
                <span
                  v-if="item.attendees != null"
                  class="inline-flex items-center gap-1"
                >
                  <UIcon name="i-lucide-users" class="size-3.5" />
                  {{ item.attendees }}
                </span>
                <a
                  v-if="item.link"
                  :href="item.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary inline-flex items-center gap-1 hover:underline"
                >
                  <UIcon name="i-lucide-link" class="size-3.5" />
                  Link
                </a>
              </div>
            </div>
          </div>
          <div class="flex shrink-0 gap-1">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="Edit"
              @click="openEdit(item)"
            />
            <ConfirmButton
              message="Delete this enablement?"
              @confirm="onDelete(item.id)"
            />
          </div>
        </div>
        <p v-if="item.notes" class="text-sm text-[var(--ui-text-muted)]">
          {{ markdownExcerpt(item.notes) }}
        </p>
      </UCard>
    </div>

    <EnablementFormModal
      v-model:open="modalOpen"
      :item="editing"
      @saved="onSaved"
    />
  </div>
</template>
