import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/local-db/schema.ts",
  out: "./app/local-db/migrations",
  dialect: "sqlite",
  strict: true,
  verbose: true,
});
