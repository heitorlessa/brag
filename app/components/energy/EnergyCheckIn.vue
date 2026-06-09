<script setup lang="ts">
import type { EnergyReflection } from "~/local-db";

interface CheckInValues {
  energy: number;
  workload: number;
  satisfaction: number;
  note: string;
}

const props = defineProps<{
  initial: EnergyReflection | null;
  weekLabel: string;
  saved: boolean;
  quick: boolean;
}>();

const emit = defineEmits<{ save: [CheckInValues] }>();

type RatingKey = "energy" | "workload" | "satisfaction";

const QUESTIONS: {
  key: RatingKey;
  short: string;
  prompt: string;
  hint: string;
  labels: [string, string, string, string, string];
}[] = [
  {
    key: "energy",
    short: "Energy",
    prompt: "How's your energy this week?",
    hint: "Your overall capacity — physical and mental.",
    labels: ["Drained", "Low", "Okay", "Good", "Energized"],
  },
  {
    key: "workload",
    short: "Workload",
    prompt: "How heavy was your workload?",
    hint: "How much was on your plate.",
    labels: ["Light", "Steady", "Busy", "Heavy", "Crushing"],
  },
  {
    key: "satisfaction",
    short: "Satisfaction",
    prompt: "How satisfied do you feel?",
    hint: "How good the week felt, all in.",
    labels: ["Low", "Meh", "Okay", "Good", "Great"],
  },
];

const values = reactive<CheckInValues>({
  energy: 3,
  workload: 3,
  satisfaction: 3,
  note: "",
});
const step = ref(0); // 0–2 ratings, 3 note

function reset(): void {
  values.energy = props.initial?.energy ?? 3;
  values.workload = props.initial?.workload ?? 3;
  values.satisfaction = props.initial?.satisfaction ?? 3;
  values.note = props.initial?.note ?? "";
  step.value = 0;
}

watch(() => props.initial, reset, { immediate: true });
watch(
  () => props.weekLabel,
  () => {
    step.value = 0;
  }
);

const current = computed(() => QUESTIONS[step.value]);

function onSelect(): void {
  // Auto-advance after the thumb settles, so it feels guided, not clicky.
  window.setTimeout(() => {
    if (step.value < QUESTIONS.length) step.value += 1;
  }, 320);
}

function back(): void {
  if (step.value > 0) step.value -= 1;
}

function save(): void {
  emit("save", { ...values });
}
</script>

<template>
  <!-- ── Quick mode: everything on one calm screen ── -->
  <div v-if="quick" class="space-y-5">
    <div v-for="q in QUESTIONS" :key="q.key">
      <div class="mb-2 flex items-baseline justify-between">
        <span class="text-sm font-medium text-[var(--ui-text)]">{{
          q.short
        }}</span>
        <span class="text-xs text-[var(--ui-text-dimmed)]">
          {{ q.labels[values[q.key] - 1] }}
        </span>
      </div>
      <RatingScale v-model="values[q.key]" :labels="q.labels" />
    </div>

    <div>
      <p class="mb-2 text-sm font-medium text-[var(--ui-text)]">
        Note <span class="text-[var(--ui-text-dimmed)]">(optional)</span>
      </p>
      <RichTextEditor
        v-model="values.note"
        min-height="min-h-28"
        placeholder="What drained or recharged you this week…"
      />
    </div>

    <div class="flex justify-end">
      <UButton icon="i-lucide-check" label="Save reflection" @click="save" />
    </div>
  </div>

  <!-- ── Progressive mode: one question at a time ── -->
  <div v-else class="min-h-[320px]">
    <!-- Progress dots -->
    <div class="mb-6 flex items-center gap-1.5">
      <span
        v-for="i in QUESTIONS.length + 1"
        :key="i"
        class="h-1 flex-1 rounded-full transition-colors duration-300"
        :class="i - 1 <= step ? 'bg-primary' : 'bg-[var(--ui-border)]'"
      />
    </div>

    <AnimatePresence mode="wait">
      <Motion
        :key="step"
        :initial="{ opacity: 0, x: 16 }"
        :animate="{ opacity: 1, x: 0 }"
        :exit="{ opacity: 0, x: -16 }"
        :transition="{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }"
      >
        <!-- Rating steps -->
        <div v-if="step < QUESTIONS.length && current">
          <h3
            class="text-lg font-semibold tracking-tight text-[var(--ui-text-highlighted)]"
          >
            {{ current.prompt }}
          </h3>
          <p class="mt-1 mb-5 text-sm text-[var(--ui-text-muted)]">
            {{ current.hint }}
          </p>
          <RatingScale
            v-model="values[current.key]"
            :labels="current.labels"
            @select="onSelect"
          />
        </div>

        <!-- Note step -->
        <div v-else>
          <h3
            class="text-lg font-semibold tracking-tight text-[var(--ui-text-highlighted)]"
          >
            Anything worth noting?
          </h3>
          <p class="mt-1 mb-4 text-sm text-[var(--ui-text-muted)]">
            Optional — a line about what shaped the week.
          </p>
          <RichTextEditor
            v-model="values.note"
            min-height="min-h-32"
            placeholder="What drained or recharged you this week…"
          />
          <div class="mt-5 flex justify-end">
            <UButton
              icon="i-lucide-check"
              label="Save reflection"
              @click="save"
            />
          </div>
        </div>
      </Motion>
    </AnimatePresence>

    <!-- Footer nav -->
    <div class="mt-6 flex items-center justify-between">
      <UButton
        v-if="step > 0"
        icon="i-lucide-arrow-left"
        label="Back"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="back"
      />
      <span v-else />
      <span class="text-xs text-[var(--ui-text-dimmed)]">
        {{ saved ? "Editing saved week" : "New check-in" }}
      </span>
    </div>
  </div>
</template>
