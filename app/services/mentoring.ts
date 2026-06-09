/** People (mentees) + mentoring-session mutations and queries. */
import {
  asc,
  desc,
  eq,
  firstOrNull,
  getDb,
  mentoringSessions,
  newId,
  nowISO,
  people,
} from "~/local-db";
import type {
  MentoringSession,
  NewMentoringSession,
  NewPerson,
  Person,
} from "~/local-db";

export type PersonInput = Omit<NewPerson, "id" | "createdAt" | "updatedAt">;
export type MentoringSessionInput = Omit<
  NewMentoringSession,
  "id" | "createdAt" | "updatedAt"
>;

// ── People ─────────────────────────────────────────────────────────────────
export async function listPeople(): Promise<Person[]> {
  const db = await getDb();
  return db
    .select()
    .from(people)
    .orderBy(desc(people.active), asc(people.name));
}

export async function getPerson(id: string): Promise<Person | null> {
  const db = await getDb();
  return firstOrNull(
    await db.select().from(people).where(eq(people.id, id)).limit(1)
  );
}

export async function createPerson(input: PersonInput): Promise<Person> {
  const db = await getDb();
  const now = nowISO();
  const row: NewPerson = {
    ...input,
    id: newId(),
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(people).values(row);
  return (await getPerson(row.id)) as Person;
}

export async function updatePerson(
  id: string,
  patch: Partial<PersonInput>
): Promise<void> {
  const db = await getDb();
  await db
    .update(people)
    .set({ ...patch, updatedAt: nowISO() })
    .where(eq(people.id, id));
}

export async function removePerson(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(people).where(eq(people.id, id));
}

// ── Mentoring sessions ─────────────────────────────────────────────────────
export async function listSessions(
  personId: string
): Promise<MentoringSession[]> {
  const db = await getDb();
  return db
    .select()
    .from(mentoringSessions)
    .where(eq(mentoringSessions.personId, personId))
    .orderBy(desc(mentoringSessions.date));
}

export async function listAllSessions(): Promise<MentoringSession[]> {
  const db = await getDb();
  return db
    .select()
    .from(mentoringSessions)
    .orderBy(desc(mentoringSessions.date));
}

export async function createSession(
  input: MentoringSessionInput
): Promise<MentoringSession> {
  const db = await getDb();
  const now = nowISO();
  const row: NewMentoringSession = {
    ...input,
    id: newId(),
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(mentoringSessions).values(row);
  return firstOrNull(
    await db
      .select()
      .from(mentoringSessions)
      .where(eq(mentoringSessions.id, row.id))
      .limit(1)
  ) as MentoringSession;
}

export async function removeSession(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(mentoringSessions).where(eq(mentoringSessions.id, id));
}
