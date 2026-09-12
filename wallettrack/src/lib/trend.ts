export type TrendDirection = "up" | "down" | "flat" | "none";

export type Trend = {
  direction: TrendDirection;
  /**
   * Whether the movement is good news, or `null` when there is nothing to
   * judge — no baseline to compare against, or no movement worth colouring.
   */
  improving: boolean | null;
};

export type DescribeTrendOptions = {
  /** When true, a rise is bad news: spending more is not an improvement. */
  invertTrend?: boolean;
  /**
   * Movements smaller than this read as flat. Percentages round to one decimal
   * on screen, so anything under 0.05 displays as "0%"; currency amounts need a
   * finer threshold because they are shown to the cent.
   */
  epsilon?: number;
};

/**
 * Turns a raw change into the direction to point an arrow and whether to colour
 * it as good news.
 *
 * Direction and sentiment are separate on purpose: for spending, the arrow
 * still points up when the number rose, but the colour says that is bad.
 *
 * "No movement" is neither good nor bad. Deciding it with `change > 0` makes
 * an unchanged figure fall into the "bad news" branch and render a neutral
 * dash in red.
 */
export function describeTrend(
  change: number | null,
  { invertTrend = false, epsilon = 0.05 }: DescribeTrendOptions = {},
): Trend {
  if (change === null || !Number.isFinite(change)) {
    return { direction: "none", improving: null };
  }

  if (Math.abs(change) < epsilon) {
    return { direction: "flat", improving: null };
  }

  const rose = change > 0;

  return {
    direction: rose ? "up" : "down",
    improving: invertTrend ? !rose : rose,
  };
}
