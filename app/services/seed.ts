/**
 * Sample data so a first-time visitor can see the app's full potential.
 * `autoSeedIfEmpty()` runs once on a fresh database; `seedSampleData()` is also
 * exposed via Settings → "Load sample data".
 */
import { createAchievement } from "./achievements";
import { createGoal } from "./goals";
import { createEnablement } from "./enablement";
import { createPerson, createSession } from "./mentoring";
import { upsertReflection } from "./energy";
import { achievements, getDb } from "~/local-db";
import { addWeeks, currentWeekStart, today } from "~/utils/date";

function daysAgo(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().slice(0, 10);
}

const SEED_FLAG = "brag:auto-seeded";

export async function seedSampleData(): Promise<void> {
  // ── Goals ──────────────────────────────────────────────────────────────
  const year = new Date().getFullYear();
  const leadership = await createGoal({
    title: "Grow as a technical leader",
    description:
      "Move from individual impact to multiplying the team.\n\n- Mentor 3+ engineers\n- Run regular enablement\n- Be the go-to for architecture",
    year,
    category: "Growth",
    status: "in_progress",
    progress: 60,
    targetDate: null,
  });
  const devex = await createGoal({
    title: "Improve developer experience",
    description:
      "Make the inner loop fast and pleasant.\n\n- Cut CI time in half\n- Document the golden paths",
    year,
    category: "Impact",
    status: "in_progress",
    progress: 45,
    targetDate: daysAgo(-120),
  });
  await createGoal({
    title: "Build a sustainable mentoring practice",
    description: "Regular, low-friction mentoring that doesn't burn me out.",
    year,
    category: "People",
    status: "in_progress",
    progress: 75,
    targetDate: null,
  });
  await createGoal({
    title: "Write more, publicly",
    description: "Ship one substantial post a month.",
    year,
    category: "Influence",
    status: "not_started",
    progress: 10,
    targetDate: null,
  });
  await createGoal({
    title: "Ship the Brag app",
    description: "A local-first record of achievements. ✅",
    year,
    category: "Side project",
    status: "done",
    progress: 100,
    targetDate: null,
  });

  // ── Achievements ─────────────────────────────────────────────────────────
  const achievementsSeed: {
    title: string;
    description: string;
    impact: string;
    category: string;
    tags: string[];
    occurredAt: string;
    goalId: string | null;
  }[] = [
    {
      title: "Shipped the local-first Brag app",
      description:
        "Built a **privacy-first** tracker with Nuxt 4 + SQLite/OPFS — no server, no sync.",
      impact: "A continuous record I actually keep, ready for any review.",
      category: "Delivery",
      tags: ["launch", "oss"],
      occurredAt: today(),
      goalId: leadership.id,
    },
    {
      title: "Led the platform migration",
      description:
        "Coordinated 4 teams to move onto the new platform with zero downtime.",
      impact: "Cut infra spend ~25% and unblocked the new region launch.",
      category: "Delivery",
      tags: ["platform", "leadership"],
      occurredAt: daysAgo(24),
      goalId: leadership.id,
    },
    {
      title: "Reduced CI time by 40%",
      description: "Profiled the pipeline and parallelized the slow stages.",
      impact: "Saved the team ~30 minutes per PR — hours back every day.",
      category: "Delivery",
      tags: ["devex", "performance"],
      occurredAt: daysAgo(48),
      goalId: devex.id,
    },
    {
      title: "Two mentees promoted",
      description:
        "Both engineers I mentor reached their next level this cycle.",
      impact: "Direct evidence of the mentoring practice paying off.",
      category: "Leadership",
      tags: ["mentoring", "people"],
      occurredAt: daysAgo(70),
      goalId: null,
    },
    {
      title: "Spoke at the internal eng summit",
      description: "Talk on async communication for distributed teams.",
      impact: "Adopted by 3 teams as their default working agreement.",
      category: "Influence",
      tags: ["speaking"],
      occurredAt: daysAgo(82),
      goalId: null,
    },
    {
      title: "Published the API design guide",
      description: "Wrote the team's first shared guide for designing APIs.",
      impact: "New services now ship consistent, reviewable interfaces.",
      category: "Influence",
      tags: ["docs", "standards"],
      occurredAt: daysAgo(110),
      goalId: devex.id,
    },
    {
      title: "Resolved the top customer escalation",
      description: "Root-caused a long-standing data issue under pressure.",
      impact: "Retained a key account and fixed the class of bug for good.",
      category: "Delivery",
      tags: ["customer", "reliability"],
      occurredAt: daysAgo(135),
      goalId: null,
    },
  ];
  for (const a of achievementsSeed) await createAchievement(a);

  // ── People + sessions ─────────────────────────────────────────────────────
  const alex = await createPerson({
    name: "Alex Doe",
    role: "Junior engineer",
    relationship: "regular",
    cadence: "Biweekly",
    notes: "Focusing on system design fundamentals and scoping work.",
    active: true,
    startedAt: daysAgo(150),
  });
  await createSession({
    personId: alex.id,
    date: daysAgo(7),
    topic: "Scoping a project",
    notes: "Broke a vague task into a 2-week plan with checkpoints.",
  });
  await createSession({
    personId: alex.id,
    date: daysAgo(21),
    topic: "Code review habits",
    notes: "Reviewed how to give and receive feedback kindly and fast.",
  });

  const sam = await createPerson({
    name: "Sam Rivera",
    role: "Mid-level engineer",
    relationship: "regular",
    cadence: "Monthly",
    notes: "Working toward tech-lead scope.",
    active: true,
    startedAt: daysAgo(90),
  });
  await createSession({
    personId: sam.id,
    date: daysAgo(12),
    topic: "Leading without authority",
    notes: "Talked through driving a cross-team initiative.",
  });

  const jordan = await createPerson({
    name: "Jordan Lee",
    role: "New grad",
    relationship: "ad_hoc",
    cadence: "On request",
    notes: "Occasional career and confidence check-ins.",
    active: true,
    startedAt: daysAgo(40),
  });
  await createSession({
    personId: jordan.id,
    date: daysAgo(30),
    topic: "First-90-days",
    notes: "Set expectations and a learning plan.",
  });

  // ── Enablement ─────────────────────────────────────────────────────────────
  const enablementSeed: {
    title: string;
    type: "workshop" | "talk" | "training" | "doc" | "office_hours";
    audience: string;
    date: string;
    attendees: number | null;
    link: string | null;
    notes: string;
  }[] = [
    {
      title: "New-hire onboarding workshop",
      type: "workshop",
      audience: "New engineers",
      date: daysAgo(14),
      attendees: 12,
      link: null,
      notes:
        "Walked through the platform, golden paths, and where to get help.",
    },
    {
      title: "Async communication for distributed teams",
      type: "talk",
      audience: "Engineering org",
      date: daysAgo(82),
      attendees: 45,
      link: null,
      notes:
        "Recording shared org-wide; sparked the working-agreement rollout.",
    },
    {
      title: "Testing fundamentals",
      type: "training",
      audience: "Backend guild",
      date: daysAgo(56),
      attendees: 8,
      link: null,
      notes: "Hands-on session on writing fast, trustworthy tests.",
    },
    {
      title: "API design guide",
      type: "doc",
      audience: "All engineers",
      date: daysAgo(110),
      attendees: null,
      link: null,
      notes: "Living document; now part of the design-review checklist.",
    },
    {
      title: "Weekly office hours",
      type: "office_hours",
      audience: "Anyone",
      date: daysAgo(3),
      attendees: 5,
      link: null,
      notes: "Open room for architecture and career questions.",
    },
  ];
  for (const e of enablementSeed) await createEnablement(e);

  // ── Energy: ~14 weeks with a dip-and-recover arc ──────────────────────────
  const week = currentWeekStart();
  const arc: [number, number, number][] = [
    // [energy, workload, satisfaction]
    [4, 3, 4],
    [4, 3, 4],
    [5, 2, 5],
    [4, 3, 4],
    [3, 4, 3],
    [3, 4, 3],
    [2, 5, 2], // crunch begins
    [2, 5, 2],
    [2, 4, 3],
    [3, 4, 3], // recovery
    [3, 3, 4],
    [4, 3, 4],
    [4, 2, 4],
    [4, 3, 5], // back on track
  ];
  const notes: Record<number, string> = {
    6: "Launch crunch — long days.",
    7: "Still heads-down on the incident.",
    9: "Took two afternoons off to recover.",
    13: "Feeling balanced again.",
  };
  for (let i = 0; i < arc.length; i += 1) {
    const [energy, workload, satisfaction] = arc[i] as [number, number, number];
    await upsertReflection({
      weekStart: addWeeks(week, -(arc.length - 1 - i)),
      energy,
      workload,
      satisfaction,
      note: notes[i] ?? "",
    });
  }
}

/**
 * Seed once on a brand-new, empty database (showcase). Guarded by a localStorage
 * flag so clearing data does NOT silently re-seed.
 */
export async function autoSeedIfEmpty(): Promise<void> {
  if (typeof localStorage === "undefined") return;
  if (localStorage.getItem(SEED_FLAG)) return;

  const db = await getDb();
  const existing = await db
    .select({ id: achievements.id })
    .from(achievements)
    .limit(1);
  if (existing.length === 0) {
    await seedSampleData();
  }
  localStorage.setItem(SEED_FLAG, "1");
}
