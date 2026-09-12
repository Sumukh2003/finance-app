"use client";

import * as React from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Receipt,
  SearchX,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/misc";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { TransactionList } from "@/components/transactions/transaction-list";
import {
  EMPTY_FILTERS,
  TransactionFilterBar,
  countActiveFilters,
  type TransactionFilters,
} from "@/components/transactions/transaction-filters";
import { useCurrency } from "@/components/providers";
import { api, buildQueryString, errorMessage } from "@/lib/api-client";
import { useApiResource } from "@/lib/hooks/use-api-resource";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { Transaction, TransactionListResponse } from "@/types/api";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

export default function TransactionsPage() {
  const currency = useCurrency();

  const [filters, setFilters] = React.useState<TransactionFilters>(EMPTY_FILTERS);
  const [page, setPage] = React.useState(1);
  const [editing, setEditing] = React.useState<Transaction | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<Transaction | null>(null);
  const [deleting, setDeleting] = React.useState(false);


  // Only the search term is debounced; dropdown changes are deliberate single
  // actions and should take effect immediately.
  const debouncedSearch = useDebouncedValue(filters.search, 350);

  const query = React.useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      type: filters.type || undefined,
      category: filters.category || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      minAmount: filters.minAmount || undefined,
      maxAmount: filters.maxAmount || undefined,
      sort: filters.sort,
    }),
    [
      page,
      debouncedSearch,
      filters.type,
      filters.category,
      filters.startDate,
      filters.endDate,
      filters.minAmount,
      filters.maxAmount,
      filters.sort,
    ],
  );

  const { data, loading, refreshing, error, refetch } =
    useApiResource<TransactionListResponse>("/api/transactions", query);

  function updateFilters(patch: Partial<TransactionFilters>) {
    setFilters((previous) => ({ ...previous, ...patch }));
    // Any filter change invalidates the current page number: page 4 of the old
    // result set is meaningless against the new one.
    setPage(1);
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(transaction: Transaction) {
    setEditing(transaction);
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);

    try {
      await api.delete(`/api/transactions/${pendingDelete.id}`);
      toast.success("Transaction deleted");
      setPendingDelete(null);

      // Deleting the only row on the last page would otherwise leave the user
      // staring at an empty page that is not the end of their data.
      const isLastRowOnPage = data?.transactions.length === 1 && page > 1;
      if (isLastRowOnPage) setPage((current) => current - 1);
      else await refetch();
    } catch (deleteError) {
      toast.error(errorMessage(deleteError));
    } finally {
      setDeleting(false);
    }
  }

  // A real link, so the browser owns the download and takes the filename from
  // Content-Disposition. Page and limit are dropped: an export covers the whole
  // filtered set, not just the page on screen.
  const exportHref = React.useMemo(() => {
    const { page: _page, limit: _limit, ...exportQuery } = query;
    void _page;
    void _limit;
    return `/api/transactions/export${buildQueryString(exportQuery)}`;
  }, [query]);

  const totals = data?.totals;
  const pagination = data?.pagination;
  const hasFilters = countActiveFilters(filters) > 0;
  const isEmpty = !loading && data?.transactions.length === 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {totals
              ? `${formatNumber(totals.count)} ${totals.count === 1 ? "entry" : "entries"} matching your filters`
              : "Every entry you have recorded."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild={Boolean(totals?.count)} disabled={!totals?.count}>
            {totals?.count ? (
              <a href={exportHref} download>
                <Download />
                <span className="hidden sm:inline">Export CSV</span>
              </a>
            ) : (
              <>
                <Download />
                <span className="hidden sm:inline">Export CSV</span>
              </>
            )}
          </Button>
          <Button onClick={openCreate}>
            <Plus />
            <span className="hidden sm:inline">Add transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </header>

      {/* Totals reflect the whole filtered set, computed server-side - not just
          the rows visible on this page. */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryTile
          label="Income"
          value={totals?.income ?? 0}
          currency={currency}
          tone="success"
          loading={loading}
        />
        <SummaryTile
          label="Expenses"
          value={totals?.expense ?? 0}
          currency={currency}
          tone="destructive"
          loading={loading}
        />
        <SummaryTile
          label="Net"
          value={totals?.net ?? 0}
          currency={currency}
          tone={(totals?.net ?? 0) >= 0 ? "success" : "destructive"}
          loading={loading}
        />
      </div>

      <TransactionFilterBar
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
      />

      <Card>
        <CardContent
          className={cn(
            "p-0 transition-opacity",
            refreshing && "pointer-events-none opacity-60",
          )}
        >
          {error ? (
            <EmptyState
              icon={AlertTriangle}
              title="We could not load your transactions"
              description={error}
              action={
                <Button variant="outline" onClick={() => void refetch()}>
                  Try again
                </Button>
              }
            />
          ) : isEmpty ? (
            hasFilters ? (
              <EmptyState
                icon={SearchX}
                title="No matches"
                description="No transactions fit these filters. Try widening the date range or clearing a filter."
                action={
                  <Button variant="outline" onClick={resetFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={Receipt}
                title="No transactions yet"
                description="Record your income and spending to see where your money goes."
                action={
                  <Button onClick={openCreate}>
                    <Plus />
                    Add your first transaction
                  </Button>
                }
              />
            )
          ) : (
            <TransactionList
              transactions={data?.transactions ?? []}
              loading={loading}
              onEdit={openEdit}
              onDelete={setPendingDelete}
            />
          )}
        </CardContent>

        {pagination && pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-3">
            <p className="text-muted-foreground text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => current + 1)}
                disabled={!pagination.hasMore}
              >
                Next
                <ChevronRight />
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={editing}
        onSaved={() => void refetch()}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this transaction?"
        description={
          pendingDelete ? (
            <>
              <span className="text-foreground font-medium">
                {pendingDelete.description || pendingDelete.category}
              </span>{" "}
              for {formatCurrency(pendingDelete.amount, currency)} will be removed. This
              cannot be undone.
            </>
          ) : null
        }
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}

function SummaryTile({
  label,
  value,
  currency,
  tone,
  loading,
}: {
  label: string;
  value: number;
  currency: Parameters<typeof formatCurrency>[1];
  tone: "success" | "destructive";
  loading?: boolean;
}) {
  return (
    <Card className="px-5 py-4">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <p
        className={cn(
          "tabular mt-1.5 text-xl font-semibold",
          loading && "text-muted-foreground/40",
          !loading && (tone === "success" ? "text-success" : "text-destructive"),
        )}
      >
        {loading ? "—" : formatCurrency(value, currency)}
      </p>
    </Card>
  );
}
