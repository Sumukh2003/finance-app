"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { currentMonth, shiftMonth } from "@/lib/date";
import { formatMonthLabel } from "@/lib/format";

/**
 * Month stepper with a native month input behind the label.
 *
 * The "next" arrow stops at the current month: a personal finance app has no
 * data for the future, and an empty screen with no explanation reads as a bug.
 */
export function MonthPicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (month: string) => void;
  className?: string;
}) {
  const atLatest = value >= currentMonth();

  return (
    <div
      className={`bg-card flex items-center gap-1 rounded-lg border border-border p-1 ${className ?? ""}`}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(shiftMonth(value, -1))}
        aria-label="Previous month"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <label className="relative flex min-w-[9.5rem] cursor-pointer items-center justify-center">
        <span className="text-sm font-medium">{formatMonthLabel(value)}</span>
        {/* The native picker is kept in the layout but visually transparent, so
            the control shows a readable label while still opening the OS
            month picker and staying reachable by keyboard. */}
        <input
          type="month"
          value={value}
          max={currentMonth()}
          onChange={(event) => {
            if (event.target.value) onChange(event.target.value);
          }}
          aria-label="Select month"
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(shiftMonth(value, 1))}
        disabled={atLatest}
        aria-label="Next month"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
