"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  PiggyBank,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge, EmptyState, Progress, Skeleton } from "@/components/ui/misc";
import { CashflowChart } from "@/components/charts/cashflow-chart";
import { ExpenseBreakdownChart } from "@/components/charts/expense-breakdown-chart";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/stat-card";
import { MonthPicker } from "@/components/month-picker";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { useCurrency } from "@/components/providers";
import { useApiResource } from "@/lib/hooks/use-api-resource";
import { currentMonth } from "@/lib/date";
import {
  formatCurrency,
  formatMonthLabel,
  formatPercent,
  formatRelativeDate,
} from "@/lib/format";
import type { DashboardResponse } from "@/types/api";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [month, setMonth] = React.useState(currentMonth());
  const [addOpen, setAddOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const currency = useCurrency();

  const { data, loading, refreshing, error, refetch } =
    useApiResource<DashboardResponse>("/api/dashboard", { month });

  // A category selected in one month rarely exists in the next.
  React.useEffect(() => setSelectedCategory(null), [month]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your money in {formatMonthLabel(month)}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <MonthPicker value={month} onChange={setMonth} />
          <Button onClick={() => setAddOpen(true)}>
            <Plus />
            <span className="hidden sm:inline">Add transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </header>

      {error ? (
        <Card>
          <EmptyState
            icon={AlertTriangle}
            title="We could not load your dashboard"
            description={error}
            action={
              <Button variant="outline" onClick={() => void refetch()}>
                Try again
              </Button>
            }
          />
        </Card>
      ) : null}

      <div
        // Dim rather than blank while refreshing, so switching months does not
        // throw the reader back to a loading screen every time.
        className={cn(
          "space-y-6 transition-opacity",
          refreshing && "pointer-events-none opacity-60",
        )}
      >
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading || !data ? (
            Array.from({ length: 4 }, (_, index) => <StatCardSkeleton key={index} />)
          ) : (
            <>
              <StatCard
                label="Income"
                value={data.summary.income}
                previous={data.summary.previous.income}
                icon={TrendingUp}
                tone="success"
              />
              <StatCard
                label="Expenses"
                value={data.summary.expense}
                previous={data.summary.previous.expense}
                icon={TrendingDown}
                tone="destructive"
                invertTrend
              />
              {/* A running balance across every transaction ever recorded, not
                  the month's surplus - so it reflects any addition or deletion,
                  whichever month it lands in. */}
              <StatCard
                label="Balance"
                value={data.summary.balance}
                delta={{ amount: data.summary.net, label: "this month" }}
                icon={Wallet}
                tone={data.summary.balance >= 0 ? "success" : "destructive"}
              />
              <StatCard
                label="Budgeted"
                value={data.budgets.totals.limit}
                icon={Target}
                hint={
                  data.budgets.items.length
                    ? `${formatPercent(data.budgets.totals.progress, 0)} used`
                    : "No budgets set"
                }
              />
            </>
          )}
        </section>

        {/* The month's own result, not the running balance - "you set aside X"
            is about this month's movement. */}
        {data && data.summary.income > 0 ? (
          <SavingsRateBanner
            rate={data.summary.savingsRate}
            saved={data.summary.net}
          />
        ) : null}

        <section className="grid gap-6 xl:grid-cols-5">
          <Card className="xl:col-span-3">
            <CardHeader>
              <div>
                <CardTitle>Cash flow</CardTitle>
                <CardDescription>Last 12 months of income and spending</CardDescription>
              </div>
              <CardAction>
                <Legend />
              </CardAction>
            </CardHeader>
            <CardContent>
              {loading || !data ? (
                <Skeleton className="h-[280px] w-full" />
              ) : data.trend.some((point) => point.income || point.expense) ? (
                <CashflowChart data={data.trend} />
              ) : (
                <EmptyState
                  icon={TrendingUp}
                  title="No history yet"
                  description="Add a few transactions and your cash flow will appear here."
                />
              )}
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <div>
                <CardTitle>Where it went</CardTitle>
                <CardDescription>Spending by category this month</CardDescription>
              </div>
              {selectedCategory ? (
                <CardAction>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Clear
                  </Button>
                </CardAction>
              ) : null}
            </CardHeader>
            <CardContent>
              {loading || !data ? (
                <Skeleton className="h-52 w-full" />
              ) : data.categories.length ? (
                <ExpenseBreakdownChart
                  data={data.categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              ) : (
                <EmptyState
                  icon={PiggyBank}
                  title="No spending recorded"
                  description={`Nothing was logged as an expense in ${formatMonthLabel(month)}.`}
                />
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Budgets</CardTitle>
                <CardDescription>
                  {data?.budgets.items.length
                    ? `${data.budgets.totals.overBudgetCount} of ${data.budgets.items.length} over limit`
                    : "Set limits to stay on track"}
                </CardDescription>
              </div>
              <CardAction>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/budgets">
                    Manage
                    <ArrowRight />
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              {loading || !data ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }, (_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : data.budgets.items.length ? (
                <ul className="space-y-4">
                  {data.budgets.items.slice(0, 4).map((budget) => (
                    <li key={budget.id}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate font-medium">{budget.category}</span>
                        <span className="tabular text-muted-foreground shrink-0 text-xs">
                          {formatCurrency(budget.spent, currency)} /{" "}
                          {formatCurrency(budget.limit, currency)}
                        </span>
                      </div>
                      <Progress
                        value={budget.progress}
                        tone={
                          budget.overBudget
                            ? "destructive"
                            : budget.progress > 80
                              ? "warning"
                              : "success"
                        }
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={Target}
                  title="No budgets for this month"
                  description="Cap a category and WalletTrack will track the spend against it."
                  action={
                    <Button size="sm" asChild>
                      <Link href="/dashboard/budgets">Set a budget</Link>
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>Your latest entries</CardDescription>
              </div>
              <CardAction>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/transactions">
                    View all
                    <ArrowRight />
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="p-0">
              {loading || !data ? (
                <div className="space-y-3 p-5">
                  {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                  ))}
                </div>
              ) : data.recentTransactions.length ? (
                <ul className="divide-border divide-y">
                  {data.recentTransactions.map((transaction) => (
                    <li
                      key={transaction.id}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full",
                          transaction.type === "income"
                            ? "bg-success-muted text-success"
                            : "bg-destructive-muted text-destructive",
                        )}
                        aria-hidden
                      >
                        {transaction.type === "income" ? (
                          <TrendingUp className="size-4" />
                        ) : (
                          <TrendingDown className="size-4" />
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {transaction.category}
                        </span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {transaction.description || formatRelativeDate(transaction.date)}
                        </span>
                      </span>

                      <span
                        className={cn(
                          "tabular shrink-0 text-sm font-medium",
                          transaction.type === "income"
                            ? "text-success"
                            : "text-foreground",
                        )}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount, currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={Wallet}
                  title="Nothing recorded yet"
                  description="Add your first transaction to start tracking."
                  action={
                    <Button size="sm" onClick={() => setAddOpen(true)}>
                      <Plus />
                      Add transaction
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <TransactionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={() => void refetch()}
      />
    </div>
  );
}

function Legend() {
  return (
    <div className="text-muted-foreground flex items-center gap-3 text-xs">
      {[
        { label: "Income", className: "bg-success" },
        { label: "Expense", className: "bg-destructive" },
        { label: "Net", className: "bg-primary" },
      ].map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", item.className)} aria-hidden />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function SavingsRateBanner({ rate, saved }: { rate: number; saved: number }) {
  const currency = useCurrency();
  const positive = rate > 0;

  return (
    <Card
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 p-5",
        positive ? "bg-success-muted/40 border-success/25" : "bg-warning-muted/40 border-warning/25",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            positive ? "bg-success/15 text-success" : "bg-warning/15 text-warning",
          )}
          aria-hidden
        >
          <PiggyBank className="size-5" />
        </span>
        <div>
          <p className="text-sm font-medium">
            {positive
              ? `You kept ${formatPercent(rate)} of what you earned`
              : "You spent more than you earned this month"}
          </p>
          <p className="text-muted-foreground text-sm">
            {positive
              ? `That is ${formatCurrency(saved, currency)} set aside.`
              : `You are down ${formatCurrency(Math.abs(saved), currency)} against your income.`}
          </p>
        </div>
      </div>

      <Badge variant={positive ? "success" : "warning"}>
        {positive ? "On track" : "Overspending"}
      </Badge>
    </Card>
  );
}
