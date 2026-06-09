<script setup lang="ts">
import type { EnergyReflection } from "~/local-db";

/** Dependency-free SVG line chart of the three weekly series (scale 1–5). */
const props = defineProps<{ reflections: EnergyReflection[] }>();

// Wide aspect so the chart reads well at full container width without getting
// too tall.
const W = 1000;
const H = 260;
const pad = { l: 28, r: 12, t: 14, b: 26 };
const innerW = W - pad.l - pad.r;
const innerH = H - pad.t - pad.b;

const series = [
  { key: "energy" as const, label: "Energy", color: "#0ea5e9" },
  { key: "workload" as const, label: "Workload", color: "#f59e0b" },
  { key: "satisfaction" as const, label: "Satisfaction", color: "#22c55e" },
];

const points = computed(() => props.reflections);

function xAt(index: number): number {
  const n = points.value.length;
  if (n <= 1) return pad.l + innerW / 2;
  return pad.l + (index / (n - 1)) * innerW;
}

function yAt(value: number): number {
  return pad.t + innerH - ((value - 1) / 4) * innerH;
}

function polyline(key: "energy" | "workload" | "satisfaction"): string {
  return points.value
    .map((reflection, index) => `${xAt(index)},${yAt(reflection[key])}`)
    .join(" ");
}

// Area under the energy line, closed down to the baseline.
const energyArea = computed(() => {
  if (!points.value.length) return "";
  const line = points.value
    .map((reflection, index) => `${xAt(index)},${yAt(reflection.energy)}`)
    .join(" ");
  const baseY = yAt(1);
  const lastX = xAt(points.value.length - 1);
  const firstX = xAt(0);
  return `${line} ${lastX},${baseY} ${firstX},${baseY}`;
});

const yTicks = [1, 2, 3, 4, 5];

const xLabels = computed(() => {
  const n = points.value.length;
  if (!n) return [];
  const stride = Math.max(1, Math.ceil(n / 6));
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  return points.value
    .map((reflection, index) => ({ index, reflection }))
    .filter(({ index }) => index % stride === 0 || index === n - 1)
    .map(({ index, reflection }) => ({
      x: xAt(index),
      label: formatter.format(new Date(`${reflection.weekStart}T00:00:00Z`)),
    }));
});

// ── Hover interaction ──────────────────────────────────────────────────────
const hoverIndex = ref<number | null>(null);
const hovered = computed(() =>
  hoverIndex.value === null ? null : (points.value[hoverIndex.value] ?? null)
);
const hoverX = computed(() =>
  hoverIndex.value === null ? 0 : xAt(hoverIndex.value)
);
// As a % of the (uniformly scaled) SVG width — works without pixel measuring.
const tooltipLeft = computed(() =>
  Math.max(13, Math.min(87, (hoverX.value / W) * 100))
);

function onMove(event: PointerEvent): void {
  const n = points.value.length;
  if (!n) return;
  const rect = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
  const ratio = (event.clientX - rect.left) / rect.width;
  const rel = (ratio * W - pad.l) / innerW;
  hoverIndex.value = Math.max(0, Math.min(n - 1, Math.round(rel * (n - 1))));
}

function onLeave(): void {
  hoverIndex.value = null;
}
</script>

<template>
  <div class="relative">
    <div class="mb-2 flex flex-wrap gap-4">
      <div
        v-for="s in series"
        :key="s.key"
        class="flex items-center gap-1.5 text-xs text-[var(--ui-text-muted)]"
      >
        <span
          class="size-2.5 rounded-full"
          :style="{ backgroundColor: s.color }"
        />
        {{ s.label }}
      </div>
    </div>

    <svg
      :viewBox="`0 0 ${W} ${H}`"
      class="w-full touch-none"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Weekly energy, workload and satisfaction trend"
      @pointermove="onMove"
      @pointerleave="onLeave"
    >
      <defs>
        <linearGradient id="brag-energy-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- Area under the energy series -->
      <polygon
        v-if="energyArea"
        :points="energyArea"
        fill="url(#brag-energy-area)"
        class="brag-area"
      />

      <!-- Y gridlines + labels -->
      <g>
        <line
          v-for="tick in yTicks"
          :key="`grid-${tick}`"
          :x1="pad.l"
          :x2="W - pad.r"
          :y1="yAt(tick)"
          :y2="yAt(tick)"
          stroke="var(--ui-border)"
          stroke-width="1"
        />
        <text
          v-for="tick in yTicks"
          :key="`ylabel-${tick}`"
          :x="pad.l - 6"
          :y="yAt(tick) + 3"
          text-anchor="end"
          class="fill-[var(--ui-text-dimmed)] text-[10px]"
        >
          {{ tick }}
        </text>
      </g>

      <!-- Hover guideline -->
      <line
        v-if="hoverIndex !== null"
        :x1="hoverX"
        :x2="hoverX"
        :y1="pad.t"
        :y2="pad.t + innerH"
        stroke="var(--ui-text-dimmed)"
        stroke-width="1"
        stroke-dasharray="3 3"
        opacity="0.6"
      />

      <!-- X labels -->
      <text
        v-for="entry in xLabels"
        :key="`xlabel-${entry.x}`"
        :x="entry.x"
        :y="H - 6"
        text-anchor="middle"
        class="fill-[var(--ui-text-dimmed)] text-[10px]"
      >
        {{ entry.label }}
      </text>

      <!-- Series -->
      <g v-for="(s, sIndex) in series" :key="s.key">
        <polyline
          :points="polyline(s.key)"
          fill="none"
          :stroke="s.color"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
          pathLength="1"
          class="brag-line"
          :style="{ animationDelay: `${sIndex * 0.12}s` }"
        />
        <circle
          v-for="(reflection, index) in points"
          :key="`${s.key}-${reflection.id}`"
          :cx="xAt(index)"
          :cy="yAt(reflection[s.key])"
          :r="hoverIndex === index ? 4 : 2.5"
          :fill="s.color"
          :stroke="hoverIndex === index ? 'var(--ui-bg)' : 'none'"
          :stroke-width="hoverIndex === index ? 1.5 : 0"
          class="transition-[r]"
        />
      </g>
    </svg>

    <!-- Hover tooltip -->
    <Transition name="brag-pop">
      <div
        v-if="hovered"
        class="brag-tip pointer-events-none absolute top-7 z-10 rounded-xl bg-[var(--ui-bg)] px-3 py-2 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.35)] ring-1 ring-[var(--ui-border)]"
        :style="{ left: `${tooltipLeft}%` }"
      >
        <p class="mb-1.5 text-xs font-medium text-[var(--ui-text-highlighted)]">
          {{ formatWeekLabel(hovered.weekStart) }}
        </p>
        <div class="space-y-1">
          <div
            v-for="s in series"
            :key="s.key"
            class="flex items-center gap-2 text-xs"
          >
            <span
              class="size-2 rounded-full"
              :style="{ backgroundColor: s.color }"
            />
            <span class="text-[var(--ui-text-muted)]">{{ s.label }}</span>
            <span class="ms-auto font-semibold text-[var(--ui-text)]">
              {{ hovered[s.key] }}
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.brag-tip {
  transform: translateX(-50%);
}
.brag-pop-enter-active,
.brag-pop-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s cubic-bezier(0.16, 1, 0.3, 1);
}
.brag-pop-enter-from,
.brag-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, 4px) scale(0.97);
}
</style>
