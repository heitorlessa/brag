/** Weekly energy-reflection mutations + queries (one row per ISO week). */
import {
  asc,
  energyReflections,
  eq,
  firstOrNull,
  getDb,
  newId,
  nowISO,
} from "~/local-db";
import type { EnergyReflection, NewEnergyReflection } from "~/local-db";

export type EnergyReflectionInput = Omit<
  NewEnergyReflection,
  "id" | "createdAt" | "updatedAt"
>;

export async function listReflections(): Promise<EnergyReflection[]> {
  const db = await getDb();
  return db
    .select()
    .from(energyReflections)
    .orderBy(asc(energyReflections.weekStart));
}

export async function getReflectionByWeek(
  weekStart: string
): Promise<EnergyReflection | null> {
  const db = await getDb();
  return firstOrNull(
    await db
      .select()
      .from(energyReflections)
      .where(eq(energyReflections.weekStart, weekStart))
      .limit(1)
  );
}

/** Insert or update the reflection for a given week (unique on week_start). */
export async function upsertReflection(
  input: EnergyReflectionInput
): Promise<EnergyReflection> {
  const db = await getDb();
  const now = nowISO();
  const row: NewEnergyReflection = {
    ...input,
    id: newId(),
    createdAt: now,
    updatedAt: now,
  };
  await db
    .insert(energyReflections)
    .values(row)
    .onConflictDoUpdate({
      target: energyReflections.weekStart,
      set: {
        energy: input.energy,
        workload: input.workload,
        satisfaction: input.satisfaction,
        note: input.note ?? "",
        updatedAt: now,
      },
    });
  return (await getReflectionByWeek(input.weekStart)) as EnergyReflection;
}

export async function removeReflection(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(energyReflections).where(eq(energyReflections.id, id));
}
