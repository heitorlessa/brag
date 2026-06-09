/** Enablement (workshops, talks, training…) mutations + queries. */
import {
  desc,
  enablement,
  eq,
  firstOrNull,
  getDb,
  newId,
  nowISO,
} from "~/local-db";
import type { Enablement, NewEnablement } from "~/local-db";

export type EnablementInput = Omit<
  NewEnablement,
  "id" | "createdAt" | "updatedAt"
>;

export async function listEnablement(): Promise<Enablement[]> {
  const db = await getDb();
  return db.select().from(enablement).orderBy(desc(enablement.date));
}

export async function getEnablement(id: string): Promise<Enablement | null> {
  const db = await getDb();
  return firstOrNull(
    await db.select().from(enablement).where(eq(enablement.id, id)).limit(1)
  );
}

export async function createEnablement(
  input: EnablementInput
): Promise<Enablement> {
  const db = await getDb();
  const now = nowISO();
  const row: NewEnablement = {
    ...input,
    id: newId(),
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(enablement).values(row);
  return (await getEnablement(row.id)) as Enablement;
}

export async function updateEnablement(
  id: string,
  patch: Partial<EnablementInput>
): Promise<void> {
  const db = await getDb();
  await db
    .update(enablement)
    .set({ ...patch, updatedAt: nowISO() })
    .where(eq(enablement.id, id));
}

export async function removeEnablement(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(enablement).where(eq(enablement.id, id));
}
