<script setup lang="ts">
import type { MentoringSession, Person } from "~/local-db";
import type { MentoringSessionInput } from "~/services/mentoring";
import {
  createSession,
  listSessions,
  removeSession,
} from "~/services/mentoring";

const props = defineProps<{ person: Person }>();
defineEmits<{ edit: []; delete: [] }>();

const toast = useToast();
const relationship = computed(
  () => relationshipMeta[props.person.relationship]
);

const expanded = ref(false);
const sessions = ref<MentoringSession[]>([]);
const loadingSessions = ref(false);
const sessionModalOpen = ref(false);

async function loadSessions(): Promise<void> {
  loadingSessions.value = true;
  try {
    sessions.value = await listSessions(props.person.id);
  } finally {
    loadingSessions.value = false;
  }
}

async function toggle(): Promise<void> {
  expanded.value = !expanded.value;
  if (expanded.value && !sessions.value.length) await loadSessions();
}

async function onLogged(
  input: Omit<MentoringSessionInput, "personId">
): Promise<void> {
  await createSession({ ...input, personId: props.person.id });
  toast.add({ title: "Session logged", color: "success" });
  expanded.value = true;
  await loadSessions();
}

async function onDeleteSession(id: string): Promise<void> {
  await removeSession(id);
  await loadSessions();
}
</script>

<template>
  <article class="surface surface-hover h-full space-y-3 p-5">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="font-semibold text-[var(--ui-text-highlighted)]">
            {{ person.name }}
          </h3>
          <UBadge :color="relationship.color" variant="soft" size="sm">
            {{ relationship.label }}
          </UBadge>
          <UBadge
            v-if="!person.active"
            color="neutral"
            variant="soft"
            size="sm"
          >
            Inactive
          </UBadge>
        </div>
        <div
          class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--ui-text-dimmed)]"
        >
          <span v-if="person.role">{{ person.role }}</span>
          <span v-if="person.cadence" class="inline-flex items-center gap-1">
            <UIcon name="i-lucide-repeat" class="size-3.5" />
            {{ person.cadence }}
          </span>
          <span v-if="person.startedAt" class="inline-flex items-center gap-1">
            <UIcon name="i-lucide-calendar" class="size-3.5" />
            since {{ formatDate(person.startedAt) }}
          </span>
        </div>
      </div>
      <div class="flex shrink-0 gap-1">
        <UButton
          icon="i-lucide-message-square-plus"
          color="neutral"
          variant="ghost"
          size="xs"
          aria-label="Log session"
          @click="sessionModalOpen = true"
        />
        <UButton
          icon="i-lucide-pencil"
          color="neutral"
          variant="ghost"
          size="xs"
          aria-label="Edit"
          @click="$emit('edit')"
        />
        <ConfirmButton
          message="Delete this person and their sessions?"
          @confirm="$emit('delete')"
        />
      </div>
    </div>

    <p v-if="person.notes" class="text-sm text-[var(--ui-text-muted)]">
      {{ markdownExcerpt(person.notes, 140) }}
    </p>

    <div class="border-t border-[var(--ui-border)] pt-2">
      <UButton
        :label="expanded ? 'Hide sessions' : 'Sessions'"
        :trailing-icon="
          expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'
        "
        color="neutral"
        variant="link"
        size="xs"
        class="px-0"
        @click="toggle"
      />

      <div v-if="expanded" class="mt-2 space-y-2">
        <p v-if="loadingSessions" class="text-xs text-[var(--ui-text-dimmed)]">
          Loading…
        </p>
        <p
          v-else-if="!sessions.length"
          class="text-xs text-[var(--ui-text-dimmed)]"
        >
          No sessions logged yet.
        </p>
        <div
          v-for="session in sessions"
          v-else
          :key="session.id"
          class="rounded-lg bg-[var(--ui-bg-muted)]/50 p-2.5"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="text-xs font-medium text-[var(--ui-text)]">
              {{ formatDate(session.date) }}
              <span v-if="session.topic" class="text-[var(--ui-text-muted)]">
                · {{ session.topic }}
              </span>
            </div>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="Delete session"
              @click="onDeleteSession(session.id)"
            />
          </div>
          <MarkdownView
            v-if="session.notes"
            :source="session.notes"
            class="mt-1"
          />
        </div>
      </div>
    </div>

    <SessionFormModal
      v-model:open="sessionModalOpen"
      :person-name="person.name"
      @saved="onLogged"
    />
  </article>
</template>
