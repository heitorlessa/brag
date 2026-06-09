<script setup lang="ts">
import type { PopoverProps } from "@nuxt/ui";

/**
 * Reusable popover modeled on Peaky's inline pattern: a transparent UPopover
 * wrapper so the inner card owns its styling — a 3-part card (icon+title
 * header, body, optional footer) with a soft entrance animation.
 *
 * Slots: `trigger` (the anchor), `header`, default (body), `footer`.
 */
const props = withDefaults(
  defineProps<{
    title?: string;
    icon?: string;
    mode?: "click" | "hover";
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    width?: string;
    arrow?: boolean;
  }>(),
  {
    title: undefined,
    icon: undefined,
    mode: "click",
    side: "bottom",
    align: "center",
    sideOffset: 8,
    width: "w-72",
    arrow: false,
  }
);

const content = computed<PopoverProps["content"]>(() => ({
  side: props.side,
  align: props.align,
  sideOffset: props.sideOffset,
}));

const hasHeader = computed(() => Boolean(props.title) || Boolean(props.icon));
</script>

<template>
  <UPopover
    :mode="mode"
    :content="content"
    :arrow="arrow"
    :open-delay="mode === 'hover' ? 120 : 0"
    :close-delay="mode === 'hover' ? 80 : 0"
    :ui="{ content: 'bg-transparent shadow-none ring-0 rounded-none p-0' }"
  >
    <slot name="trigger" />

    <template #content>
      <Motion
        :initial="{ opacity: 0, scale: 0.97, y: -4 }"
        :animate="{ opacity: 1, scale: 1, y: 0 }"
        :transition="{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }"
        :class="[
          width,
          'overflow-hidden rounded-xl bg-[var(--ui-bg)] p-3.5 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.35)] ring-1 ring-[var(--ui-border)]',
        ]"
      >
        <div v-if="hasHeader" class="mb-2 flex items-center gap-2">
          <UIcon v-if="icon" :name="icon" class="text-primary size-4" />
          <slot name="header">
            <span
              class="text-sm font-semibold text-[var(--ui-text-highlighted)]"
            >
              {{ title }}
            </span>
          </slot>
        </div>

        <slot />

        <div
          v-if="$slots.footer"
          class="mt-3 border-t border-[var(--ui-border)] pt-2 text-xs text-[var(--ui-text-muted)]"
        >
          <slot name="footer" />
        </div>
      </Motion>
    </template>
  </UPopover>
</template>
