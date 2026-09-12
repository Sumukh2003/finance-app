import { describe, expect, it } from "vitest";
import {
  isValidMonth,
  lastNMonths,
  monthRange,
  previousMonth,
  shiftMonth,
  toDateInputValue,
  toMonthKey,
} from "./date";

describe("toMonthKey", () => {
  it("formats a date as YYYY-MM", () => {
    expect(toMonthKey(new Date(2026, 8, 12))).toBe("2026-09");
  });

  it("zero-pads single-digit months", () => {
    expect(toMonthKey(new Date(2026, 0, 5))).toBe("2026-01");
  });

  it("uses local date parts, not UTC", () => {
    // The first of the month just after midnight local time. `toISOString()`
    // would roll this back into the previous month anywhere east of GMT.
    expect(toMonthKey(new Date(2026, 2, 1, 0, 30))).toBe("2026-03");
  });
});

describe("isValidMonth", () => {
  it.each(["2026-01", "2026-12", "1999-07"])("accepts %s", (month) => {
    expect(isValidMonth(month)).toBe(true);
  });

  it.each(["2026-13", "2026-00", "2026-1", "26-01", "", "2026-09-01"])(
    "rejects %j",
    (month) => {
      expect(isValidMonth(month)).toBe(false);
    },
  );
});

describe("monthRange", () => {
  it("spans from the first of the month to the first of the next", () => {
    const { start, end } = monthRange("2026-09");

    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(8);
    expect(start.getDate()).toBe(1);
    expect(start.getHours()).toBe(0);

    expect(end.getMonth()).toBe(9);
    expect(end.getDate()).toBe(1);
  });

  it("rolls into the next year for December", () => {
    const { end } = monthRange("2026-12");
    expect(end.getFullYear()).toBe(2027);
    expect(end.getMonth()).toBe(0);
  });

  it("covers the full length of a leap February", () => {
    const { start, end } = monthRange("2024-02");
    const days = Math.round((end.getTime() - start.getTime()) / 86_400_000);
    expect(days).toBe(29);
  });
});

describe("shiftMonth", () => {
  it("moves forward and backward", () => {
    expect(shiftMonth("2026-09", 1)).toBe("2026-10");
    expect(shiftMonth("2026-09", -1)).toBe("2026-08");
  });

  it("crosses year boundaries in both directions", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
  });

  it("handles multi-year jumps", () => {
    expect(shiftMonth("2026-06", 18)).toBe("2027-12");
    expect(shiftMonth("2026-06", -18)).toBe("2024-12");
  });

  it("previousMonth is the -1 case", () => {
    expect(previousMonth("2026-01")).toBe("2025-12");
  });
});

describe("lastNMonths", () => {
  it("returns n months ending at the given month, oldest first", () => {
    expect(lastNMonths("2026-03", 4)).toEqual([
      "2025-12",
      "2026-01",
      "2026-02",
      "2026-03",
    ]);
  });

  it("returns exactly the requested count", () => {
    expect(lastNMonths("2026-09", 12)).toHaveLength(12);
  });
});

describe("toDateInputValue", () => {
  it("formats as YYYY-MM-DD in local time", () => {
    expect(toDateInputValue(new Date(2026, 8, 5))).toBe("2026-09-05");
  });
});
