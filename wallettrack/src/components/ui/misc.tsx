import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- Badge -- */

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        neutral: "border-border bg-muted text-muted-foreground",
        success: "border-transparent bg-success-muted text-success",
        destructive: "border-transparent bg-destructive-muted text-destructive",
        warning: "border-transparent bg-warning-muted text-warning",
        info: "border-transparent bg-info-muted text-info",
        outline: "border-border text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

/* ------------------------------------------------------------- Progress -- */

type ProgressProps = Omit<
  React.ComponentProps<typeof ProgressPrimitive.Root>,
  "value"
> & {
  /** Percentage complete. Values above 100 render as a full, overflowing bar. */
  value: number;
  tone?: "default" | "success" | "warning" | "destructive";
};

const PROGRESS_TONES: Record<NonNullable<ProgressProps["tone"]>, string> = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

function Progress({ className, value, tone = "default", ...props }: ProgressProps) {
  const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
  // The bar caps at 100% while the underlying value keeps its true magnitude,
  // so an overspent budget still reports 137% in text without overflowing.
  const width = Math.min(safeValue, 100);

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={width}
      className={cn("bg-muted relative h-2 w-full overflow-hidden rounded-full", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full rounded-full transition-[width] duration-500", PROGRESS_TONES[tone])}
        style={{ width: `${width}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

/* ------------------------------------------------------------ Separator -- */

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------- Skeleton -- */

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      // Marked as a live region busy indicator so a screen reader announces
      // "loading" rather than silently reading nothing.
      role="status"
      aria-label="Loading"
      className={cn("bg-muted animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

/* ----------------------------------------------------------- EmptyState -- */

type EmptyStateProps = {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

/**
 * The "nothing here yet" state.
 *
 * Always says what the user can do next - an empty screen with no route
 * forward is a dead end, not a design.
 */
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="bg-muted text-muted-foreground mb-4 flex size-12 items-center justify-center rounded-full">
          <Icon className="size-5" />
        </div>
      ) : null}

      <p className="text-foreground font-medium">{title}</p>

      {description ? (
        <p className="text-muted-foreground mt-1.5 max-w-sm text-sm text-pretty">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export { Badge, badgeVariants, Progress, Separator, Skeleton, EmptyState };
