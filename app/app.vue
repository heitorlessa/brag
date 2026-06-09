<script setup lang="ts">
// Root component. <UApp> provides Nuxt UI's global overlay/toast context;
// <MotionConfig reduce-motion="user"> makes motion-v honor the OS
// "reduce motion" setting everywhere.
useHead({
  htmlAttrs: { lang: "en" },
});
</script>

<template>
  <UApp>
    <MotionConfig :reduced-motion="'user'">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </MotionConfig>
  </UApp>
</template>
