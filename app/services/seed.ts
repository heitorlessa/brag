/** Insert a small set of sample records to explore the app quickly. */
import { createAchievement } from "./achievements";
import { createGoal } from "./goals";
import { createEnablement } from "./enablement";
import { createPerson, createSession } from "./mentoring";
import { upsertReflection } from "./energy";
import { addWeeks, currentWeekStart, today } from "~/utils/date";

export async function seedSampleData(): Promise<void> {
  const goal = await createGoal({
    title: "Grow as a technical leader",
    description:
      "Mentor more engineers and run regular enablement.\n\n- Mentor 3+ people\n- Run a workshop per quarter",
    year: new Date().getFullYear(),
    category: "Growth",
    status: "in_progress",
    progress: 40,
    targetDate: null,
  });

  await createAchievement({
    title: "Shipped the local-first Brag app",
    description: "Built a privacy-first tracker with Nuxt + SQLite/OPFS.",
    impact: "Made it easy to keep a continuous record for reviews.",
    category: "Delivery",
    tags: ["launch", "oss"],
    occurredAt: today(),
    goalId: goal.id,
  });

  await createEnablement({
    title: "Onboarding workshop",
    type: "workshop",
    audience: "New hires",
    date: today(),
    attendees: 12,
    link: null,
    notes: "Walked through the platform and answered questions.",
  });

  const mentee = await createPerson({
    name: "Alex Doe",
    role: "Junior engineer",
    relationship: "regular",
    cadence: "Biweekly",
    notes: "Focusing on system design fundamentals.",
    active: true,
    startedAt: today(),
  });
  await createSession({
    personId: mentee.id,
    date: today(),
    topic: "Career planning",
    notes: "Set goals for the next quarter.",
  });

  const week = currentWeekStart();
  await upsertReflection({
    weekStart: addWeeks(week, -2),
    energy: 4,
    workload: 3,
    satisfaction: 4,
    note: "Solid week.",
  });
  await upsertReflection({
    weekStart: addWeeks(week, -1),
    energy: 3,
    workload: 4,
    satisfaction: 3,
    note: "Busier than usual.",
  });
  await upsertReflection({
    weekStart: week,
    energy: 4,
    workload: 3,
    satisfaction: 4,
    note: "Back on track.",
  });
}
