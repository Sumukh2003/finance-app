"use client";

import { MoreHorizontal, Pencil, Trash2, TrendingDown, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge, Skeleton } from "@/components/ui/misc";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrency } from "@/components/providers";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Transaction } from "@/types/api";
import { cn } from "@/lib/utils";

function TypeIcon({ type }: { type: Transaction["type"] }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full",
        type === "income"
          ? "bg-success-muted text-success"
          : "bg-destructive-muted text-destructive",
      )}
      aria-hidden
    >
      {type === "income" ? (
        <TrendingUp className="size-4" />
      ) : (
        <TrendingDown className="size-4" />
      )}
    </span>
  );
}

function Amount({ transaction }: { transaction: Transaction }) {
  const currency = useCurrency();

  return (
    <span
      className={cn(
        "tabular font-medium",
        transaction.type === "income" ? "text-success" : "text-foreground",
      )}
    >
      {transaction.type === "income" ? "+" : "-"}
      {formatCurrency(transaction.amount, currency)}
    </span>
  );
}

function RowActions({
  transaction,
  onEdit,
  onDelete,
}: {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          // Names the specific row, so a screen reader hears "Actions for
          // Groceries" instead of thirty identical "More" buttons.
          aria-label={`Actions for ${transaction.category}`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onEdit(transaction)}>
          <Pencil />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(transaction)}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TransactionList({
  transactions,
  loading,
  onEdit,
  onDelete,
}: {
  transactions: Transaction[];
  loading?: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3 p-5">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Desktop: a real table, because these rows are tabular data and
          benefit from column alignment and header semantics. */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[42%]">Transaction</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <TypeIcon type={transaction.type} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {transaction.description || transaction.category}
                      </p>
                      <p className="text-muted-foreground text-xs capitalize">
                        {transaction.type}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="neutral">{transaction.category}</Badge>
                </TableCell>

                <TableCell className="text-muted-foreground tabular whitespace-nowrap">
                  {formatDate(transaction.date)}
                </TableCell>

                <TableCell className="text-right">
                  <Amount transaction={transaction} />
                </TableCell>

                <TableCell>
                  <RowActions
                    transaction={transaction}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: stacked cards. A five-column table on a phone is either
          unreadable or forces horizontal scrolling for every row. */}
      <ul className="divide-border divide-y md:hidden">
        {transactions.map((transaction) => (
          <li key={transaction.id} className="flex items-center gap-3 px-4 py-3">
            <TypeIcon type={transaction.type} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {transaction.description || transaction.category}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {transaction.category} &middot; {formatDate(transaction.date)}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Amount transaction={transaction} />
              <RowActions
                transaction={transaction}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
