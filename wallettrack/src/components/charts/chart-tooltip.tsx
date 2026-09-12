"use client";

import { formatCurrency, type CurrencyCode } from "@/lib/format";

/**
 * Recharts payload entry. Typed locally because the library's own generics do
 * not narrow usefully once `dataKey` is dynamic.
 */
export type TooltipEntry = {
  name?: string;
  dataKey?: string | number;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
};

export type ChartTooltipProps = {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  currency: CurrencyCode;
  /** Overrides the heading; defaults to the axis label. */
  labelFormatter?: (label: string) => string;
};

/**
 * Shared tooltip surface.
 *
 * Recharts' default tooltip is styled inline in white and is unreadable in dark
 * mode; this one uses the same tokens as the rest of the app.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  currency,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-popover text-popover-foreground rounded-lg border border-border px-3 py-2 shadow-lg">
      {label ? (
        <p className="mb-1.5 text-xs font-medium">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      ) : null}

      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div
            key={`${entry.dataKey ?? entry.name ?? index}`}
            className="flex items-center gap-2 text-xs"
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="tabular ml-auto font-medium">
              {formatCurrency(Number(entry.value ?? 0), currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The categorical palette, as CSS variables so both themes stay in sync. */
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
] as const;

export function chartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]!;
}
