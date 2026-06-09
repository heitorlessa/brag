import { describe, expect, it } from "vitest";
import { buildBragDoc } from "../app/utils/brag-doc";
import type {
  Achievement,
  Enablement,
  MentoringSession,
  Person,
} from "../app/local-db/schema";

function achievement(partial: Partial<Achievement>): Achievement {
  return {
    id: "a1",
    title: "Win",
    description: "",
    impact: "",
    category: "",
    tags: [],
    occurredAt: "2026-03-01",
    goalId: null,
    createdAt: "",
    updatedAt: "",
    ...partial,
  };
}

function enablement(partial: Partial<Enablement>): Enablement {
  return {
    id: "e1",
    title: "Workshop",
    type: "workshop",
    audience: "",
    date: "2026-03-01",
    attendees: null,
    link: null,
    notes: "",
    createdAt: "",
    updatedAt: "",
    ...partial,
  };
}

function session(partial: Partial<MentoringSession>): MentoringSession {
  return {
    id: "s1",
    personId: "p1",
    date: "2026-03-01",
    topic: "",
    notes: "",
    createdAt: "",
    updatedAt: "",
    ...partial,
  };
}

const people: Person[] = [
  {
    id: "p1",
    name: "Alex",
    role: "",
    relationship: "regular",
    cadence: "",
    notes: "",
    active: true,
    startedAt: null,
    createdAt: "",
    updatedAt: "",
  },
];

describe("buildBragDoc", () => {
  it("includes only records within the date range", () => {
    const doc = buildBragDoc({
      from: "2026-01-01",
      to: "2026-06-30",
      achievements: [
        achievement({ id: "in", title: "In range", occurredAt: "2026-02-15" }),
        achievement({
          id: "out",
          title: "Out range",
          occurredAt: "2025-12-31",
        }),
      ],
      enablement: [],
      sessions: [],
      people,
    });
    expect(doc).toContain("In range");
    expect(doc).not.toContain("Out range");
    expect(doc).toContain("## 🏆 Achievements (1)");
  });

  it("renders impact and tags for an achievement", () => {
    const doc = buildBragDoc({
      from: "2026-01-01",
      to: "2026-12-31",
      achievements: [
        achievement({
          title: "Shipped X",
          impact: "Saved 10 hours/week",
          tags: ["launch"],
        }),
      ],
      enablement: [],
      sessions: [],
      people,
    });
    expect(doc).toContain("### Shipped X");
    expect(doc).toContain("**Impact:** Saved 10 hours/week");
    expect(doc).toContain("`launch`");
  });

  it("summarizes mentoring by person", () => {
    const doc = buildBragDoc({
      from: "2026-01-01",
      to: "2026-12-31",
      achievements: [],
      enablement: [enablement({ title: "Onboarding", attendees: 8 })],
      sessions: [
        session({ id: "s1", date: "2026-02-01" }),
        session({ id: "s2", date: "2026-03-01" }),
      ],
      people,
    });
    expect(doc).toContain("2 sessions across 1 person");
    expect(doc).toContain("**Alex** — 2 sessions");
    expect(doc).toContain("**Onboarding** — Workshop");
    expect(doc).toContain("8 attendees");
  });
});
