<script setup lang="ts">
import { useStorage } from "@vueuse/core";

definePageMeta({ title: "Energy" });

const { reflections, isLoading, save, remove } = useEnergy();
const toast = useToast();

// Remembered preference: progressive check-in (default) vs quick single-screen.
const quick = useStorage("brag:energy-quick", false);

const selectedWeek = ref(currentWeekStart());
const existing = computed(
  () =>
    reflections.value.find((r) => r.weekStart === selectedWeek.value) ?? null
);
const isCurrentWeek = computed(() => selectedWeek.value === currentWeekStart());

function shiftWeek(by: number): void {
  const next = addWeeks(selectedWeek.value, by);
  if (next <= currentWeekStart()) selectedWeek.value = next;
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

const chartData = computed(() => reflections.value.slice(-16));
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

    <div class="grid gap-5 lg:grid-cols-5">
      <!-- Check-in -->
      <section class="surface p-5 sm:p-6 lg:col-span-3">
        <div class="mb-5 flex items-center justify-between gap-3">
          <div class="flex items-center gap-1">
            <UButton
              icon="i-lucide-chevron-left"
              color="neutral"
              variant="ghost"
              size="xs"
              aria-label="Previous week"
              @click="shiftWeek(-1)"
            />
            <div class="min-w-0 text-center">
              <p class="text-sm font-medium text-[var(--ui-text)]">
                {{ formatWeekLabel(selectedWeek) }}
              </p>
              <p class="text-[11px] text-[var(--ui-text-dimmed)]">
                {{
                  existing ? "Saved" : isCurrentWeek ? "This week" : "No entry"
                }}
              </p>
            </div>
            <UButton
              icon="i-lucide-chevron-right"
              color="neutral"
              variant="ghost"
              size="xs"
              :disabled="isCurrentWeek"
              aria-label="Next week"
              @click="shiftWeek(1)"
            />
          </div>

          <UTooltip text="Quick mode shows everything on one screen">
            <label
              class="flex cursor-pointer items-center gap-2 text-xs text-[var(--ui-text-muted)]"
            >
              Quick
              <USwitch v-model="quick" size="sm" />
            </label>
          </UTooltip>
        </div>

        <EnergyCheckIn
          :key="selectedWeek"
          :initial="existing"
          :week-label="selectedWeek"
          :saved="Boolean(existing)"
          :quick="quick"
          @save="onSave"
        />
      </section>

      <!-- Trend -->
      <section class="surface space-y-3 p-5 sm:p-6 lg:col-span-2">
        <h3 class="font-semibold text-[var(--ui-text-highlighted)]">Trend</h3>
        <EnergyTrendChart v-if="chartData.length" :reflections="chartData" />
        <p
          v-else
          class="py-10 text-center text-sm text-[var(--ui-text-dimmed)]"
        >
          Save a few weeks to see your trend.
        </p>
      </section>
    </div>

    <!-- History -->
    <h3
      class="mt-8 mb-3 text-xs font-semibold tracking-wide text-[var(--ui-text-dimmed)] uppercase"
    >
      History
    </h3>
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
  </div>
</template>
