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

  // SQLocal persists SQLite to OPFS, which requires the page to be
  // cross-origin isolated (SharedArrayBuffer + Atomics) — this is mandatory for
  // SQLocal/sqlite-wasm, there is no headerless persistence path. The SQLocal
  // Vite plugin sets these headers in dev; emit them on the production server
  // too, or persistence silently fails and all data resets on every reload.
  // All subresources here are same-origin (local icon bundle + bundled fonts),
  // so `require-corp` blocks nothing.
  $production: {
    nitro: {
      routeRules: {
        "/**": {
          headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
          },
        },
        // Under a require-corp document, same-origin subresources (the SQLocal
        // worker, wasm, fonts) must still carry CORP or they're blocked. On
        // Vercel these are served by dedicated asset routes that don't inherit
        // the "/**" headers, so stamp CORP on them explicitly.
        "/_nuxt/**": {
          headers: { "Cross-Origin-Resource-Policy": "same-origin" },
        },
        "/_fonts/**": {
          headers: { "Cross-Origin-Resource-Policy": "same-origin" },
        },
      },
    },
  },

  colorMode: {
    preference: "dark",
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
