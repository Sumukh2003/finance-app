"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge, EmptyState, Progress, Skeleton } from "@/components/ui/misc";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { BudgetDialog } from "@/components/budgets/budget-dialog";
import { MonthPicker } from "@/components/month-picker";
import { useCurrency } from "@/components/providers";
import { api, errorMessage } from "@/lib/api-client";
import { useApiResource } from "@/lib/hooks/use-api-resource";
import { currentMonth } from "@/lib/date";
import { formatCurrency, formatMonthLabel, formatPercent } from "@/lib/format";
import type { BudgetSummary, BudgetSummaryItem } from "@/types/api";
import { cn } from "@/lib/utils";

type Filter = "all" | "over" | "under";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "under", label: "On track" },
  { value: "over", label: "Over limit" },
];

/** Warn before the limit is breached, not after - by then it is too late to act. */
const WARNING_THRESHOLD = 80;

function toneFor(budget: BudgetSummaryItem) {
  if (budget.overBudget) return "destructive" as const;
  if (budget.progress >= WARNING_THRESHOLD) return "warning" as const;
  return "success" as const;
}

export default function BudgetsPage() {
  const currency = useCurrency();
  const [month, setMonth] = React.useState(currentMonth());
  const [filter, setFilter] = React.useState<Filter>("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BudgetSummaryItem | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<BudgetSummaryItem | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const { data, loading, refreshing, error, refetch } = useApiResource<BudgetSummary>(
    "/api/budgets",
    { month },
  );

  const items = data?.items ?? [];
  const totals = data?.totals;

  const visible = items.filter((item) => {
    if (filter === "over") return item.overBudget;
    if (filter === "under") return !item.overBudget;
    return true;
  });

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(budget: BudgetSummaryItem) {
    setEditing(budget);
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);

    try {
      await api.delete(`/api/budgets/${pendingDelete.id}`);
      toast.success("Budget removed");
      setPendingDelete(null);
      await refetch();
    } catch (deleteError) {
      toast.error(errorMessage(deleteError));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Spending limits for {formatMonthLabel(month)}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <MonthPicker value={month} onChange={setMonth} />
          <Button onClick={openCreate}>
            <Plus />
            <span className="hidden sm:inline">New budget</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </header>

      {totals && items.length > 0 ? (
        <Card className="p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Total budgeted
              </p>
              <p className="tabular mt-1.5 text-2xl font-semibold">
                {formatCurrency(totals.spent, currency)}
                <span className="text-muted-foreground text-base font-normal">
                  {" / "}
                  {formatCurrency(totals.limit, currency)}
                </span>
              </p>
            </div>

            <div className="text-right">
              <p className="text-muted-foreground text-sm">
                {totals.remaining >= 0 ? "Remaining" : "Over by"}
              </p>
              <p
                className={cn(
                  "tabular text-lg font-semibold",
                  totals.remaining >= 0 ? "text-success" : "text-destructive",
                )}
              >
                {formatCurrency(Math.abs(totals.remaining), currency)}
              </p>
            </div>
          </div>

          <Progress
            value={totals.progress}
            tone={
              totals.spent > totals.limit
                ? "destructive"
                : totals.progress >= WARNING_THRESHOLD
                  ? "warning"
                  : "success"
            }
            className="mt-4 h-2.5"
          />

          <p className="text-muted-foreground mt-2 text-xs">
            {formatPercent(totals.progress, 0)} of your total budget used
            {totals.overBudgetCount > 0
              ? ` · ${totals.overBudgetCount} ${totals.overBudgetCount === 1 ? "category is" : "categories are"} over limit`
              : ""}
          </p>
        </Card>
      ) : null}

      {items.length > 0 ? (
        <div
          className="bg-muted inline-flex gap-1 rounded-lg p-1"
          role="tablist"
          aria-label="Filter budgets"
        >
          {FILTERS.map((option) => (
            <button
              key={option.value}
              role="tab"
              aria-selected={filter === option.value}
              onClick={() => setFilter(option.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === option.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className={cn(
          "transition-opacity",
          refreshing && "pointer-events-none opacity-60",
        )}
      >
        {error ? (
          <Card>
            <EmptyState
              icon={AlertTriangle}
              title="We could not load your budgets"
              description={error}
              action={
                <Button variant="outline" onClick={() => void refetch()}>
                  Try again
                </Button>
              }
            />
          </Card>
        ) : loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-40 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card>
            <EmptyState
              icon={Target}
              title={`No budgets for ${formatMonthLabel(month)}`}
              description="Set a limit on a category and WalletTrack will track your spending against it as you record transactions."
              action={
                <Button onClick={openCreate}>
                  <Plus />
                  Create your first budget
                </Button>
              }
            />
          </Card>
        ) : visible.length === 0 ? (
          <Card>
            <EmptyState
              icon={CheckCircle2}
              title={filter === "over" ? "Nothing is over budget" : "Everything is over budget"}
              description={
                filter === "over"
                  ? "Every category is still within its limit this month."
                  : "No category is currently within its limit."
              }
              action={
                <Button variant="outline" onClick={() => setFilter("all")}>
                  Show all budgets
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={openEdit}
                onDelete={setPendingDelete}
              />
            ))}
          </div>
        )}
      </div>

      <BudgetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        month={month}
        budget={editing}
        usedCategories={items.map((item) => item.category)}
        onSaved={() => void refetch()}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove this budget?"
        description={
          pendingDelete ? (
            <>
              The {formatCurrency(pendingDelete.limit, currency)} limit on{" "}
              <span className="text-foreground font-medium">{pendingDelete.category}</span>{" "}
              will be removed. Your transactions are not affected.
            </>
          ) : null
        }
        confirmLabel="Remove budget"
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}

function BudgetCard({
  budget,
  onEdit,
  onDelete,
}: {
  budget: BudgetSummaryItem;
  onEdit: (budget: BudgetSummaryItem) => void;
  onDelete: (budget: BudgetSummaryItem) => void;
}) {
  const currency = useCurrency();
  const tone = toneFor(budget);

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-medium">{budget.category}</h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {formatCurrency(budget.limit, currency)} limit
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Badge
              variant={
                tone === "destructive" ? "destructive" : tone === "warning" ? "warning" : "success"
              }
            >
              {budget.overBudget
                ? "Over"
                : budget.progress >= WARNING_THRESHOLD
                  ? "Close"
                  : "On track"}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for the ${budget.category} budget`}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit(budget)}>
                  <Pencil />
                  Edit limit
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(budget)}>
                  <Trash2 />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="tabular text-xl font-semibold">
              {formatCurrency(budget.spent, currency)}
            </span>
            <span
              className={cn(
                "tabular text-sm font-medium",
                tone === "destructive" ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {formatPercent(budget.progress, 0)}
            </span>
          </div>

          <Progress value={budget.progress} tone={tone} />

          <p className="text-muted-foreground text-xs">
            {budget.remaining >= 0
              ? `${formatCurrency(budget.remaining, currency)} left to spend`
              : `${formatCurrency(Math.abs(budget.remaining), currency)} over the limit`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
