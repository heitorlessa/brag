/** Burnout / recovery signal derived from recent weekly reflections. */
import type { EnergyReflection } from "~/local-db";

export type EnergyLevel = "ok" | "watch" | "alert";

export interface EnergySignal {
  level: EnergyLevel;
  title: string;
  message: string;
}

/** Count consecutive trailing weeks (from most recent) matching a predicate. */
function trailingStreak(
  ordered: EnergyReflection[],
  predicate: (reflection: EnergyReflection) => boolean
): number {
  let streak = 0;
  for (let i = ordered.length - 1; i >= 0; i -= 1) {
    if (predicate(ordered[i] as EnergyReflection)) streak += 1;
    else break;
  }
  return streak;
}

/**
 * @param reflections Weekly reflections sorted ascending by weekStart.
 */
export function analyzeEnergy(reflections: EnergyReflection[]): EnergySignal {
  if (reflections.length < 2) {
    return {
      level: "ok",
      title: "Keep checking in",
      message: "Log a few weeks to start seeing your energy trend.",
    };
  }

  const lowEnergy = trailingStreak(reflections, (r) => r.energy <= 2);
  const highWorkload = trailingStreak(reflections, (r) => r.workload >= 4);
  const lowSatisfaction = trailingStreak(
    reflections,
    (r) => r.satisfaction <= 2
  );

  if (lowEnergy >= 3 || (highWorkload >= 3 && lowEnergy >= 2)) {
    return {
      level: "alert",
      title: "Burnout risk",
      message: `Energy has been low for ${Math.max(lowEnergy, 2)} weeks running${
        highWorkload >= 3 ? " alongside heavy workload" : ""
      }. Consider a reset — time off or dropping commitments.`,
    };
  }

  if (lowEnergy >= 2 || highWorkload >= 3 || lowSatisfaction >= 2) {
    return {
      level: "watch",
      title: "Worth watching",
      message:
        "A couple of tougher weeks. Keep an eye on recovery and protect your downtime.",
    };
  }

  return {
    level: "ok",
    title: "Looking steady",
    message: "Your recent energy and workload look balanced.",
  };
}
