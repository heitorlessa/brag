import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { MIGRATIONS } from "../app/local-db/migrations.generated";
import * as schema from "../app/local-db/schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

function makeDb(): Db {
  const sqlite = new Database(":memory:");
  for (const migration of MIGRATIONS) {
    for (const statement of migration.statements) sqlite.exec(statement);
  }
  return drizzle(sqlite, { schema });
}

const TS = "2026-01-01T00:00:00.000Z";

describe("schema + embedded migrations", () => {
  let db: Db;
  beforeEach(() => {
    db = makeDb();
  });

  it("round-trips a goal and a linked achievement (incl. JSON tags)", () => {
    db.insert(schema.goals)
      .values({
        id: "g1",
        title: "Goal",
        year: 2026,
        createdAt: TS,
        updatedAt: TS,
      })
      .run();
    db.insert(schema.achievements)
      .values({
        id: "a1",
        title: "Win",
        occurredAt: "2026-01-01",
        goalId: "g1",
        tags: ["launch", "oss"],
        createdAt: TS,
        updatedAt: TS,
      })
      .run();

    const rows = db
      .select()
      .from(schema.achievements)
      .where(eq(schema.achievements.id, "a1"))
      .all();

    expect(rows).toHaveLength(1);
    expect(rows[0]?.title).toBe("Win");
    expect(rows[0]?.tags).toEqual(["launch", "oss"]);
    expect(rows[0]?.goalId).toBe("g1");
  });

  it("applies column defaults", () => {
    db.insert(schema.people)
      .values({ id: "p1", name: "Alex", createdAt: TS, updatedAt: TS })
      .run();
    const person = db.select().from(schema.people).all()[0];
    expect(person?.relationship).toBe("ad_hoc");
    expect(person?.active).toBe(true);
  });

  it("enforces the unique constraint on energy week_start", () => {
    const base = {
      energy: 3,
      workload: 3,
      satisfaction: 3,
      note: "",
      createdAt: TS,
      updatedAt: TS,
    };
    db.insert(schema.energyReflections)
      .values({ id: "r1", weekStart: "2026-01-05", ...base })
      .run();
    expect(() =>
      db
        .insert(schema.energyReflections)
        .values({ id: "r2", weekStart: "2026-01-05", ...base })
        .run()
    ).toThrow();
  });
});
