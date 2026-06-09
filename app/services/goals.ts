/** Goal mutations + queries against the local database. */
import { desc, eq, firstOrNull, getDb, goals, newId, nowISO } from "~/local-db";
import type { Goal, NewGoal } from "~/local-db";

export type GoalInput = Omit<NewGoal, "id" | "createdAt" | "updatedAt">;

export async function listGoals(): Promise<Goal[]> {
  const db = await getDb();
  return db
    .select()
    .from(goals)
    .orderBy(desc(goals.year), desc(goals.createdAt));
}

export async function getGoal(id: string): Promise<Goal | null> {
  const db = await getDb();
  return firstOrNull(
    await db.select().from(goals).where(eq(goals.id, id)).limit(1)
  );
}

export async function createGoal(input: GoalInput): Promise<Goal> {
  const db = await getDb();
  const now = nowISO();
  const row: NewGoal = {
    ...input,
    id: newId(),
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(goals).values(row);
  return (await getGoal(row.id)) as Goal;
}

export async function updateGoal(
  id: string,
  patch: Partial<GoalInput>
): Promise<void> {
  const db = await getDb();
  await db
    .update(goals)
    .set({ ...patch, updatedAt: nowISO() })
    .where(eq(goals.id, id));
}

export async function removeGoal(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(goals).where(eq(goals.id, id));
}
