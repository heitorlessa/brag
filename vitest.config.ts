import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const appDir = fileURLToPath(new URL("./app", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "~": appDir,
      "@": appDir,
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "app/**/*.test.ts"],
    globals: true,
  },
});
