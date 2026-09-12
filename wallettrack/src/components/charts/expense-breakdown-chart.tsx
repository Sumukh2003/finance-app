"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ChartTooltip, chartColor } from "./chart-tooltip";
import { useCurrency } from "@/components/providers";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ExpenseSlice = {
  category: string;
  total: number;
  share: number;
};

/** Beyond this many slices the chart becomes unreadable; the rest are grouped. */
const MAX_SLICES = 7;

function groupTail(data: ExpenseSlice[]): ExpenseSlice[] {
  if (data.length <= MAX_SLICES) return data;

  const head = data.slice(0, MAX_SLICES - 1);
  const tail = data.slice(MAX_SLICES - 1);

  return [
    ...head,
    {
      category: `Other (${tail.length})`,
      total: tail.reduce((sum, item) => sum + item.total, 0),
      share: tail.reduce((sum, item) => sum + item.share, 0),
    },
  ];
}

export function ExpenseBreakdownChart({
  data,
  selectedCategory,
  onSelectCategory,
}: {
  data: ExpenseSlice[];
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
}) {
  const currency = useCurrency();
  const slices = React.useMemo(() => groupTail(data), [data]);
  const total = React.useMemo(
    () => slices.reduce((sum, slice) => sum + slice.total, 0),
    [slices],
  );

  const toggle = (category: string) => {
    if (!onSelectCategory) return;
    onSelectCategory(selectedCategory === category ? null : category);
  };

  return (
    // Stacked, not side-by-side. The card this sits in is a narrow column, and
    // a horizontal split leaves the legend too little room - enough that the
    // category names get truncated to nothing, which is the one part of the
    // legend that cannot be inferred from the chart.
    <div className="flex flex-col gap-5">
      <div className="relative mx-auto size-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={slices.length > 1 ? 2 : 0}
              stroke="none"
              // Animation off: the chart re-renders whenever the month changes,
              // and replaying the sweep each time reads as a loading state.
              isAnimationActive={false}
            >
              {slices.map((slice, index) => (
                <Cell
                  key={slice.category}
                  fill={chartColor(index)}
                  opacity={
                    selectedCategory && selectedCategory !== slice.category ? 0.28 : 1
                  }
                  className={onSelectCategory ? "cursor-pointer" : undefined}
                  onClick={() => toggle(slice.category)}
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip currency={currency} />} />
          </PieChart>
        </ResponsiveContainer>

        {/* The hole in a donut is wasted unless it carries the headline number. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-muted-foreground text-xs">Total spent</span>
          <span className="tabular text-lg font-semibold">
            {formatCurrency(total, currency, { compact: total >= 100_000 })}
          </span>
        </div>
      </div>

      {/* A legend that also serves as the filter control, so category names are
          readable text rather than slices the user has to hover to identify. */}
      <ul className="min-w-0 space-y-0.5">
        {slices.map((slice, index) => {
          const dimmed = Boolean(selectedCategory && selectedCategory !== slice.category);

          return (
            <li key={slice.category}>
              <button
                type="button"
                onClick={() => toggle(slice.category)}
                disabled={!onSelectCategory}
                aria-pressed={selectedCategory === slice.category}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                  onSelectCategory && "hover:bg-muted",
                  dimmed && "opacity-50",
                )}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: chartColor(index) }}
                  aria-hidden
                />
                {/* `basis-0 grow` with a floor keeps the name legible: without
                    a minimum it is the only flexible column, so it absorbs all
                    the shortfall and collapses to zero width. */}
                <span className="min-w-16 grow basis-0 truncate">{slice.category}</span>
                <span className="tabular shrink-0 font-medium">
                  {formatCurrency(slice.total, currency, { compact: slice.total >= 100_000 })}
                </span>
                <span className="tabular text-muted-foreground w-10 shrink-0 text-right text-xs">
                  {formatPercent(slice.share, 0)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
