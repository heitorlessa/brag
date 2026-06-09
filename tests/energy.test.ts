import { describe, expect, it } from "vitest";
import { analyzeEnergy } from "../app/utils/energy";
import type { EnergyReflection } from "../app/local-db/schema";

function reflection(
  weekStart: string,
  energy: number,
  workload = 3,
  satisfaction = 3
): EnergyReflection {
  return {
    id: weekStart,
    weekStart,
    energy,
    workload,
    satisfaction,
    note: "",
    createdAt: "",
    updatedAt: "",
  };
}

describe("analyzeEnergy", () => {
  it("asks for more data when there are fewer than two weeks", () => {
    expect(analyzeEnergy([]).level).toBe("ok");
    expect(analyzeEnergy([reflection("2024-01-01", 1)]).level).toBe("ok");
  });

  it("flags an alert after three trailing low-energy weeks", () => {
    const signal = analyzeEnergy([
      reflection("2024-01-01", 4),
      reflection("2024-01-08", 2),
      reflection("2024-01-15", 1),
      reflection("2024-01-22", 2),
    ]);
    expect(signal.level).toBe("alert");
  });

  it("flags watch after two tougher weeks", () => {
    const signal = analyzeEnergy([
      reflection("2024-01-01", 4),
      reflection("2024-01-08", 2),
      reflection("2024-01-15", 2),
    ]);
    expect(signal.level).toBe("watch");
  });

  it("flags alert when heavy workload coincides with low energy", () => {
    const signal = analyzeEnergy([
      reflection("2024-01-01", 3, 5),
      reflection("2024-01-08", 2, 5),
      reflection("2024-01-15", 2, 4),
    ]);
    expect(signal.level).toBe("alert");
  });

  it("stays positive on a balanced run", () => {
    const signal = analyzeEnergy([
      reflection("2024-01-01", 4, 3, 4),
      reflection("2024-01-08", 5, 2, 5),
      reflection("2024-01-15", 4, 3, 4),
    ]);
    expect(signal.level).toBe("ok");
  });
});
