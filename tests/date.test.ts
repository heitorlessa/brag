import { describe, expect, it } from "vitest";
import {
  addWeeks,
  formatWeekLabel,
  isoWeekStart,
  today,
} from "../app/utils/date";

// 2024-01-01 was a Monday — a stable anchor for week math.
describe("isoWeekStart", () => {
  it("returns the same date when given a Monday", () => {
    expect(isoWeekStart("2024-01-01")).toBe("2024-01-01");
  });

  it("snaps a mid-week day back to Monday", () => {
    expect(isoWeekStart("2024-01-03")).toBe("2024-01-01"); // Wednesday
  });

  it("snaps Sunday back to the week's Monday", () => {
    expect(isoWeekStart("2024-01-07")).toBe("2024-01-01"); // Sunday
  });

  it("always lands on a Monday", () => {
    const start = isoWeekStart("2026-06-09");
    const day = new Date(`${start}T00:00:00Z`).getUTCDay();
    expect(day).toBe(1);
  });
});

describe("addWeeks", () => {
  it("advances by whole weeks", () => {
    expect(addWeeks("2024-01-01", 2)).toBe("2024-01-15");
  });

  it("goes backward with negative input", () => {
    expect(addWeeks("2024-01-15", -2)).toBe("2024-01-01");
  });
});

describe("formatWeekLabel", () => {
  it("formats a same-month week range", () => {
    expect(formatWeekLabel("2024-01-01")).toBe("Jan 1 – 7, 2024");
  });
});

describe("today", () => {
  it("returns a YYYY-MM-DD string", () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
