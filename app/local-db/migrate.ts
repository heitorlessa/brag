/**
 * Minimal forward-only migrator for the local SQLite database.
 *
 * Applies any embedded migration not yet recorded in `__brag_migrations`,
 * statement by statement, inside the browser. No rollbacks — this is a
 * single-user local store; schema changes are additive.
 */
import type { SQLocalDrizzle } from "sqlocal/drizzle";
import { MIGRATIONS } from "./migrations.generated";

const MIGRATIONS_TABLE = "__brag_migrations";

export async function runMigrations(client: SQLocalDrizzle): Promise<void> {
  await client.exec(
    `CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)`,
    []
  );

  const appliedRows = await client.sql<{ name: string }>(
    `SELECT name FROM ${MIGRATIONS_TABLE}`
  );
  const applied = new Set(appliedRows.map((row) => row.name));

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.name)) continue;

    for (const statement of migration.statements) {
      await client.exec(statement, []);
    }
    await client.exec(
      `INSERT INTO ${MIGRATIONS_TABLE} (name, applied_at) VALUES (?, ?)`,
      [migration.name, new Date().toISOString()]
    );
  }
}
