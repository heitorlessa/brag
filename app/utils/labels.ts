/** Display metadata (labels + badge colors) for enum-ish fields. */
import type { EnablementType, GoalStatus, Relationship } from "~/local-db";

type BadgeColor = "primary" | "secondary" | "success" | "warning" | "neutral";

export const goalStatusMeta: Record<
  GoalStatus,
  { label: string; color: BadgeColor }
> = {
  not_started: { label: "Not started", color: "neutral" },
  in_progress: { label: "In progress", color: "primary" },
  done: { label: "Done", color: "success" },
  dropped: { label: "Dropped", color: "warning" },
};

export const enablementTypeMeta: Record<
  EnablementType,
  { label: string; icon: string }
> = {
  workshop: { label: "Workshop", icon: "i-lucide-users" },
  talk: { label: "Talk", icon: "i-lucide-mic" },
  training: { label: "Training", icon: "i-lucide-graduation-cap" },
  doc: { label: "Doc", icon: "i-lucide-file-text" },
  office_hours: { label: "Office hours", icon: "i-lucide-coffee" },
};

export const relationshipMeta: Record<
  Relationship,
  { label: string; color: BadgeColor }
> = {
  ad_hoc: { label: "Ad-hoc", color: "neutral" },
  regular: { label: "Regular", color: "secondary" },
};
