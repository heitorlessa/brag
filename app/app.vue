<script setup lang="ts">
// Root component. <UApp> provides Nuxt UI's global overlay/toast context.
// The default layout renders the dashboard shell (sidebar + content).
useHead({
  htmlAttrs: { lang: "en" },
});
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
