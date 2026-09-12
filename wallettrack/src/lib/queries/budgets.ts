import type { Types } from "mongoose";
import { Budget } from "@/models/Budget";
import { Transaction } from "@/models/Transaction";
import { monthRange } from "@/lib/date";

export type BudgetSummaryItem = {
  id: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  /** Share of the limit used, as a percentage. Uncapped, so overspend is visible. */
  progress: number;
  overBudget: boolean;
};

export type BudgetSummary = {
  month: string;
  items: BudgetSummaryItem[];
  totals: {
    limit: number;
    spent: number;
    remaining: number;
    progress: number;
    overBudgetCount: number;
  };
};

/**
 * Spend per category for one month.
 *
 * `userId` must be an ObjectId. Aggregation pipelines do not cast values the
 * way `Model.find()` does, so matching on the raw string from the session
 * silently returns zero documents - which is exactly how every figure on this
 * screen used to come back as 0.
 */
export async function getCategorySpend(
  userId: Types.ObjectId,
  month: string,
): Promise<Map<string, number>> {
  const { start, end } = monthRange(month);

  const rows = await Transaction.aggregate<{ _id: string; spent: number }>([
    {
      $match: {
        userId,
        type: "expense",
        date: { $gte: start, $lt: end },
      },
    },
    { $group: { _id: "$category", spent: { $sum: "$amount" } } },
  ]);

  return new Map(rows.map((row) => [row._id, row.spent]));
}

export async function getBudgetSummary(
  userId: Types.ObjectId,
  month: string,
): Promise<BudgetSummary> {
  const [budgets, spendByCategory] = await Promise.all([
    Budget.find({ userId, month }).sort({ category: 1 }).lean(),
    getCategorySpend(userId, month),
  ]);

  const items: BudgetSummaryItem[] = budgets.map((budget) => {
    const spent = spendByCategory.get(budget.category) ?? 0;

    return {
      id: budget._id.toString(),
      category: budget.category,
      limit: budget.limit,
      spent,
      remaining: budget.limit - spent,
      progress: budget.limit > 0 ? (spent / budget.limit) * 100 : 0,
      overBudget: spent > budget.limit,
    };
  });

  const limit = items.reduce((sum, item) => sum + item.limit, 0);
  const spent = items.reduce((sum, item) => sum + item.spent, 0);

  return {
    month,
    items,
    totals: {
      limit,
      spent,
      remaining: limit - spent,
      progress: limit > 0 ? (spent / limit) * 100 : 0,
      overBudgetCount: items.filter((item) => item.overBudget).length,
    },
  };
}
