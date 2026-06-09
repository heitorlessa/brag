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
    icon: "i-lucide-users-round",
    to: "/mentoring",
  },
  {
    label: "Enablement",
    value: enablement.value.length,
    icon: "i-lucide-presentation",
    to: "/enablement",
  },
]);

const recentAchievements = computed(() => achievements.value.slice(0, 5));
const topGoals = computed(() =>
  (activeGoals.value.length ? activeGoals.value : goals.value).slice(0, 4)
);
const recentEnablement = computed(() => enablement.value.slice(0, 4));

const chartData = computed(() => reflections.value.slice(-12));
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

const energyRows = computed(() =>
  latest.value
    ? [
        { label: "Energy", value: latest.value.energy },
        { label: "Workload", value: latest.value.workload },
        { label: "Satisfaction", value: latest.value.satisfaction },
      ]
    : []
);
</script>

<template>
  <div class="space-y-10">
    <!-- Hero -->
    <FadeIn>
      <div>
        <p class="text-sm text-[var(--ui-text-dimmed)]">{{ longDate() }}</p>
        <h1
          class="mt-1 text-3xl font-semibold tracking-tight text-[var(--ui-text-highlighted)]"
        >
          {{ greeting() }}.
        </h1>
        <p class="mt-1.5 text-[var(--ui-text-muted)]">
          Here's your record at a glance — and a nudge on your energy.
        </p>
      </div>
    </FadeIn>

    <!-- Stat strip (hairline-separated, no boxes) -->
    <FadeIn :delay="0.05">
      <div
        class="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-[var(--ui-border)]/60 ring-1 ring-[var(--ui-border)]/60 sm:grid-cols-4"
      >
        <ULink
          v-for="stat in stats"
          :key="stat.label"
          :to="stat.to"
          class="group bg-[var(--ui-bg)] p-5 transition-colors hover:bg-[var(--ui-bg-muted)]/40"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs text-[var(--ui-text-muted)]">
              {{ stat.label }}
            </span>
            <UIcon
              :name="stat.icon"
              class="group-hover:text-primary size-4 text-[var(--ui-text-dimmed)] transition-colors"
            />
          </div>
          <p
            class="mt-2 text-3xl font-semibold tracking-tight text-[var(--ui-text-highlighted)]"
          >
            {{ stat.value }}
          </p>
        </ULink>
      </div>
    </FadeIn>

    <!-- Energy band -->
    <FadeIn :delay="0.1">
      <section class="surface surface-hover p-5 sm:p-6">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <h2 class="font-semibold text-[var(--ui-text-highlighted)]">
              Energy
            </h2>
            <AppPopover
              mode="hover"
              :title="signal.title"
              icon="i-lucide-activity"
              side="bottom"
              align="start"
            >
              <template #trigger>
                <UBadge
                  :color="signalColor"
                  variant="soft"
                  class="cursor-default"
                >
                  {{ signal.title }}
                </UBadge>
              </template>
              <p class="text-sm text-[var(--ui-text-muted)]">
                {{ signal.message }}
              </p>
              <div v-if="energyRows.length" class="mt-3 space-y-1.5">
                <div
                  v-for="row in energyRows"
                  :key="row.label"
                  class="flex items-center gap-2"
                >
                  <span class="w-20 text-xs text-[var(--ui-text-dimmed)]">
                    {{ row.label }}
                  </span>
                  <div class="flex gap-1">
                    <span
                      v-for="n in 5"
                      :key="n"
                      class="size-1.5 rounded-full"
                      :class="
                        n <= row.value ? 'bg-primary' : 'bg-[var(--ui-border)]'
                      "
                    />
                  </div>
                </div>
              </div>
            </AppPopover>
          </div>
          <UButton
            label="Check in"
            to="/energy"
            color="neutral"
            variant="ghost"
            size="xs"
            trailing-icon="i-lucide-arrow-right"
          />
        </div>
        <EnergyTrendChart v-if="chartData.length" :reflections="chartData" />
        <div
          v-else
          class="flex flex-col items-center py-8 text-center text-sm text-[var(--ui-text-dimmed)]"
        >
          <UIcon name="i-lucide-activity" class="mb-2 size-6 opacity-60" />
          No weekly reflections yet — start with this week.
        </div>
      </section>
    </FadeIn>

    <!-- Wins + Goals -->
    <div class="grid gap-x-10 gap-y-10 lg:grid-cols-2">
      <FadeIn :delay="0.15">
        <section>
          <DashboardSectionHeader title="Recent wins" to="/achievements" />
          <p
            v-if="!recentAchievements.length"
            class="text-sm text-[var(--ui-text-dimmed)]"
          >
            No achievements yet.
          </p>
          <ul v-else class="divide-hair -mx-2">
            <li
              v-for="achievement in recentAchievements"
              :key="achievement.id"
              class="flex items-baseline justify-between gap-3 rounded-lg px-2 py-2.5"
            >
              <span class="truncate text-sm text-[var(--ui-text)]">
                {{ achievement.title }}
              </span>
              <span class="shrink-0 text-xs text-[var(--ui-text-dimmed)]">
                {{ formatDate(achievement.occurredAt) }}
              </span>
            </li>
          </ul>
        </section>
      </FadeIn>

      <FadeIn :delay="0.2">
        <section>
          <DashboardSectionHeader title="Goals" to="/goals" />
          <p
            v-if="!topGoals.length"
            class="text-sm text-[var(--ui-text-dimmed)]"
          >
            No goals yet.
          </p>
          <ul v-else class="space-y-4">
            <li v-for="goal in topGoals" :key="goal.id">
              <div
                class="mb-1.5 flex items-center justify-between gap-3 text-sm"
              >
                <span class="truncate text-[var(--ui-text)]">
                  {{ goal.title }}
                </span>
                <span class="shrink-0 text-xs text-[var(--ui-text-dimmed)]">
                  {{ goal.progress }}%
                </span>
              </div>
              <UProgress :model-value="goal.progress" :max="100" size="sm" />
            </li>
          </ul>
        </section>
      </FadeIn>
    </div>

    <!-- Enablement -->
    <FadeIn :delay="0.25">
      <section>
        <DashboardSectionHeader title="Enablement" to="/enablement" />
        <p
          v-if="!recentEnablement.length"
          class="text-sm text-[var(--ui-text-dimmed)]"
        >
          Nothing logged yet.
        </p>
        <ul v-else class="divide-hair -mx-2">
          <li
            v-for="item in recentEnablement"
            :key="item.id"
            class="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5"
          >
            <span class="inline-flex min-w-0 items-center gap-2.5">
              <UIcon
                :name="enablementTypeMeta[item.type].icon"
                class="size-4 shrink-0 text-[var(--ui-text-dimmed)]"
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
      </section>
    </FadeIn>
  </div>
</template>
