"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/misc";
import { useCurrency } from "@/components/providers";
import { formatCurrency, formatPercent, percentChange } from "@/lib/format";
import { describeTrend } from "@/lib/trend";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "destructive";

const VALUE_TONE: Record<Tone, string> = {
  default: "text-foreground",
  success: "text-success",
  destructive: "text-destructive",
};

export function StatCard({
  label,
  value,
  previous,
  delta,
  icon: Icon,
  tone = "default",
  /** When true, a rise is bad news - spending more is not an improvement. */
  invertTrend = false,
  hint,
  action,
}: {
  label: string;
  value: number;
  previous?: number;
  /**
   * An absolute movement to show instead of a percentage.
   *
   * A running balance is better described by "+12,400 this month" than by a
   * percentage of last month's balance, which says nothing about the amount.
   */
  delta?: { amount: number; label: string };
  icon?: React.ComponentType<{ className?: string }>;
  tone?: Tone;
  invertTrend?: boolean;
  hint?: string;
  action?: React.ReactNode;
}) {
  const currency = useCurrency();
  const change =
    delta !== undefined
      ? delta.amount
      : previous === undefined
        ? null
        : percentChange(value, previous);

  // The arrow shows direction, the colour shows whether that direction is
  // welcome. Currency deltas are shown to the cent, so they need a finer
  // "counts as flat" threshold than percentages.
  const { direction, improving } = describeTrend(change, {
    invertTrend,
    epsilon: delta ? 0.005 : 0.05,
  });

  const TrendIcon =
    direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {label}
        </p>
        {Icon ? (
          <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden />
        ) : null}
      </div>

      <p className={cn("tabular mt-3 text-2xl font-semibold", VALUE_TONE[tone])}>
        {formatCurrency(value, currency)}
      </p>

      <div className="mt-2 flex min-h-5 items-center gap-1.5 text-xs">
        {direction !== "none" && change !== null ? (
          <>
            <span
              className={cn(
                "flex items-center gap-0.5 font-medium",
                improving === null
                  ? "text-muted-foreground"
                  : improving
                    ? "text-success"
                    : "text-destructive",
              )}
            >
              <TrendIcon className="size-3.5" aria-hidden />
              {delta
                ? formatCurrency(Math.abs(change), currency)
                : formatPercent(Math.abs(change))}
            </span>
            <span className="text-muted-foreground">
              {delta ? delta.label : "vs last month"}
            </span>
          </>
        ) : hint ? (
          <span className="text-muted-foreground">{hint}</span>
        ) : null}

        {action ? <div className="ml-auto">{action}</div> : null}
      </div>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-7 w-32" />
      <Skeleton className="mt-3 h-3 w-28" />
    </Card>
  );
}
