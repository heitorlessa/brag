<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string;
    icon?: string;
    label?: string;
  }>(),
  { message: "Delete this item?", icon: "i-lucide-trash-2", label: "Delete" }
);

const emit = defineEmits<{ confirm: [] }>();
const open = ref(false);

function confirm(): void {
  open.value = false;
  emit("confirm");
}
</script>

<template>
  <UPopover v-model:open="open">
    <UButton
      :icon="icon"
      color="error"
      variant="ghost"
      size="xs"
      :aria-label="label"
    />
    <template #content>
      <div class="w-56 p-3">
        <p class="text-sm text-[var(--ui-text)]">{{ message }}</p>
        <div class="mt-3 flex justify-end gap-2">
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            @click="open = false"
          >
            Cancel
          </UButton>
          <UButton size="xs" color="error" @click="confirm">{{
            label
          }}</UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>
