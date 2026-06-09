/**
 * Demo data: a realistic example dataset a first-time visitor can load in one
 * click to explore Brag — and remove just as easily.
 *
 * Every demo row's `id` is prefixed with `demo-`, so the demo set can be
 * deleted precisely (`removeDemoData`) without touching anything the user
 * created themselves. Loading is idempotent: it clears any existing demo rows
 * first, so loading twice never duplicates (and never trips the unique-week
 * constraint on energy reflections).
 */
import {
  achievements,
  enablement,
  energyReflections,
  getDb,
  goals,
  like,
  mentoringSessions,
  nowISO,
  people,
} from "~/local-db";
import type {
  NewAchievement,
  NewEnablement,
  NewEnergyReflection,
  NewGoal,
  NewMentoringSession,
  NewPerson,
} from "~/local-db";
import { addWeeks, currentWeekStart, today } from "~/utils/date";

/** Prefix marking a row as demo data, so it can be removed precisely. */
export const DEMO_PREFIX = "demo-";

function demoId(): string {
  return `${DEMO_PREFIX}${crypto.randomUUID()}`;
}

function daysAgo(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().slice(0, 10);
}

/** Load the demo dataset (replacing any demo rows already present). */
export async function seedDemoData(): Promise<void> {
  const db = await getDb();
  await removeDemoData(); // start clean so a second load never duplicates

  const now = nowISO();
  const year = new Date().getFullYear();

  // ── Goals ──────────────────────────────────────────────────────────────
  const leadershipId = demoId();
  const devexId = demoId();
  const goalRows: NewGoal[] = [
    {
      id: leadershipId,
      title: "Grow as a technical leader",
      description:
        "Move from individual impact to multiplying the team.\n\n- Mentor 3+ engineers\n- Run regular enablement\n- Be the go-to for architecture",
      year,
      category: "Growth",
      status: "in_progress",
      progress: 60,
      targetDate: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: devexId,
      title: "Improve developer experience",
      description:
        "Make the inner loop fast and pleasant.\n\n- Cut CI time in half\n- Document the golden paths",
      year,
      category: "Impact",
      status: "in_progress",
      progress: 45,
      targetDate: daysAgo(-120),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: demoId(),
      title: "Build a sustainable mentoring practice",
      description: "Regular, low-friction mentoring that doesn't burn me out.",
      year,
      category: "People",
      status: "in_progress",
      progress: 75,
      targetDate: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: demoId(),
      title: "Write more, publicly",
      description: "Ship one substantial post a month.",
      year,
      category: "Influence",
      status: "not_started",
      progress: 10,
      targetDate: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: demoId(),
      title: "Ship the Brag app",
      description: "A local-first record of achievements. ✅",
      year,
      category: "Side project",
      status: "done",
      progress: 100,
      targetDate: null,
      createdAt: now,
      updatedAt: now,
    },
  ];
  await db.insert(goals).values(goalRows);

  // ── Achievements ─────────────────────────────────────────────────────────
  const achievementRows: NewAchievement[] = [
    {
      title: "Shipped the local-first Brag app",
      description:
        "Built a **privacy-first** tracker with Nuxt 4 + SQLite/OPFS — no server, no sync.",
      impact: "A continuous record I actually keep, ready for any review.",
      category: "Delivery",
      tags: ["launch", "oss"],
      occurredAt: today(),
      goalId: leadershipId,
    },
    {
      title: "Led the platform migration",
      description:
        "Coordinated 4 teams to move onto the new platform with zero downtime.",
      impact: "Cut infra spend ~25% and unblocked the new region launch.",
      category: "Delivery",
      tags: ["platform", "leadership"],
      occurredAt: daysAgo(24),
      goalId: leadershipId,
    },
    {
      title: "Reduced CI time by 40%",
      description: "Profiled the pipeline and parallelized the slow stages.",
      impact: "Saved the team ~30 minutes per PR — hours back every day.",
      category: "Delivery",
      tags: ["devex", "performance"],
      occurredAt: daysAgo(48),
      goalId: devexId,
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
      goalId: devexId,
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
  ].map((a) =>
    Object.assign(a, { id: demoId(), createdAt: now, updatedAt: now })
  );
  await db.insert(achievements).values(achievementRows);

  // ── People + sessions ─────────────────────────────────────────────────────
  const alexId = demoId();
  const samId = demoId();
  const jordanId = demoId();
  const peopleRows: NewPerson[] = [
    {
      id: alexId,
      name: "Alex Doe",
      role: "Junior engineer",
      relationship: "regular",
      cadence: "Biweekly",
      notes: "Focusing on system design fundamentals and scoping work.",
      active: true,
      startedAt: daysAgo(150),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: samId,
      name: "Sam Rivera",
      role: "Mid-level engineer",
      relationship: "regular",
      cadence: "Monthly",
      notes: "Working toward tech-lead scope.",
      active: true,
      startedAt: daysAgo(90),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: jordanId,
      name: "Jordan Lee",
      role: "New grad",
      relationship: "ad_hoc",
      cadence: "On request",
      notes: "Occasional career and confidence check-ins.",
      active: true,
      startedAt: daysAgo(40),
      createdAt: now,
      updatedAt: now,
    },
  ];
  await db.insert(people).values(peopleRows);

  const sessionRows: NewMentoringSession[] = [
    {
      personId: alexId,
      date: daysAgo(7),
      topic: "Scoping a project",
      notes: "Broke a vague task into a 2-week plan with checkpoints.",
    },
    {
      personId: alexId,
      date: daysAgo(21),
      topic: "Code review habits",
      notes: "Reviewed how to give and receive feedback kindly and fast.",
    },
    {
      personId: samId,
      date: daysAgo(12),
      topic: "Leading without authority",
      notes: "Talked through driving a cross-team initiative.",
    },
    {
      personId: jordanId,
      date: daysAgo(30),
      topic: "First-90-days",
      notes: "Set expectations and a learning plan.",
    },
  ].map((s) =>
    Object.assign(s, { id: demoId(), createdAt: now, updatedAt: now })
  );
  await db.insert(mentoringSessions).values(sessionRows);

  // ── Enablement ─────────────────────────────────────────────────────────────
  const enablementSeed: Omit<
    NewEnablement,
    "id" | "createdAt" | "updatedAt"
  >[] = [
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
  const enablementRows: NewEnablement[] = enablementSeed.map((e) =>
    Object.assign(e, { id: demoId(), createdAt: now, updatedAt: now })
  );
  await db.insert(enablement).values(enablementRows);

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
  const energyRows: NewEnergyReflection[] = arc.map((tuple, i) => {
    const [energy, workload, satisfaction] = tuple;
    return {
      id: demoId(),
      weekStart: addWeeks(week, -(arc.length - 1 - i)),
      energy,
      workload,
      satisfaction,
      note: notes[i] ?? "",
      createdAt: now,
      updatedAt: now,
    };
  });
  await db.insert(energyReflections).values(energyRows);
}

/** Delete only the demo rows — the user's own entries are left untouched. */
export async function removeDemoData(): Promise<void> {
  const db = await getDb();
  const pattern = `${DEMO_PREFIX}%`;
  // Children before parents (FK-safe), mirroring the backup import order.
  await db.delete(achievements).where(like(achievements.id, pattern));
  await db.delete(mentoringSessions).where(like(mentoringSessions.id, pattern));
  await db.delete(goals).where(like(goals.id, pattern));
  await db.delete(people).where(like(people.id, pattern));
  await db.delete(enablement).where(like(enablement.id, pattern));
  await db.delete(energyReflections).where(like(energyReflections.id, pattern));
}

/**
 * Whether any demo data is currently loaded. The demo set always includes
 * goals and achievements, so checking those two is sufficient.
 */
export async function hasDemoData(): Promise<boolean> {
  const db = await getDb();
  const pattern = `${DEMO_PREFIX}%`;
  const [g, a] = await Promise.all([
    db
      .select({ id: goals.id })
      .from(goals)
      .where(like(goals.id, pattern))
      .limit(1),
    db
      .select({ id: achievements.id })
      .from(achievements)
      .where(like(achievements.id, pattern))
      .limit(1),
  ]);
  return g.length > 0 || a.length > 0;
}
