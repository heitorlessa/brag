/** Achievement mutations + queries against the local database. */
import {
  achievements,
  desc,
  eq,
  firstOrNull,
  getDb,
  newId,
  nowISO,
} from "~/local-db";
import type { Achievement, NewAchievement } from "~/local-db";

export type AchievementInput = Omit<
  NewAchievement,
  "id" | "createdAt" | "updatedAt"
>;

export async function listAchievements(): Promise<Achievement[]> {
  const db = await getDb();
  return db
    .select()
    .from(achievements)
    .orderBy(desc(achievements.occurredAt), desc(achievements.createdAt));
}

export async function getAchievement(id: string): Promise<Achievement | null> {
  const db = await getDb();
  return firstOrNull(
    await db.select().from(achievements).where(eq(achievements.id, id)).limit(1)
  );
}

export async function createAchievement(
  input: AchievementInput
): Promise<Achievement> {
  const db = await getDb();
  const now = nowISO();
  const row: NewAchievement = {
    ...input,
    id: newId(),
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(achievements).values(row);
  return (await getAchievement(row.id)) as Achievement;
}

export async function updateAchievement(
  id: string,
  patch: Partial<AchievementInput>
): Promise<void> {
  const db = await getDb();
  await db
    .update(achievements)
    .set({ ...patch, updatedAt: nowISO() })
    .where(eq(achievements.id, id));
}

export async function removeAchievement(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(achievements).where(eq(achievements.id, id));
}
