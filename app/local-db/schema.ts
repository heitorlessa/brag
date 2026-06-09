/**
 * Drizzle schema for the local-first Brag database (SQLite via SQLocal/OPFS).
 *
 * Conventions:
 * - Every table has a string `id` (crypto.randomUUID()) primary key.
 * - `createdAt` / `updatedAt` are ISO-8601 strings set by the mutation layer.
 * - Markdown is stored verbatim as text (see RichTextEditor + tiptap-markdown).
 *
 * Run `make db-generate` after editing this file to regenerate + embed the
 * SQL migrations consumed on startup by app/local-db/migrate.ts.
 */
import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

const timestamps = {
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
};

// ── Goals ────────────────────────────────────────────────────────────────
export const goals = sqliteTable("goals", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  year: integer("year").notNull(),
  category: text("category").notNull().default(""),
  status: text("status", {
    enum: ["not_started", "in_progress", "done", "dropped"],
  })
    .notNull()
    .default("not_started"),
  progress: integer("progress").notNull().default(0),
  targetDate: text("target_date"),
  ...timestamps,
});

// ── Achievements ───────────────────────────────────────────────────────────
export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  impact: text("impact").notNull().default(""),
  category: text("category").notNull().default(""),
  tags: text("tags", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  occurredAt: text("occurred_at").notNull(),
  goalId: text("goal_id").references(() => goals.id, { onDelete: "set null" }),
  ...timestamps,
});

// ── People (mentees) ───────────────────────────────────────────────────────
export const people = sqliteTable("people", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull().default(""),
  relationship: text("relationship", { enum: ["ad_hoc", "regular"] })
    .notNull()
    .default("ad_hoc"),
  cadence: text("cadence").notNull().default(""),
  notes: text("notes").notNull().default(""),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  startedAt: text("started_at"),
  ...timestamps,
});

// ── Mentoring sessions ─────────────────────────────────────────────────────
export const mentoringSessions = sqliteTable("mentoring_sessions", {
  id: text("id").primaryKey(),
  personId: text("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  topic: text("topic").notNull().default(""),
  notes: text("notes").notNull().default(""),
  ...timestamps,
});

// ── Enablement ─────────────────────────────────────────────────────────────
export const enablement = sqliteTable("enablement", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type", {
    enum: ["workshop", "talk", "training", "doc", "office_hours"],
  })
    .notNull()
    .default("workshop"),
  audience: text("audience").notNull().default(""),
  date: text("date").notNull(),
  attendees: integer("attendees"),
  link: text("link"),
  notes: text("notes").notNull().default(""),
  ...timestamps,
});

// ── Energy reflections (one per ISO week) ──────────────────────────────────
export const energyReflections = sqliteTable(
  "energy_reflections",
  {
    id: text("id").primaryKey(),
    weekStart: text("week_start").notNull(),
    energy: integer("energy").notNull(),
    workload: integer("workload").notNull(),
    satisfaction: integer("satisfaction").notNull(),
    note: text("note").notNull().default(""),
    ...timestamps,
  },
  (table) => [uniqueIndex("energy_week_start_unq").on(table.weekStart)]
);

// ── drizzle-zod insert schemas (DB-shape validation) ───────────────────────
export const insertGoalSchema = createInsertSchema(goals, {
  title: (s) => s.min(1, "Title is required"),
  progress: (s) => s.min(0).max(100),
});
export const insertAchievementSchema = createInsertSchema(achievements, {
  title: (s) => s.min(1, "Title is required"),
});
export const insertPersonSchema = createInsertSchema(people, {
  name: (s) => s.min(1, "Name is required"),
});
export const insertMentoringSessionSchema =
  createInsertSchema(mentoringSessions);
export const insertEnablementSchema = createInsertSchema(enablement, {
  title: (s) => s.min(1, "Title is required"),
});
export const insertEnergyReflectionSchema = createInsertSchema(
  energyReflections,
  {
    energy: (s) => s.min(1).max(5),
    workload: (s) => s.min(1).max(5),
    satisfaction: (s) => s.min(1).max(5),
  }
);

// ── Inferred row types ─────────────────────────────────────────────────────
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
export type Person = typeof people.$inferSelect;
export type NewPerson = typeof people.$inferInsert;
export type MentoringSession = typeof mentoringSessions.$inferSelect;
export type NewMentoringSession = typeof mentoringSessions.$inferInsert;
export type Enablement = typeof enablement.$inferSelect;
export type NewEnablement = typeof enablement.$inferInsert;
export type EnergyReflection = typeof energyReflections.$inferSelect;
export type NewEnergyReflection = typeof energyReflections.$inferInsert;

export type GoalStatus = Goal["status"];
export type Relationship = Person["relationship"];
export type EnablementType = Enablement["type"];
