<script setup lang="ts">
import type { MentoringSession } from "~/local-db";
import { listAllSessions } from "~/services/mentoring";

definePageMeta({ title: "Report" });

const { achievements } = useAchievements();
const { goals } = useGoals();
const { people } = useMentoring();
const { enablement } = useEnablement();
const { reflections } = useEnergy();

const sessions = ref<MentoringSession[]>([]);
onMounted(async () => {
  sessions.value = await listAllSessions();
});

// ── Period ────────────────────────────────────────────────────────────────
type Period = "week" | "month" | "quarter" | "year";
const period = ref<Period>("month");
const periods: { id: Period; label: string }[] = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "quarter", label: "Quarter" },
  { id: "year", label: "Year" },
];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

const range = computed(() => {
  const now = new Date();
  const y = now.getFullYear();
  const to = today();
  let from = to;
  if (period.value === "week") from = currentWeekStart();
  else if (period.value === "month")
    from = `${y}-${pad2(now.getMonth() + 1)}-01`;
  else if (period.value === "quarter") {
    const q = Math.floor(now.getMonth() / 3) * 3;
    from = `${y}-${pad2(q + 1)}-01`;
  } else from = `${y}-01-01`;
  return { from, to };
});

const periodLabel = computed(() => {
  const now = new Date();
  if (period.value === "week")
    return `Week of ${formatWeekLabel(currentWeekStart())}`;
  if (period.value === "month") {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(now);
  }
  if (period.value === "quarter") {
    return `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
  }
  return String(now.getFullYear());
});

function inRange(date: string): boolean {
  return date >= range.value.from && date <= range.value.to;
}

// ── Derived data ─────────────────────────────────────────────────────────
const periodAchievements = computed(() =>
  achievements.value
    .filter((a) => inRange(a.occurredAt))
    .toSorted((a, b) => b.occurredAt.localeCompare(a.occurredAt))
);
const periodEnablement = computed(() =>
  enablement.value
    .filter((e) => inRange(e.date))
    .toSorted((a, b) => b.date.localeCompare(a.date))
);
const periodSessions = computed(() =>
  sessions.value.filter((s) => inRange(s.date))
);
const activeGoals = computed(() =>
  goals.value.filter((g) => g.status === "in_progress" || g.status === "done")
);
const periodEnergy = computed(() =>
  reflections.value.filter((r) => inRange(r.weekStart))
);
const energyChartData = computed(() =>
  periodEnergy.value.length >= 2
    ? periodEnergy.value
    : reflections.value.slice(-12)
);

const nameById = computed(() => {
  const map = new Map<string, string>();
  for (const p of people.value) map.set(p.id, p.name);
  return map;
});
const sessionsByPerson = computed(() => {
  const counts = new Map<string, number>();
  for (const s of periodSessions.value) {
    counts.set(s.personId, (counts.get(s.personId) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([id, count]) => ({
      name: nameById.value.get(id) ?? "Someone",
      count,
    }))
    .toSorted((a, b) => b.count - a.count);
});

const energyAvg = computed(() => {
  const list = periodEnergy.value;
  if (!list.length) return null;
  const sum = (k: "energy" | "workload" | "satisfaction") =>
    list.reduce((acc, r) => acc + r[k], 0) / list.length;
  return {
    energy: sum("energy"),
    workload: sum("workload"),
    satisfaction: sum("satisfaction"),
  };
});
const energySignal = computed(() => analyzeEnergy(periodEnergy.value));

// ── Narrative ─────────────────────────────────────────────────────────────
function countLabel(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
const summary = computed(() => {
  const parts: string[] = [];
  parts.push(countLabel(periodAchievements.value.length, "win", "wins"));
  if (periodEnablement.value.length) {
    parts.push(
      countLabel(
        periodEnablement.value.length,
        "enablement session",
        "enablement sessions"
      )
    );
  }
  if (periodSessions.value.length) {
    parts.push(
      `${countLabel(periodSessions.value.length, "mentoring session", "mentoring sessions")} with ${countLabel(sessionsByPerson.value.length, "person", "people")}`
    );
  }
  const list = new Intl.ListFormat("en-US", {
    style: "long",
    type: "conjunction",
  }).format(parts);
  const energyTail =
    energyAvg.value !== null
      ? ` Energy ${energySignal.value.level === "alert" ? "ran low" : energySignal.value.level === "watch" ? "dipped at times" : "held steady"}.`
      : "";
  return `You logged ${list}.${energyTail}`;
});

const chips = computed(() =>
  [
    { label: "Wins", value: periodAchievements.value.length },
    { label: "Enablement", value: periodEnablement.value.length },
    { label: "Mentoring", value: periodSessions.value.length },
    {
      label: "Avg energy",
      value: energyAvg.value ? `${energyAvg.value.energy.toFixed(1)}` : "—",
    },
  ].filter((c) => c.value !== 0)
);

// ── TOC + scroll spy ──────────────────────────────────────────────────────
const toc = [
  { id: "highlights", label: "Highlights" },
  { id: "goals", label: "Goals" },
  { id: "mentoring", label: "Mentoring" },
  { id: "enablement", label: "Enablement" },
  { id: "energy", label: "Energy" },
];
const activeId = ref("highlights");
const progress = ref(0);
const reportEl = ref<HTMLElement>();
const isFullscreen = ref(false);

let scroller: HTMLElement | null = null;
function onScroll(): void {
  if (!scroller) return;
  const max = scroller.scrollHeight - scroller.clientHeight;
  progress.value = max > 0 ? scroller.scrollTop / max : 0;
}

function scrollTo(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function present(): void {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void reportEl.value?.requestFullscreen();
}

onMounted(() => {
  scroller = reportEl.value?.closest("main") ?? document.querySelector("main");
  scroller?.addEventListener("scroll", onScroll, { passive: true });
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activeId.value = entry.target.id;
      }
    },
    { root: scroller, rootMargin: "-25% 0px -65% 0px" }
  );
  for (const t of toc) {
    const el = document.getElementById(t.id);
    if (el) io.observe(el);
  }
  const onFs = () => {
    isFullscreen.value = Boolean(document.fullscreenElement);
  };
  document.addEventListener("fullscreenchange", onFs);
  onBeforeUnmount(() => {
    scroller?.removeEventListener("scroll", onScroll);
    document.removeEventListener("fullscreenchange", onFs);
    io.disconnect();
  });
});
</script>

<template>
  <div ref="reportEl" class="report-root relative">
    <!-- decorative orbs -->
    <div class="report-orb report-orb-1" />
    <div class="report-orb report-orb-2" />

    <!-- Sticky controls -->
    <div
      class="sticky top-0 z-20 -mx-4 mb-2 flex items-center justify-between gap-3 border-b border-[var(--ui-border)]/60 bg-[var(--ui-bg)]/80 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8"
    >
      <div class="flex gap-0.5 rounded-lg bg-[var(--ui-bg-muted)]/70 p-0.5">
        <button
          v-for="p in periods"
          :key="p.id"
          type="button"
          class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          :class="
            period === p.id
              ? 'bg-[var(--ui-bg)] text-[var(--ui-text-highlighted)] shadow-sm'
              : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
          "
          @click="period = p.id"
        >
          {{ p.label }}
        </button>
      </div>
      <UButton
        :icon="isFullscreen ? 'i-lucide-minimize' : 'i-lucide-projector'"
        :label="isFullscreen ? 'Exit' : 'Present'"
        color="neutral"
        variant="outline"
        size="sm"
        @click="present"
      />
      <!-- scroll progress -->
      <div
        class="bg-primary absolute right-0 -bottom-px left-0 h-px origin-left"
        :style="{ transform: `scaleX(${progress})` }"
      />
    </div>

    <div class="relative gap-10 lg:flex">
      <!-- TOC -->
      <nav class="hidden w-44 shrink-0 lg:block">
        <div class="sticky top-24 space-y-1">
          <button
            v-for="(t, i) in toc"
            :key="t.id"
            type="button"
            class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors"
            :class="
              activeId === t.id
                ? 'text-[var(--ui-text-highlighted)]'
                : 'text-[var(--ui-text-dimmed)] hover:text-[var(--ui-text)]'
            "
            @click="scrollTo(t.id)"
          >
            <span
              class="h-4 w-0.5 rounded-full transition-colors"
              :class="activeId === t.id ? 'bg-primary' : 'bg-transparent'"
            />
            <span class="font-mono text-xs opacity-60">{{ pad2(i + 1) }}</span>
            {{ t.label }}
          </button>
        </div>
      </nav>

      <!-- Narrative -->
      <div class="min-w-0 flex-1">
        <!-- Hero -->
        <ScrollReveal :y="36">
          <header class="pt-8 pb-6 sm:pt-12">
            <p class="text-primary text-sm font-medium tracking-wide uppercase">
              Report
            </p>
            <h1
              class="mt-2 text-4xl font-semibold tracking-tight text-[var(--ui-text-highlighted)] sm:text-5xl"
            >
              {{ periodLabel }}
            </h1>
            <p
              class="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--ui-text-muted)]"
            >
              {{ summary }}
            </p>
            <div class="mt-6 flex flex-wrap gap-2.5">
              <div
                v-for="chip in chips"
                :key="chip.label"
                class="surface flex items-baseline gap-2 px-3.5 py-2"
              >
                <span
                  class="text-lg font-semibold text-[var(--ui-text-highlighted)]"
                >
                  {{ chip.value }}
                </span>
                <span class="text-xs text-[var(--ui-text-muted)]">
                  {{ chip.label }}
                </span>
              </div>
            </div>
          </header>
        </ScrollReveal>

        <!-- Highlights -->
        <ReportSection
          :index="1"
          section-id="highlights"
          eyebrow="What you shipped"
          title="Highlights"
        >
          <p
            v-if="!periodAchievements.length"
            class="text-[var(--ui-text-muted)]"
          >
            No wins logged this period.
          </p>
          <div v-else class="space-y-3">
            <ScrollReveal
              v-for="(a, i) in periodAchievements"
              :key="a.id"
              :delay="Math.min(i * 0.05, 0.3)"
            >
              <article class="surface surface-hover p-5">
                <div class="flex items-start justify-between gap-3">
                  <h3 class="font-semibold text-[var(--ui-text-highlighted)]">
                    {{ a.title }}
                  </h3>
                  <span class="shrink-0 text-xs text-[var(--ui-text-dimmed)]">
                    {{ formatDate(a.occurredAt) }}
                  </span>
                </div>
                <p
                  v-if="a.impact"
                  class="mt-2 text-sm text-[var(--ui-text-toned)]"
                >
                  <span class="text-primary font-medium">Impact ·</span>
                  {{ markdownToPlainText(a.impact) }}
                </p>
                <p
                  v-else-if="a.description"
                  class="mt-2 text-sm text-[var(--ui-text-muted)]"
                >
                  {{ markdownExcerpt(a.description, 160) }}
                </p>
                <div v-if="a.tags.length" class="mt-3 flex flex-wrap gap-1">
                  <UBadge
                    v-for="tag in a.tags"
                    :key="tag"
                    color="primary"
                    variant="soft"
                    size="sm"
                  >
                    {{ tag }}
                  </UBadge>
                </div>
              </article>
            </ScrollReveal>
          </div>
        </ReportSection>

        <!-- Goals -->
        <ReportSection
          :index="2"
          section-id="goals"
          eyebrow="Where you're headed"
          title="Goals"
        >
          <p v-if="!activeGoals.length" class="text-[var(--ui-text-muted)]">
            No active goals.
          </p>
          <div v-else class="space-y-5">
            <ScrollReveal
              v-for="(g, i) in activeGoals"
              :key="g.id"
              :delay="Math.min(i * 0.05, 0.3)"
            >
              <div>
                <div class="mb-1.5 flex items-center justify-between gap-3">
                  <span class="font-medium text-[var(--ui-text)]">
                    {{ g.title }}
                  </span>
                  <span class="text-sm text-[var(--ui-text-dimmed)]">
                    {{ goalStatusMeta[g.status].label }} · {{ g.progress }}%
                  </span>
                </div>
                <UProgress :model-value="g.progress" :max="100" size="sm" />
              </div>
            </ScrollReveal>
          </div>
        </ReportSection>

        <!-- Mentoring -->
        <ReportSection
          :index="3"
          section-id="mentoring"
          eyebrow="People you grew"
          title="Mentoring"
        >
          <p
            v-if="!sessionsByPerson.length"
            class="text-[var(--ui-text-muted)]"
          >
            No mentoring sessions this period.
          </p>
          <div v-else>
            <p class="mb-4 text-[var(--ui-text-muted)]">
              {{ countLabel(periodSessions.length, "session", "sessions") }}
              across
              {{ countLabel(sessionsByPerson.length, "person", "people") }}.
            </p>
            <div class="flex flex-wrap gap-2.5">
              <div
                v-for="row in sessionsByPerson"
                :key="row.name"
                class="surface flex items-center gap-2.5 px-4 py-2.5"
              >
                <span
                  class="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-full text-xs font-semibold"
                >
                  {{ row.name.charAt(0) }}
                </span>
                <span class="text-sm font-medium text-[var(--ui-text)]">
                  {{ row.name }}
                </span>
                <span class="text-xs text-[var(--ui-text-dimmed)]">
                  ×{{ row.count }}
                </span>
              </div>
            </div>
          </div>
        </ReportSection>

        <!-- Enablement -->
        <ReportSection
          :index="4"
          section-id="enablement"
          eyebrow="How you lifted others"
          title="Enablement"
        >
          <p
            v-if="!periodEnablement.length"
            class="text-[var(--ui-text-muted)]"
          >
            No enablement this period.
          </p>
          <div v-else class="surface divide-hair overflow-hidden">
            <div
              v-for="item in periodEnablement"
              :key="item.id"
              class="flex items-start gap-4 p-4 sm:px-5"
            >
              <span
                class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ui-bg-muted)] text-[var(--ui-text-muted)]"
              >
                <UIcon
                  :name="enablementTypeMeta[item.type].icon"
                  class="size-4"
                />
              </span>
              <div class="min-w-0">
                <h3 class="font-medium text-[var(--ui-text-highlighted)]">
                  {{ item.title }}
                </h3>
                <div
                  class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--ui-text-dimmed)]"
                >
                  <span>{{ enablementTypeMeta[item.type].label }}</span>
                  <span>{{ formatDate(item.date) }}</span>
                  <span v-if="item.audience">{{ item.audience }}</span>
                  <span v-if="item.attendees != null">
                    {{ item.attendees }} attendees
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ReportSection>

        <!-- Energy -->
        <ReportSection
          :index="5"
          section-id="energy"
          eyebrow="How you held up"
          title="Energy"
        >
          <ScrollReveal>
            <p class="mb-5 max-w-2xl text-[var(--ui-text-muted)]">
              <template v-if="energyAvg">
                Across {{ countLabel(periodEnergy.length, "week", "weeks") }},
                energy averaged
                <strong class="text-[var(--ui-text)]">{{
                  energyAvg.energy.toFixed(1)
                }}</strong
                >, workload
                <strong class="text-[var(--ui-text)]">{{
                  energyAvg.workload.toFixed(1)
                }}</strong
                >, and satisfaction
                <strong class="text-[var(--ui-text)]">{{
                  energyAvg.satisfaction.toFixed(1)
                }}</strong>
                out of 5. {{ energySignal.message }}
              </template>
              <template v-else>
                No weekly reflections in this period.
              </template>
            </p>
            <div v-if="energyChartData.length" class="surface p-5 sm:p-6">
              <EnergyTrendChart :reflections="energyChartData" />
            </div>
          </ScrollReveal>
        </ReportSection>

        <footer
          class="border-t border-[var(--ui-border)]/60 py-8 text-center text-xs text-[var(--ui-text-dimmed)]"
        >
          Generated from your Brag record · {{ periodLabel }}
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.report-orb {
  position: fixed;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.5;
  background: radial-gradient(
    circle,
    color-mix(in oklab, var(--ui-color-primary-500) 16%, transparent),
    transparent 70%
  );
  filter: blur(8px);
}
.report-orb-1 {
  top: -180px;
  right: -160px;
}
.report-orb-2 {
  bottom: -220px;
  left: -180px;
  background: radial-gradient(
    circle,
    color-mix(in oklab, var(--ui-color-secondary-500) 14%, transparent),
    transparent 70%
  );
}
.report-root:fullscreen {
  overflow-y: auto;
  background: var(--ui-bg);
  padding: 0 2rem 4rem;
}
@media (prefers-reduced-motion: reduce) {
  .report-orb {
    display: none;
  }
}
</style>
