import type { QueryFilter, Types } from "mongoose";
import type { TransactionDocument } from "@/models/Transaction";
import { Transaction } from "@/models/Transaction";
import { TRANSACTION_SORTS, type TransactionSort } from "@/lib/constants";
import type { TransactionQuery } from "@/lib/validations/transaction";
import { endOfCalendarDate } from "@/lib/date";

/**
 * Escapes regex metacharacters so a search term is matched literally.
 *
 * Without this, input such as `(a+)+$` is compiled as a pattern and evaluated
 * by the database - a catastrophic-backtracking denial of service, and a way to
 * probe documents the term should not match.
 */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type TransactionFilter = QueryFilter<TransactionDocument>;

/** Builds the Mongo filter for a validated query, always scoped to one user. */
export function buildTransactionFilter(
  userId: Types.ObjectId,
  query: Partial<TransactionQuery>,
): TransactionFilter {
  const filter: Record<string, unknown> = { userId };

  if (query.type) filter.type = query.type;
  if (query.category) filter.category = query.category;

  if (query.startDate || query.endDate) {
    const date: Record<string, Date> = {};
    if (query.startDate) date.$gte = query.startDate;
    if (query.endDate) {
      // `endDate` arrives as UTC midnight; extend to the end of that calendar
      // date so the range reads inclusively, the way someone picking two dates
      // on a calendar expects. Must be UTC: `setHours` here shifted the
      // boundary by the server's offset and silently dropped the last day.
      date.$lte = endOfCalendarDate(query.endDate);
    }
    filter.date = date;
  }

  if (query.minAmount !== undefined || query.maxAmount !== undefined) {
    const amount: Record<string, number> = {};
    if (query.minAmount !== undefined) amount.$gte = query.minAmount;
    if (query.maxAmount !== undefined) amount.$lte = query.maxAmount;
    filter.amount = amount;
  }

  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [{ category: pattern }, { description: pattern }];
  }

  return filter as TransactionFilter;
}

export function sortSpecFor(sort: TransactionSort) {
  return TRANSACTION_SORTS[sort].spec;
}

export type TransactionTotals = {
  income: number;
  expense: number;
  net: number;
  count: number;
};

/**
 * Totals across the whole filtered set, computed by the database.
 *
 * Summing the current page in the browser - as the previous version did - labels
 * one page of ten rows as the grand total, which silently understates every
 * figure the moment a user has more than a page of history.
 */
export async function getTransactionTotals(
  filter: TransactionFilter,
): Promise<TransactionTotals> {
  const [result] = await Transaction.aggregate<{
    income: number;
    expense: number;
    count: number;
  }>([
    { $match: filter },
    {
      $group: {
        _id: null,
        income: {
          $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const income = result?.income ?? 0;
  const expense = result?.expense ?? 0;

  return { income, expense, net: income - expense, count: result?.count ?? 0 };
}

export type SerializedTransaction = {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
};

type LeanTransaction = {
  _id: Types.ObjectId;
  type: "income" | "expense";
  category: string;
  description?: string | null;
  amount: number;
  date: Date;
  createdAt?: Date;
};

/** Converts a lean document into the JSON shape the client consumes. */
export function serializeTransaction(
  doc: LeanTransaction,
): SerializedTransaction {
  return {
    id: doc._id.toString(),
    type: doc.type,
    category: doc.category,
    description: doc.description ?? "",
    amount: doc.amount,
    date: doc.date.toISOString(),
    createdAt: (doc.createdAt ?? doc.date).toISOString(),
  };
}
