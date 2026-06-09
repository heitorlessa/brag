<script setup lang="ts">
definePageMeta({ title: "Dashboard" });

const { achievements } = useAchievements();
const { goals } = useGoals();
const { people } = useMentoring();
const { enablement } = useEnablement();
const { reflections } = useEnergy();

const activeGoals = computed(() =>
  goals.value.filter((g) => g.status === "in_progress")
);
const activePeople = computed(() => people.value.filter((p) => p.active));

const stats = computed(() => [
  {
    label: "Achievements",
    value: achievements.value.length,
    icon: "i-lucide-trophy",
    to: "/achievements",
  },
  {
    label: "Active goals",
    value: activeGoals.value.length,
    icon: "i-lucide-target",
    to: "/goals",
  },
  {
    label: "Mentees",
    value: activePeople.value.length,
    icon: "i-lucide-users",
    to: "/mentoring",
  },
  {
    label: "Enablement",
    value: enablement.value.length,
    icon: "i-lucide-presentation",
    to: "/enablement",
  },
]);

const recentAchievements = computed(() => achievements.value.slice(0, 4));
const topGoals = computed(() =>
  (activeGoals.value.length ? activeGoals.value : goals.value).slice(0, 4)
);
const recentEnablement = computed(() => enablement.value.slice(0, 4));

const chartData = computed(() => reflections.value.slice(-10));
const latest = computed(
  () => reflections.value[reflections.value.length - 1] ?? null
);
const signal = computed(() => analyzeEnergy(reflections.value));
const signalColor = computed(
  () =>
    ({ ok: "success", watch: "warning", alert: "error" })[signal.value.level] as
      | "success"
      | "warning"
      | "error"
);
</script>

<template>
  <div class="space-y-6">
    <AppPageHeader
      title="Dashboard"
      description="A quick read on your wins, goals, and energy."
      icon="i-lucide-layout-dashboard"
    />

    <!-- Stat tiles -->
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <ULink
        v-for="stat in stats"
        :key="stat.label"
        :to="stat.to"
        class="hover:border-primary/40 rounded-xl border border-[var(--ui-border)] p-4 transition"
      >
        <div class="flex items-center gap-2 text-[var(--ui-text-dimmed)]">
          <UIcon :name="stat.icon" class="size-4" />
          <span class="text-xs">{{ stat.label }}</span>
        </div>
        <p
          class="mt-1 text-2xl font-semibold text-[var(--ui-text-highlighted)]"
        >
          {{ stat.value }}
        </p>
      </ULink>
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
      <!-- Recent achievements -->
      <UCard :ui="{ body: 'space-y-3' }">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-[var(--ui-text-highlighted)]">
            Recent wins
          </h3>
          <UButton
            label="All"
            to="/achievements"
            color="neutral"
            variant="link"
            size="xs"
            trailing-icon="i-lucide-arrow-right"
          />
        </div>
        <p
          v-if="!recentAchievements.length"
          class="py-6 text-center text-sm text-[var(--ui-text-dimmed)]"
        >
          No achievements yet.
        </p>
        <ul v-else class="space-y-2">
          <li
            v-for="achievement in recentAchievements"
            :key="achievement.id"
            class="flex items-baseline justify-between gap-3"
          >
            <span class="truncate text-sm text-[var(--ui-text)]">
              {{ achievement.title }}
            </span>
            <span class="shrink-0 text-xs text-[var(--ui-text-dimmed)]">
              {{ formatDate(achievement.occurredAt) }}
            </span>
          </li>
        </ul>
      </UCard>

      <!-- Active goals -->
      <UCard :ui="{ body: 'space-y-3' }">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-[var(--ui-text-highlighted)]">Goals</h3>
          <UButton
            label="All"
            to="/goals"
            color="neutral"
            variant="link"
            size="xs"
            trailing-icon="i-lucide-arrow-right"
          />
        </div>
        <p
          v-if="!topGoals.length"
          class="py-6 text-center text-sm text-[var(--ui-text-dimmed)]"
        >
          No goals yet.
        </p>
        <ul v-else class="space-y-3">
          <li v-for="goal in topGoals" :key="goal.id">
            <div class="mb-1 flex items-center justify-between gap-3 text-sm">
              <span class="truncate text-[var(--ui-text)]">{{
                goal.title
              }}</span>
              <span class="shrink-0 text-xs text-[var(--ui-text-dimmed)]">
                {{ goal.progress }}%
              </span>
            </div>
            <UProgress :model-value="goal.progress" :max="100" size="sm" />
          </li>
        </ul>
      </UCard>

      <!-- Energy -->
      <UCard :ui="{ body: 'space-y-3' }">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-[var(--ui-text-highlighted)]">
            Energy
          </h3>
          <UButton
            label="Check in"
            to="/energy"
            color="neutral"
            variant="link"
            size="xs"
            trailing-icon="i-lucide-arrow-right"
          />
        </div>
        <UBadge :color="signalColor" variant="soft">{{ signal.title }}</UBadge>
        <EnergyTrendChart v-if="chartData.length" :reflections="chartData" />
        <p v-else class="py-6 text-center text-sm text-[var(--ui-text-dimmed)]">
          No weekly reflections yet.
        </p>
        <p v-if="latest" class="text-xs text-[var(--ui-text-dimmed)]">
          Last check-in: week of {{ formatWeekLabel(latest.weekStart) }}
        </p>
      </UCard>

      <!-- Enablement -->
      <UCard :ui="{ body: 'space-y-3' }">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-[var(--ui-text-highlighted)]">
            Enablement
          </h3>
          <UButton
            label="All"
            to="/enablement"
            color="neutral"
            variant="link"
            size="xs"
            trailing-icon="i-lucide-arrow-right"
          />
        </div>
        <p
          v-if="!recentEnablement.length"
          class="py-6 text-center text-sm text-[var(--ui-text-dimmed)]"
        >
          Nothing logged yet.
        </p>
        <ul v-else class="space-y-2">
          <li
            v-for="item in recentEnablement"
            :key="item.id"
            class="flex items-center justify-between gap-3"
          >
            <span class="inline-flex min-w-0 items-center gap-2">
              <UIcon
                :name="enablementTypeMeta[item.type].icon"
                class="text-secondary size-4 shrink-0"
              />
              <span class="truncate text-sm text-[var(--ui-text)]">
                {{ item.title }}
              </span>
            </span>
            <span class="shrink-0 text-xs text-[var(--ui-text-dimmed)]">
              {{ formatDate(item.date) }}
            </span>
          </li>
        </ul>
      </UCard>
    </div>
  </div>
</template>
