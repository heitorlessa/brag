/** Full-database JSON backup + restore (the safety net for local-only data). */
import {
  achievements,
  enablement,
  energyReflections,
  getDb,
  goals,
  mentoringSessions,
  people,
} from "~/local-db";
import type {
  Achievement,
  Enablement,
  EnergyReflection,
  Goal,
  MentoringSession,
  Person,
} from "~/local-db";

export interface BragBackup {
  app: "brag";
  version: 1;
  exportedAt: string;
  data: {
    goals: Goal[];
    achievements: Achievement[];
    people: Person[];
    mentoring_sessions: MentoringSession[];
    enablement: Enablement[];
    energy_reflections: EnergyReflection[];
  };
}

export async function exportAll(): Promise<BragBackup> {
  const db = await getDb();
  const [g, a, p, ms, en, er] = await Promise.all([
    db.select().from(goals),
    db.select().from(achievements),
    db.select().from(people),
    db.select().from(mentoringSessions),
    db.select().from(enablement),
    db.select().from(energyReflections),
  ]);
  return {
    app: "brag",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      goals: g,
      achievements: a,
      people: p,
      mentoring_sessions: ms,
      enablement: en,
      energy_reflections: er,
    },
  };
}

/** Type-guard a parsed object as a Brag backup before importing. */
export function isBragBackup(value: unknown): value is BragBackup {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<BragBackup>;
  if (candidate.app !== "brag" || typeof candidate.data !== "object") {
    return false;
  }
  const data = candidate.data as Record<string, unknown>;
  return [
    "goals",
    "achievements",
    "people",
    "mentoring_sessions",
    "enablement",
    "energy_reflections",
  ].every((key) => Array.isArray(data[key]));
}

/**
 * Replace the entire database with the backup's contents. Children are cleared
 * before parents and re-inserted after, to respect foreign keys.
 */
export async function importAll(backup: BragBackup): Promise<void> {
  const db = await getDb();

  await db.delete(achievements);
  await db.delete(mentoringSessions);
  await db.delete(goals);
  await db.delete(people);
  await db.delete(enablement);
  await db.delete(energyReflections);

  const { data } = backup;
  if (data.goals.length) await db.insert(goals).values(data.goals);
  if (data.people.length) await db.insert(people).values(data.people);
  if (data.enablement.length) {
    await db.insert(enablement).values(data.enablement);
  }
  if (data.energy_reflections.length) {
    await db.insert(energyReflections).values(data.energy_reflections);
  }
  if (data.achievements.length) {
    await db.insert(achievements).values(data.achievements);
  }
  if (data.mentoring_sessions.length) {
    await db.insert(mentoringSessions).values(data.mentoring_sessions);
  }
}
