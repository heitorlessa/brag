<script setup lang="ts">
import { parseDate } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";

/**
 * Styled date picker (UPopover + UCalendar) over a YYYY-MM-DD string model —
 * a refined replacement for the raw native <input type="date">.
 */
const model = defineModel<string>({ default: "" });

const props = withDefaults(
  defineProps<{ placeholder?: string; size?: "sm" | "md" }>(),
  { placeholder: "Pick a date", size: "md" }
);

const open = ref(false);

const calendarValue = computed<DateValue | undefined>({
  get: () => (model.value ? parseDate(model.value) : undefined),
  set: (value) => {
    if (value) {
      model.value = value.toString();
      open.value = false;
    }
  },
});

const label = computed(() =>
  model.value ? formatDate(model.value) : props.placeholder
);
</script>

<template>
  <UPopover v-model:open="open" :content="{ align: 'start' }">
    <button
      type="button"
      class="focus:ring-primary flex w-full items-center gap-2 rounded-lg bg-[var(--ui-bg)] text-left ring-1 ring-[var(--ui-border)] transition-colors ring-inset hover:ring-[var(--ui-text-dimmed)] focus:ring-2 focus:outline-none"
      :class="size === 'sm' ? 'px-2.5 py-1.5 text-sm' : 'px-3 py-2 text-sm'"
    >
      <UIcon
        name="i-lucide-calendar"
        class="size-4 shrink-0 text-[var(--ui-text-dimmed)]"
      />
      <span
        :class="
          model ? 'text-[var(--ui-text)]' : 'text-[var(--ui-text-dimmed)]'
        "
      >
        {{ label }}
      </span>
      <UIcon
        v-if="model"
        name="i-lucide-x"
        class="ms-auto size-3.5 text-[var(--ui-text-dimmed)] hover:text-[var(--ui-text)]"
        @click.stop="model = ''"
      />
    </button>

    <template #content>
      <UCalendar v-model="calendarValue" class="p-2" />
    </template>
  </UPopover>
</template>
