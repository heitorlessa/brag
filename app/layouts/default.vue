<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

// Primary navigation. Each entry maps to a page under app/pages.
const links = computed<NavigationMenuItem[]>(() => [
  { label: "Dashboard", icon: "i-lucide-layout-dashboard", to: "/" },
  { label: "Achievements", icon: "i-lucide-trophy", to: "/achievements" },
  { label: "Goals", icon: "i-lucide-target", to: "/goals" },
  { label: "Mentoring", icon: "i-lucide-users", to: "/mentoring" },
  { label: "Enablement", icon: "i-lucide-presentation", to: "/enablement" },
  { label: "Energy", icon: "i-lucide-battery-charging", to: "/energy" },
]);

const route = useRoute();
const pageTitle = computed(
  () => (route.meta.title as string | undefined) ?? "Brag"
);

const mobileNavOpen = ref(false);
watch(
  () => route.path,
  () => {
    mobileNavOpen.value = false;
  }
);
</script>

<template>
  <div class="flex h-screen bg-[var(--ui-bg)] text-[var(--ui-text)]">
    <!-- Sidebar (desktop) -->
    <aside
      class="hidden w-60 shrink-0 flex-col border-r border-[var(--ui-border)] bg-[var(--ui-bg-muted)]/40 md:flex"
    >
      <AppSidebarContent :links="links" />
    </aside>

    <!-- Main column -->
    <div class="flex min-w-0 flex-1 flex-col">
      <header
        class="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--ui-border)] px-4"
      >
        <UButton
          class="md:hidden"
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          @click="mobileNavOpen = true"
        />
        <h1 class="text-base font-semibold text-[var(--ui-text-highlighted)]">
          {{ pageTitle }}
        </h1>
        <div class="ms-auto flex items-center gap-1">
          <UColorModeButton />
          <UButton
            icon="i-lucide-settings"
            color="neutral"
            variant="ghost"
            to="/settings"
            aria-label="Settings"
          />
        </div>
      </header>

      <main class="min-h-0 flex-1 overflow-y-auto">
        <div class="mx-auto w-full max-w-6xl p-4 sm:p-6">
          <slot />
        </div>
      </main>
    </div>

    <!-- Sidebar (mobile slideover) -->
    <USlideover v-model:open="mobileNavOpen" side="left">
      <template #content>
        <AppSidebarContent :links="links" />
      </template>
    </USlideover>
  </div>
</template>
