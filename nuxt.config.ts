// https://nuxt.com/docs/api/configuration/nuxt-config
import sqlocal from "sqlocal/vite";

export default defineNuxtConfig({
  // Local-first SPA: no server, no SSR. Everything runs in the browser and
  // persists to OPFS via SQLocal. There is no backend to render against.
  ssr: false,

  devServer: {
    port: 3000,
  },

  modules: ["@nuxt/ui", "@nuxt/icon", "@vueuse/nuxt", "@nuxt/eslint"],

  css: ["~/assets/css/main.css"],

  colorMode: {
    preference: "system",
  },

  ui: {
    theme: {
      colors: ["primary", "secondary", "success", "warning", "error", "info"],
    },
  },

  typescript: {
    typeCheck: false,
    strict: true,
  },

  vite: {
    // SQLocal ships a Web Worker + WASM; its Vite plugin wires up the worker
    // and the correct headers so OPFS sync access handles work in dev.
    plugins: [sqlocal()],
    build: {
      target: "esnext",
    },
    esbuild: {
      target: "esnext",
    },
    worker: {
      format: "es",
    },
    optimizeDeps: {
      exclude: ["sqlocal"],
    },
  },

  devtools: {
    enabled: true,
  },

  app: {
    head: {
      title: "Brag",
      meta: [
        {
          name: "description",
          content:
            "Local-first record of achievements, goals, mentoring, enablement, and energy.",
        },
      ],
    },
  },

  compatibilityDate: "2025-01-01",
});
