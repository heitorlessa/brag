/**
 * Programmatic ingestion for agents/automation. Surfaced on `window.brag`
 * (see app/plugins/agent-api.client.ts).
 *
 * Brag is local-first: the database lives in this browser's OPFS, so there is
 * no server endpoint that can write to it. Anything that wants to add data must
 * run in the page — a browser-driving agent (Playwright/extension), the devtools
 * console, or a WebMCP client. This module is that in-page entry point.
 */
import {
  type AchievementInput,
  createAchievement,
  listAchievements,
} from "./achievements";
import { createGoal, type GoalInput, listGoals } from "./goals";
import {
  createEnablement,
  type EnablementInput,
  listEnablement,
} from "./enablement";
import {
  createPerson,
  createSession,
  listAllSessions,
  listPeople,
  type MentoringSessionInput,
  type PersonInput,
} from "./mentoring";
import {
  type EnergyReflectionInput,
  listReflections,
  upsertReflection,
} from "./energy";
import { exportAll } from "./backup";

export interface MergePayload {
  goals?: GoalInput[];
  achievements?: AchievementInput[];
  people?: PersonInput[];
  sessions?: MentoringSessionInput[];
  enablement?: EnablementInput[];
  energy?: EnergyReflectionInput[];
}

export interface MergeResult {
  goals: number;
  achievements: number;
  people: number;
  sessions: number;
  enablement: number;
  energy: number;
}

/**
 * Append records to the database (does NOT clear existing data). Energy is
 * upserted by week. Returns how many of each were written.
 */
export async function importMerge(payload: MergePayload): Promise<MergeResult> {
  const result: MergeResult = {
    goals: 0,
    achievements: 0,
    people: 0,
    sessions: 0,
    enablement: 0,
    energy: 0,
  };

  for (const goal of payload.goals ?? []) {
    await createGoal(goal);
    result.goals += 1;
  }
  for (const achievement of payload.achievements ?? []) {
    await createAchievement(achievement);
    result.achievements += 1;
  }
  for (const person of payload.people ?? []) {
    await createPerson(person);
    result.people += 1;
  }
  for (const session of payload.sessions ?? []) {
    await createSession(session);
    result.sessions += 1;
  }
  for (const item of payload.enablement ?? []) {
    await createEnablement(item);
    result.enablement += 1;
  }
  for (const reflection of payload.energy ?? []) {
    await upsertReflection(reflection);
    result.energy += 1;
  }

  return result;
}

/** The shape exposed on `window.brag`. */
export const agentApi = {
  version: 1 as const,
  help(): string {
    return [
      "Brag agent API (window.brag). Local-first — data is written to this",
      "browser's OPFS. Examples:",
      "  await brag.addAchievement({ title, occurredAt: 'YYYY-MM-DD', description, impact, tags: [] })",
      "  await brag.addGoal({ title, year, status, progress })",
      "  await brag.addEnablement({ title, type, date: 'YYYY-MM-DD' })",
      "  await brag.addPerson({ name, relationship: 'regular' })",
      "  await brag.setEnergy({ weekStart: 'YYYY-MM-DD', energy, workload, satisfaction })",
      "  await brag.importMerge({ achievements: [...], goals: [...] })",
      "  await brag.exportAll()   // full JSON snapshot",
      "Lists: brag.listAchievements/listGoals/listPeople/listSessions/listEnablement/listEnergy",
    ].join("\n");
  },
  addAchievement: (input: AchievementInput) => createAchievement(input),
  addGoal: (input: GoalInput) => createGoal(input),
  addPerson: (input: PersonInput) => createPerson(input),
  addSession: (input: MentoringSessionInput) => createSession(input),
  addEnablement: (input: EnablementInput) => createEnablement(input),
  setEnergy: (input: EnergyReflectionInput) => upsertReflection(input),
  importMerge,
  listAchievements,
  listGoals,
  listPeople,
  listSessions: listAllSessions,
  listEnablement,
  listEnergy: listReflections,
  exportAll,
};

export type AgentApi = typeof agentApi;
