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
</script>

<template>
  <div>
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
      class="w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Weekly energy, workload and satisfaction trend"
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
          r="2.5"
          :fill="s.color"
        />
      </g>
    </svg>
  </div>
</template>
