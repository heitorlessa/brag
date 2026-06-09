// https://nuxt.com/docs/api/configuration/nuxt-config
import sqlocal from "sqlocal/vite";

export default defineNuxtConfig({
  // Local-first SPA: no server, no SSR. Everything runs in the browser and
  // persists to OPFS via SQLocal. There is no backend to render against.
  ssr: false,

  devServer: {
    port: 3000,
  },

  modules: [
    "@nuxt/ui",
    "@nuxt/icon",
    "@vueuse/nuxt",
    "@nuxt/eslint",
    "motion-v/nuxt",
  ],

  css: ["~/assets/css/main.css"],

  // Register components by bare filename regardless of folder, so e.g.
  // components/achievements/AchievementCard.vue is <AchievementCard> (Nuxt's
  // default would prefix it to <AchievementsAchievementCard>).
  components: [{ path: "~/components", pathPrefix: false }],

  // SQLocal's OPFS sync access (SQLite WASM) requires the page to be
  // cross-origin isolated in production. The SQLocal Vite plugin sets these in
  // dev; these route rules ensure the deployed (e.g. Vercel) build does too.
  nitro: {
    routeRules: {
      "/**": {
        headers: {
          "Cross-Origin-Opener-Policy": "same-origin",
          "Cross-Origin-Embedder-Policy": "require-corp",
        },
      },
    },
  },

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
