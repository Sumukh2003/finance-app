"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip } from "./chart-tooltip";
import { useCurrency } from "@/components/providers";
import { formatCurrency, formatMonthLabel, formatMonthShort } from "@/lib/format";

export type CashflowPoint = {
  month: string;
  income: number;
  expense: number;
  net: number;
};

/**
 * Twelve months of income against expense.
 *
 * Income and expense are filled areas because their magnitude is the point;
 * net is a line on top because its *direction* is what matters and a third
 * filled band would be unreadable.
 */
export function CashflowChart({ data }: { data: CashflowPoint[] }) {
  const currency = useCurrency();

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="income-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--success)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--success)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="expense-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--destructive)" stopOpacity={0.24} />
            <stop offset="100%" stopColor="var(--destructive)" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Horizontal rules only: vertical lines add clutter without helping
            anyone read a value off the chart. */}
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />

        <XAxis
          dataKey="month"
          tickFormatter={formatMonthShort}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          // Thin the labels on narrow screens rather than letting them overlap.
          interval="preserveStartEnd"
          minTickGap={16}
        />

        <YAxis
          tickFormatter={(value: number) =>
            formatCurrency(value, currency, { compact: true, showDecimals: false })
          }
          tickLine={false}
          axisLine={false}
          width={64}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />

        <Tooltip
          content={<ChartTooltip currency={currency} labelFormatter={formatMonthLabel} />}
          cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
        />

        <Area
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="var(--success)"
          strokeWidth={2}
          fill="url(#income-fill)"
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="expense"
          name="Expense"
          stroke="var(--destructive)"
          strokeWidth={2}
          fill="url(#expense-fill)"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="net"
          name="Net"
          stroke="var(--primary)"
          strokeWidth={2}
          strokeDasharray="4 3"
          dot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
