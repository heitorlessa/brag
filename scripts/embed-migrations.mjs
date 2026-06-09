/**
 * Embed Drizzle-generated SQL migrations into a TypeScript module so the
 * browser can apply them on startup without filesystem access.
 *
 * Reads app/local-db/migrations/*.sql (Drizzle's `--> statement-breakpoint`
 * separated DDL) and emits app/local-db/migrations.generated.ts.
 *
 * Run via `pnpm db:migrations:embed` (chained after `drizzle-kit generate`).
 */
import { readdir, readFile, writeFile } from "node:fs/promises";

const migrationsDir = new URL("../app/local-db/migrations/", import.meta.url);
const outputPath = new URL(
  "../app/local-db/migrations.generated.ts",
  import.meta.url
);

function escapeTemplate(source) {
  return source
    .replaceAll("\\", "\\\\")
    .replaceAll("`", "\\`")
    .replaceAll("${", "\\${");
}

async function main() {
  let fileNames = [];
  try {
    fileNames = (await readdir(migrationsDir))
      .filter((name) => name.endsWith(".sql"))
      .toSorted();
  } catch {
    fileNames = [];
  }

  const migrations = await Promise.all(
    fileNames.map(async (fileName) => {
      const raw = await readFile(new URL(fileName, migrationsDir), "utf8");
      const statements = raw
        .split("--> statement-breakpoint")
        .map((statement) => statement.trim())
        .filter(Boolean);
      return { name: fileName.replace(/\.sql$/u, ""), statements };
    })
  );

  const lines = [
    "// GENERATED FILE - DO NOT EDIT.",
    "// Produced by scripts/embed-migrations.mjs from app/local-db/migrations/*.sql",
    "",
    "export interface EmbeddedMigration {",
    "  name: string;",
    "  statements: string[];",
    "}",
    "",
    "export const MIGRATIONS: EmbeddedMigration[] = [",
  ];

  for (const migration of migrations) {
    lines.push("  {");
    lines.push(`    name: ${JSON.stringify(migration.name)},`);
    lines.push("    statements: [");
    for (const statement of migration.statements) {
      lines.push(`      \`${escapeTemplate(statement)}\`,`);
    }
    lines.push("    ],");
    lines.push("  },");
  }

  lines.push("];", "");

  await writeFile(outputPath, lines.join("\n"), "utf8");
  console.log(
    `[embed-migrations] Embedded ${migrations.length} migration(s) -> app/local-db/migrations.generated.ts`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
