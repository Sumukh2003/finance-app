import { describe, expect, it } from "vitest";
import { describeTrend } from "./trend";

describe("describeTrend", () => {
  it("reads a rise as good news by default", () => {
    expect(describeTrend(12.5)).toEqual({ direction: "up", improving: true });
  });

  it("reads a fall as bad news by default", () => {
    expect(describeTrend(-12.5)).toEqual({ direction: "down", improving: false });
  });

  describe("inverted metrics", () => {
    // Spending more is not an improvement, but the arrow must still point up.
    it("keeps the arrow pointing up while marking the rise as bad", () => {
      expect(describeTrend(12.5, { invertTrend: true })).toEqual({
        direction: "up",
        improving: false,
      });
    });

    it("treats a fall as good news", () => {
      expect(describeTrend(-12.5, { invertTrend: true })).toEqual({
        direction: "down",
        improving: true,
      });
    });
  });

  describe("no movement", () => {
    // Regression: deciding sentiment with `change > 0` put an unchanged figure
    // in the "bad news" branch, rendering a neutral dash in the error colour.
    it("is neither good nor bad at exactly zero", () => {
      expect(describeTrend(0)).toEqual({ direction: "flat", improving: null });
    });

    it("is neither good nor bad at exactly zero when inverted", () => {
      expect(describeTrend(0, { invertTrend: true })).toEqual({
        direction: "flat",
        improving: null,
      });
    });

    it("treats a movement too small to display as flat", () => {
      expect(describeTrend(0.04).direction).toBe("flat");
      expect(describeTrend(-0.04).direction).toBe("flat");
    });

    it("respects a finer threshold for currency amounts", () => {
      // 0.04 of a rupee rounds away on screen; 0.04 as a percentage does not.
      expect(describeTrend(0.04, { epsilon: 0.005 }).direction).toBe("up");
      expect(describeTrend(0.004, { epsilon: 0.005 }).direction).toBe("flat");
    });
  });

  describe("no baseline", () => {
    it("returns 'none' when there is nothing to compare against", () => {
      expect(describeTrend(null)).toEqual({ direction: "none", improving: null });
    });

    it("does not colour a non-finite change", () => {
      // `percentChange` guards against a zero baseline, but a NaN reaching here
      // must not be rendered as a confident arrow.
      expect(describeTrend(Number.NaN)).toEqual({ direction: "none", improving: null });
      expect(describeTrend(Number.POSITIVE_INFINITY).direction).toBe("none");
    });
  });
});
