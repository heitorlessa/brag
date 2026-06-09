<script setup lang="ts">
import { useStorage } from "@vueuse/core";

definePageMeta({ title: "Energy" });

const { reflections, isLoading, save, remove } = useEnergy();
const toast = useToast();

// Remembered preference: progressive check-in (default) vs quick single-screen.
const quick = useStorage("brag:energy-quick", false);

// The check-in is focused on NOW by default. Editing a past week is initiated
// from History (which sets the selected week), with a clear way back to now.
const selectedWeek = ref(currentWeekStart());
const existing = computed(
  () =>
    reflections.value.find((r) => r.weekStart === selectedWeek.value) ?? null
);
const isCurrentWeek = computed(() => selectedWeek.value === currentWeekStart());

function backToThisWeek(): void {
  selectedWeek.value = currentWeekStart();
}

async function onSave(payload: {
  energy: number;
  workload: number;
  satisfaction: number;
  note: string;
}): Promise<void> {
  await save({ weekStart: selectedWeek.value, ...payload });
  toast.add({ title: "Reflection saved", color: "success" });
}

async function onDelete(id: string): Promise<void> {
  await remove(id);
  toast.add({ title: "Reflection deleted", color: "neutral" });
}

function editWeek(weekStart: string): void {
  selectedWeek.value = weekStart;
  if (import.meta.client) window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Trend range ──────────────────────────────────────────────────────────
const ranges = [
  { label: "12w", value: 12 },
  { label: "26w", value: 26 },
  { label: "All", value: 0 },
];
const rangeWeeks = ref(12);
const chartData = computed(() =>
  rangeWeeks.value === 0
    ? reflections.value
    : reflections.value.slice(-rangeWeeks.value)
);

const recent = computed(() => reflections.value.toReversed());
const signal = computed(() => analyzeEnergy(reflections.value));
const signalColor = computed(
  () =>
    ({ ok: "success", watch: "warning", alert: "error" })[signal.value.level] as
      | "success"
      | "warning"
      | "error"
);
const signalIcon = computed(
  () =>
    ({
      ok: "i-lucide-battery-full",
      watch: "i-lucide-battery-medium",
      alert: "i-lucide-battery-warning",
    })[signal.value.level]
);
</script>

<template>
  <div>
    <AppPageHeader
      title="Energy"
      description="A weekly check-in to catch burnout early and know when you need a reset."
    />

    <UAlert
      :color="signalColor"
      :icon="signalIcon"
      variant="soft"
      :title="signal.title"
      :description="signal.message"
      class="mb-6"
    />

    <!-- 1 · Record now -->
    <section class="surface p-5 sm:p-7">
      <div class="mx-auto max-w-2xl">
        <div class="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2
              class="font-semibold tracking-tight text-[var(--ui-text-highlighted)]"
            >
              {{ isCurrentWeek ? "This week" : "Edit a past week" }}
            </h2>
            <p class="mt-0.5 text-xs text-[var(--ui-text-dimmed)]">
              {{ formatWeekLabel(selectedWeek)
              }}<span v-if="existing"> · saved</span>
            </p>
          </div>
          <div class="flex items-center gap-3">
            <UButton
              v-if="!isCurrentWeek"
              icon="i-lucide-corner-up-left"
              label="Back to this week"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="backToThisWeek"
            />
            <UTooltip text="Show everything on one screen">
              <label
                class="flex cursor-pointer items-center gap-2 text-xs text-[var(--ui-text-muted)]"
              >
                Quick
                <USwitch v-model="quick" size="sm" />
              </label>
            </UTooltip>
          </div>
        </div>

        <EnergyCheckIn
          :key="selectedWeek"
          :initial="existing"
          :week-label="selectedWeek"
          :saved="Boolean(existing)"
          :quick="quick"
          @save="onSave"
        />
      </div>
    </section>

    <!-- 2 · See trends -->
    <section class="surface mt-6 space-y-4 p-5 sm:p-7">
      <div class="flex items-center justify-between gap-3">
        <h2
          class="font-semibold tracking-tight text-[var(--ui-text-highlighted)]"
        >
          Trend
        </h2>
        <div
          v-if="reflections.length"
          class="flex gap-0.5 rounded-lg bg-[var(--ui-bg-muted)]/60 p-0.5"
        >
          <button
            v-for="r in ranges"
            :key="r.label"
            type="button"
            class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
            :class="
              rangeWeeks === r.value
                ? 'bg-[var(--ui-bg)] text-[var(--ui-text-highlighted)] shadow-sm'
                : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
            "
            @click="rangeWeeks = r.value"
          >
            {{ r.label }}
          </button>
        </div>
      </div>
      <EnergyTrendChart v-if="chartData.length" :reflections="chartData" />
      <p v-else class="py-12 text-center text-sm text-[var(--ui-text-dimmed)]">
        Save a few weeks to see your trend.
      </p>
    </section>

    <!-- 3 · Go back in time -->
    <section class="mt-8">
      <div class="mb-3 flex items-baseline justify-between">
        <h2
          class="font-semibold tracking-tight text-[var(--ui-text-highlighted)]"
        >
          History
        </h2>
        <span class="text-xs text-[var(--ui-text-dimmed)]">
          Revisit or edit past weeks
        </span>
      </div>

      <div
        v-if="isLoading"
        class="py-6 text-center text-sm text-[var(--ui-text-dimmed)]"
      >
        Loading…
      </div>
      <p
        v-else-if="!recent.length"
        class="py-6 text-center text-sm text-[var(--ui-text-dimmed)]"
      >
        No reflections yet.
      </p>
      <div v-else class="surface divide-hair overflow-hidden">
        <div
          v-for="reflection in recent"
          :key="reflection.id"
          class="group flex items-center justify-between gap-3 p-4 transition-colors hover:bg-[var(--ui-bg-muted)]/40 sm:px-5"
        >
          <div class="min-w-0">
            <p class="text-sm font-medium text-[var(--ui-text)]">
              {{ formatWeekLabel(reflection.weekStart) }}
            </p>
            <div class="mt-1 flex gap-3 text-xs text-[var(--ui-text-muted)]">
              <span>⚡ {{ reflection.energy }}</span>
              <span>📊 {{ reflection.workload }}</span>
              <span>😊 {{ reflection.satisfaction }}</span>
            </div>
            <p
              v-if="reflection.note"
              class="mt-1 truncate text-xs text-[var(--ui-text-dimmed)]"
            >
              {{ markdownExcerpt(reflection.note, 100) }}
            </p>
          </div>
          <div
            class="flex shrink-0 gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
          >
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="Edit"
              @click="editWeek(reflection.weekStart)"
            />
            <ConfirmButton
              message="Delete this reflection?"
              @confirm="onDelete(reflection.id)"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
