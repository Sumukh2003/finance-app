import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatMonthLabel,
  formatPercent,
  initialsOf,
  percentChange,
} from "./format";

describe("formatCurrency", () => {
  it("hides decimals for whole amounts and shows them otherwise", () => {
    expect(formatCurrency(1200, "INR")).not.toContain(".");
    expect(formatCurrency(1875.25, "INR")).toContain("1,875.25");
  });

  it("respects the requested currency", () => {
    expect(formatCurrency(10, "USD")).toContain("$");
    expect(formatCurrency(10, "GBP")).toContain("£");
  });

  it("falls back to zero for non-finite input rather than printing NaN", () => {
    expect(formatCurrency(Number.NaN, "INR")).toContain("0");
    expect(formatCurrency(Number.POSITIVE_INFINITY, "INR")).toContain("0");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-500, "INR")).toContain("500");
  });
});

describe("formatPercent", () => {
  it("trims a trailing .0", () => {
    expect(formatPercent(50)).toBe("50%");
    expect(formatPercent(33.333)).toBe("33.3%");
  });

  it("returns 0% for non-finite input", () => {
    expect(formatPercent(Number.NaN)).toBe("0%");
  });
});

describe("percentChange", () => {
  it("computes the change between two periods", () => {
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(50, 100)).toBe(-50);
  });

  it("returns null when there is no baseline", () => {
    // "Up from zero" has no meaningful percentage, and rendering 0 would
    // wrongly suggest nothing changed.
    expect(percentChange(100, 0)).toBeNull();
  });

  it("uses the magnitude of the baseline so a negative baseline keeps its sign", () => {
    expect(percentChange(-50, -100)).toBe(50);
  });
});

describe("formatMonthLabel", () => {
  it("expands YYYY-MM into a readable label", () => {
    expect(formatMonthLabel("2026-09")).toBe("September 2026");
  });

  it("returns the input unchanged when it is not a month key", () => {
    expect(formatMonthLabel("not-a-month")).toBe("not-a-month");
  });
});

describe("initialsOf", () => {
  it("takes the first and last initials", () => {
    expect(initialsOf("Ada Lovelace")).toBe("AL");
    expect(initialsOf("Grace Brewster Hopper")).toBe("GH");
  });

  it("uses the first two letters of a single name", () => {
    expect(initialsOf("Ada")).toBe("AD");
  });

  it("does not throw on empty or whitespace-only input", () => {
    expect(initialsOf("")).toBe("?");
    expect(initialsOf("   ")).toBe("?");
  });
});
