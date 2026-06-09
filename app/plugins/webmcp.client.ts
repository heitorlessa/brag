/**
 * WebMCP provider. When the browser (or an extension) exposes the W3C
 * `navigator.modelContext` API, register Brag's tools so an AI agent can add
 * and read data directly — no server, no scraping the DOM.
 *
 * Feature-detected and HTTPS-gated, so it's a no-op where unsupported.
 * Spec: https://github.com/webmachinelearning/webmcp
 */
import { agentApi } from "~/services/ingest";
import type { AchievementInput } from "~/services/achievements";
import type { GoalInput } from "~/services/goals";
import type { EnablementInput } from "~/services/enablement";
import type { PersonInput } from "~/services/mentoring";
import type { EnergyReflectionInput } from "~/services/energy";
import type { MergePayload } from "~/services/ingest";

interface JsonSchema {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
}

interface ModelContextTool {
  name: string;
  description: string;
  inputSchema?: JsonSchema;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
  annotations?: { readOnlyHint?: boolean };
}

interface ModelContext {
  registerTool: (tool: ModelContextTool) => void;
  unregisterTool?: (name: string) => void;
}

function getModelContext(): ModelContext | null {
  if (typeof navigator === "undefined" || !("modelContext" in navigator)) {
    return null;
  }
  if (typeof window !== "undefined" && window.isSecureContext === false) {
    return null;
  }
  return (navigator as unknown as { modelContext: ModelContext }).modelContext;
}

const dateField = { type: "string", description: "Date as YYYY-MM-DD" };
const rating = { type: "integer", minimum: 1, maximum: 5 };

const TOOLS: ModelContextTool[] = [
  {
    name: "brag_add_achievement",
    description: "Record an achievement (a win worth remembering for reviews).",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        occurredAt: dateField,
        description: { type: "string", description: "Markdown" },
        impact: { type: "string", description: "Markdown — why it mattered" },
        category: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
      required: ["title", "occurredAt"],
    },
    execute: (input) =>
      agentApi.addAchievement(input as unknown as AchievementInput),
  },
  {
    name: "brag_add_goal",
    description: "Add a goal for a given year.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        year: { type: "integer" },
        category: { type: "string" },
        status: {
          type: "string",
          enum: ["not_started", "in_progress", "done", "dropped"],
        },
        progress: { type: "integer", minimum: 0, maximum: 100 },
        description: { type: "string", description: "Markdown" },
      },
      required: ["title", "year"],
    },
    execute: (input) => agentApi.addGoal(input as unknown as GoalInput),
  },
  {
    name: "brag_add_enablement",
    description:
      "Record enablement you delivered (workshop, talk, training, doc, review, office hours).",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        type: {
          type: "string",
          enum: [
            "workshop",
            "talk",
            "training",
            "doc",
            "review",
            "office_hours",
          ],
        },
        date: dateField,
        audience: { type: "string" },
        attendees: { type: "integer" },
        link: { type: "string" },
        notes: { type: "string", description: "Markdown" },
      },
      required: ["title", "date"],
    },
    execute: (input) =>
      agentApi.addEnablement(input as unknown as EnablementInput),
  },
  {
    name: "brag_add_person",
    description: "Add a person you mentor.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        role: { type: "string" },
        relationship: { type: "string", enum: ["ad_hoc", "regular"] },
        cadence: { type: "string" },
        notes: { type: "string", description: "Markdown" },
        startedAt: dateField,
      },
      required: ["name"],
    },
    execute: (input) => agentApi.addPerson(input as unknown as PersonInput),
  },
  {
    name: "brag_set_energy",
    description:
      "Set the weekly energy reflection for a week (upsert by week start, a Monday).",
    inputSchema: {
      type: "object",
      properties: {
        weekStart: dateField,
        energy: rating,
        workload: rating,
        satisfaction: rating,
        note: { type: "string", description: "Markdown" },
      },
      required: ["weekStart", "energy", "workload", "satisfaction"],
    },
    execute: (input) =>
      agentApi.setEnergy(input as unknown as EnergyReflectionInput),
  },
  {
    name: "brag_import_merge",
    description:
      "Batch-add records. Appends — never replaces. Keys: goals, achievements, people, sessions, enablement, energy.",
    inputSchema: {
      type: "object",
      properties: {
        goals: { type: "array", items: { type: "object" } },
        achievements: { type: "array", items: { type: "object" } },
        people: { type: "array", items: { type: "object" } },
        sessions: { type: "array", items: { type: "object" } },
        enablement: { type: "array", items: { type: "object" } },
        energy: { type: "array", items: { type: "object" } },
      },
    },
    execute: (input) => agentApi.importMerge(input as unknown as MergePayload),
  },
  {
    name: "brag_list_achievements",
    description: "List all achievements.",
    annotations: { readOnlyHint: true },
    execute: async () => ({ achievements: await agentApi.listAchievements() }),
  },
  {
    name: "brag_export",
    description: "Export the full database as a JSON snapshot.",
    annotations: { readOnlyHint: true },
    execute: () => agentApi.exportAll(),
  },
];

export default defineNuxtPlugin(() => {
  const ctx = getModelContext();
  if (!ctx) return; // No WebMCP here — window.brag is still available.
  for (const tool of TOOLS) ctx.registerTool(tool);
  console.info(`[webmcp] Registered ${TOOLS.length} Brag tools.`);
});
