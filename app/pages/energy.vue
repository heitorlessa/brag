<script setup lang="ts">
definePageMeta({ title: "Energy" });

const { reflections, isLoading, save, remove } = useEnergy();
const toast = useToast();

const selectedWeek = ref(currentWeekStart());
const weekModel = computed({
  get: () => selectedWeek.value,
  set: (value: string) => {
    if (value) selectedWeek.value = isoWeekStart(value);
  },
});

const form = reactive({ energy: 3, workload: 3, satisfaction: 3, note: "" });

const existing = computed(
  () =>
    reflections.value.find((r) => r.weekStart === selectedWeek.value) ?? null
);

function prefill(): void {
  form.energy = existing.value?.energy ?? 3;
  form.workload = existing.value?.workload ?? 3;
  form.satisfaction = existing.value?.satisfaction ?? 3;
  form.note = existing.value?.note ?? "";
}

watch([selectedWeek, existing], prefill, { immediate: true });

async function onSave(): Promise<void> {
  await save({
    weekStart: selectedWeek.value,
    energy: form.energy,
    workload: form.workload,
    satisfaction: form.satisfaction,
    note: form.note,
  });
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

const sliders = [
  { key: "energy" as const, label: "Energy", hint: "1 drained · 5 energized" },
  { key: "workload" as const, label: "Workload", hint: "1 light · 5 crushing" },
  {
    key: "satisfaction" as const,
    label: "Satisfaction",
    hint: "1 low · 5 high",
  },
];
</script>

<template>
  <div>
    <AppPageHeader
      title="Energy"
      description="A weekly check-in to catch burnout early and know when you need a reset."
      icon="i-lucide-battery-charging"
    />

    <UAlert
      :color="signalColor"
      :icon="signalIcon"
      variant="soft"
      :title="signal.title"
      :description="signal.message"
      class="mb-5"
    />

    <div class="grid gap-5 lg:grid-cols-2">
      <!-- Weekly reflection form -->
      <UCard :ui="{ body: 'space-y-4' }">
        <div class="flex items-center justify-between gap-3">
          <h3 class="font-semibold text-[var(--ui-text-highlighted)]">
            Reflection
          </h3>
          <UInput v-model="weekModel" type="date" size="sm" />
        </div>
        <p class="-mt-2 text-xs text-[var(--ui-text-dimmed)]">
          Week of {{ formatWeekLabel(selectedWeek) }}
          <span v-if="existing" class="text-primary">· saved</span>
        </p>

        <div v-for="slider in sliders" :key="slider.key">
          <div class="mb-1 flex items-center justify-between text-sm">
            <span class="text-[var(--ui-text)]">{{ slider.label }}</span>
            <span class="font-semibold text-[var(--ui-text-highlighted)]">
              {{ form[slider.key] }}/5
            </span>
          </div>
          <USlider v-model="form[slider.key]" :min="1" :max="5" :step="1" />
          <p class="mt-1 text-xs text-[var(--ui-text-dimmed)]">
            {{ slider.hint }}
          </p>
        </div>

        <UFormField label="Note">
          <RichTextEditor
            v-model="form.note"
            placeholder="What drained or recharged you this week…"
          />
        </UFormField>

        <div class="flex justify-end">
          <UButton
            icon="i-lucide-save"
            label="Save reflection"
            @click="onSave"
          />
        </div>
      </UCard>

      <!-- Trend -->
      <UCard :ui="{ body: 'space-y-3' }">
        <h3 class="font-semibold text-[var(--ui-text-highlighted)]">Trend</h3>
        <EnergyTrendChart v-if="chartData.length" :reflections="chartData" />
        <p
          v-else
          class="py-10 text-center text-sm text-[var(--ui-text-dimmed)]"
        >
          Save a few weeks to see your trend.
        </p>
      </UCard>
    </div>

    <!-- History -->
    <h3
      class="mt-7 mb-3 text-sm font-semibold tracking-wide text-[var(--ui-text-dimmed)] uppercase"
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
    <div v-else class="space-y-2">
      <UCard
        v-for="reflection in recent"
        :key="reflection.id"
        :ui="{ body: 'py-3' }"
      >
        <div class="flex items-center justify-between gap-3">
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
          <div class="flex shrink-0 gap-1">
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
      </UCard>
    </div>
  </div>
</template>
