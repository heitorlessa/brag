/**
 * Build a Markdown "brag doc" from a date-bounded slice of the data — ready to
 * drop into a perf review. Pure + self-contained (type-only imports) so it is
 * trivially unit-testable.
 */
import type {
  Achievement,
  Enablement,
  MentoringSession,
  Person,
} from "~/local-db";

export interface BragDocInput {
  from: string; // YYYY-MM-DD inclusive
  to: string; // YYYY-MM-DD inclusive
  achievements: Achievement[];
  enablement: Enablement[];
  sessions: MentoringSession[];
  people: Person[];
}

const ENABLEMENT_LABELS: Record<string, string> = {
  workshop: "Workshop",
  talk: "Talk",
  training: "Training",
  doc: "Doc",
  review: "Review",
  office_hours: "Office hours",
};

// ISO date strings compare correctly with lexicographic ordering.
function inRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to;
}

function prettyDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function buildBragDoc(input: BragDocInput): string {
  const { from, to } = input;

  const achievements = input.achievements
    .filter((a) => inRange(a.occurredAt, from, to))
    .toSorted((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const enablement = input.enablement
    .filter((e) => inRange(e.date, from, to))
    .toSorted((a, b) => b.date.localeCompare(a.date));
  const sessions = input.sessions.filter((s) => inRange(s.date, from, to));

  const lines: string[] = [
    "# Brag Highlights",
    "",
    `_${prettyDate(from)} – ${prettyDate(to)}_`,
    "",
  ];

  // Achievements
  lines.push(`## 🏆 Achievements (${achievements.length})`, "");
  if (achievements.length === 0) {
    lines.push("_None recorded in this period._", "");
  }
  for (const achievement of achievements) {
    const meta = [prettyDate(achievement.occurredAt), achievement.category]
      .filter(Boolean)
      .join(" · ");
    lines.push(`### ${achievement.title}`, `_${meta}_`, "");
    if (achievement.description.trim()) {
      lines.push(achievement.description.trim(), "");
    }
    if (achievement.impact.trim()) {
      lines.push(`**Impact:** ${achievement.impact.trim()}`, "");
    }
    if (achievement.tags.length) {
      lines.push(achievement.tags.map((tag) => `\`${tag}\``).join(" "), "");
    }
  }

  // Enablement
  lines.push(`## 🎤 Enablement (${enablement.length})`, "");
  if (enablement.length === 0) {
    lines.push("_None recorded in this period._", "");
  }
  for (const item of enablement) {
    const type = ENABLEMENT_LABELS[item.type] ?? item.type;
    const extra = [
      item.audience,
      item.attendees != null ? `${item.attendees} attendees` : "",
    ]
      .filter(Boolean)
      .join(", ");
    const tail = extra ? ` (${extra})` : "";
    lines.push(
      `- **${item.title}** — ${type}, ${prettyDate(item.date)}${tail}`
    );
  }
  if (enablement.length) lines.push("");

  // Mentoring
  const byPerson = new Map<string, number>();
  for (const session of sessions) {
    byPerson.set(session.personId, (byPerson.get(session.personId) ?? 0) + 1);
  }
  const nameById = new Map(input.people.map((p) => [p.id, p.name]));
  lines.push("## 🤝 Mentoring", "");
  lines.push(
    `${sessions.length} session${sessions.length === 1 ? "" : "s"} across ${byPerson.size} ${
      byPerson.size === 1 ? "person" : "people"
    } in this period.`,
    ""
  );
  for (const [personId, count] of byPerson) {
    const name = nameById.get(personId) ?? "Unknown";
    lines.push(`- **${name}** — ${count} session${count === 1 ? "" : "s"}`);
  }
  if (byPerson.size) lines.push("");

  return (
    lines
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trimEnd() + "\n"
  );
}
