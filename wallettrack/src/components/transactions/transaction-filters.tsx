"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/misc";
import { ALL_CATEGORIES, TRANSACTION_SORTS, type TransactionSort } from "@/lib/constants";
import { toDateInputValue } from "@/lib/date";

export type TransactionFilters = {
  search: string;
  type: "" | "income" | "expense";
  category: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  sort: TransactionSort;
};

export const EMPTY_FILTERS: TransactionFilters = {
  search: "",
  type: "",
  category: "",
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
  sort: "-date",
};

/** Sort is a view preference, not a filter, so it does not count as "active". */
export function countActiveFilters(filters: TransactionFilters): number {
  return (
    [
      filters.type,
      filters.category,
      filters.startDate,
      filters.endDate,
      filters.minAmount,
      filters.maxAmount,
    ].filter(Boolean).length + (filters.search ? 1 : 0)
  );
}

const ANY = "__any__";

export function TransactionFilterBar({
  filters,
  onChange,
  onReset,
}: {
  filters: TransactionFilters;
  onChange: (patch: Partial<TransactionFilters>) => void;
  onReset: () => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const activeCount = countActiveFilters(filters);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Full width on its own row below `sm`: sharing a wrapped row with the
            two dropdowns squeezes the search box down to just its icon. */}
        <div className="relative min-w-0 basis-full sm:flex-1 sm:basis-auto sm:max-w-xs">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            type="search"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Search category or note"
            aria-label="Search transactions"
            className="pl-9"
          />
        </div>

        <Select
          value={filters.type || ANY}
          onValueChange={(value) =>
            onChange({ type: value === ANY ? "" : (value as "income" | "expense") })
          }
        >
          <SelectTrigger className="w-32" aria-label="Filter by type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sort}
          onValueChange={(value) => onChange({ sort: value as TransactionSort })}
        >
          <SelectTrigger className="w-40" aria-label="Sort transactions">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TRANSACTION_SORTS).map(([value, option]) => (
              <SelectItem key={value} value={value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={expanded ? "secondary" : "outline"}
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          aria-controls="advanced-filters"
        >
          <SlidersHorizontal />
          Filters
          {activeCount > 0 ? (
            <Badge variant="default" className="ml-0.5 px-1.5">
              {activeCount}
            </Badge>
          ) : null}
        </Button>

        {activeCount > 0 ? (
          <Button variant="ghost" onClick={onReset}>
            <X />
            Clear
          </Button>
        ) : null}
      </div>

      {expanded ? (
        <div
          id="advanced-filters"
          className="bg-muted/40 grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Field label="Category">
            {(ids) => (
              <Select
                value={filters.category || ANY}
                onValueChange={(value) =>
                  onChange({ category: value === ANY ? "" : value })
                }
              >
                <SelectTrigger id={ids.id}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>All categories</SelectItem>
                  {ALL_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>

          <Field label="From">
            {(ids) => (
              <Input
                {...ids}
                type="date"
                value={filters.startDate}
                max={filters.endDate || toDateInputValue()}
                onChange={(event) => onChange({ startDate: event.target.value })}
              />
            )}
          </Field>

          <Field label="To">
            {(ids) => (
              <Input
                {...ids}
                type="date"
                value={filters.endDate}
                min={filters.startDate || undefined}
                max={toDateInputValue()}
                onChange={(event) => onChange({ endDate: event.target.value })}
              />
            )}
          </Field>

          <Field label="Amount range">
            {(ids) => (
              <div className="flex items-center gap-2">
                <Input
                  {...ids}
                  type="number"
                  min="0"
                  inputMode="decimal"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={(event) => onChange({ minAmount: event.target.value })}
                  className="tabular"
                />
                <span className="text-muted-foreground text-sm" aria-hidden>
                  to
                </span>
                <Input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  placeholder="Max"
                  aria-label="Maximum amount"
                  value={filters.maxAmount}
                  onChange={(event) => onChange({ maxAmount: event.target.value })}
                  className="tabular"
                />
              </div>
            )}
          </Field>
        </div>
      ) : null}
    </div>
  );
}
