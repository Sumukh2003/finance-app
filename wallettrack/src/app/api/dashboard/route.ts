import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { ok, parseSearchParams, route } from "@/lib/api/response";
import { requireUser, type AuthenticatedUser } from "@/lib/auth/guard";
import { getBudgetSummary } from "@/lib/queries/budgets";
import { serializeTransaction } from "@/lib/queries/transactions";
import { currentMonth, lastNMonths, monthRange, previousMonth } from "@/lib/date";
import { dashboardQuerySchema } from "@/lib/validations/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TREND_MONTHS = 12;
const RECENT_LIMIT = 6;

type Totals = { income: number; expense: number };

/**
 * Income and expense totals over an arbitrary date window.
 *
 * The window is a Mongo date predicate, so the same aggregation serves both
 * "this month" and "everything up to this point".
 */
async function sumTransactions(
  user: AuthenticatedUser,
  date: Record<string, Date>,
): Promise<Totals> {
  const [result] = await Transaction.aggregate<Totals>([
    { $match: { userId: user.objectId, date } },
    {
      $group: {
        _id: null,
        income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
        expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
      },
    },
  ]);

  return { income: result?.income ?? 0, expense: result?.expense ?? 0 };
}

/** Income and expense totals for a single month. */
function totalsForMonth(user: AuthenticatedUser, month: string): Promise<Totals> {
  const { start, end } = monthRange(month);
  return sumTransactions(user, { $gte: start, $lt: end });
}

export const GET = route(async (request) => {
  const user = await requireUser();
  const { month = currentMonth() } = parseSearchParams(
    request,
    dashboardQuerySchema,
  );

  await connectDB();

  const { start, end } = monthRange(month);
  const trendMonths = lastNMonths(month, TREND_MONTHS);
  const trendStart = monthRange(trendMonths[0]!).start;

  const [current, previous, opening, categoryRows, trendRows, budgets, recent] =
    await Promise.all([
      totalsForMonth(user, month),
      totalsForMonth(user, previousMonth(month)),

      // Everything recorded before this month started. This is what makes the
      // balance a running total rather than a monthly figure that resets: it
      // carries forward every transaction the user has ever recorded, so any
      // addition or deletion - in any month - moves it.
      sumTransactions(user, { $lt: start }),

      // Expense split by category for the selected month.
      Transaction.aggregate<{ _id: string; total: number; count: number }>([
        {
          $match: {
            userId: user.objectId,
            type: "expense",
            date: { $gte: start, $lt: end },
          },
        },
        {
          $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } },
        },
        { $sort: { total: -1 } },
      ]),

      // Trend, bounded to the last 12 months. The previous implementation
      // scanned every transaction the user had ever recorded, so the query grew
      // without limit as history accumulated.
      Transaction.aggregate<{ _id: string; income: number; expense: number }>([
        {
          $match: {
            userId: user.objectId,
            date: { $gte: trendStart, $lt: end },
          },
        },
        {
          $group: {
            // Explicitly UTC, matching how dates are stored and how monthRange slices
            // them. Left implicit, this silently disagreed with the month summary.
            _id: { $dateToString: { format: "%Y-%m", date: "$date", timezone: "UTC" } },
            income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
            expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
          },
        },
      ]),

      getBudgetSummary(user.objectId, month),

      Transaction.find({ userId: user.objectId })
        .sort({ date: -1, _id: -1 })
        .limit(RECENT_LIMIT)
        .lean(),
    ]);

  // Months with no activity are absent from the aggregation. Filling them with
  // zeros keeps the x-axis continuous instead of collapsing empty months.
  const trendByMonth = new Map(trendRows.map((row) => [row._id, row]));
  const trend = trendMonths.map((key) => ({
    month: key,
    income: trendByMonth.get(key)?.income ?? 0,
    expense: trendByMonth.get(key)?.expense ?? 0,
    net: (trendByMonth.get(key)?.income ?? 0) - (trendByMonth.get(key)?.expense ?? 0),
  }));

  // What the month itself did: money in minus money out, this month only.
  const net = current.income - current.expense;

  // What the user actually holds. `openingBalance` is everything up to the
  // start of the month, so the running balance is the opening figure plus the
  // month's movement - no extra query, and the two can never disagree.
  const openingBalance = opening.income - opening.expense;
  const balance = openingBalance + net;

  const totalExpense = current.expense;

  return ok({
    month,
    summary: {
      income: current.income,
      expense: current.expense,
      net,
      balance,
      openingBalance,
      // Savings rate is a property of the month, so it uses the month's net -
      // measuring it against a lifetime balance would be meaningless.
      savingsRate: current.income > 0 ? (net / current.income) * 100 : 0,
      previous: {
        income: previous.income,
        expense: previous.expense,
        net: previous.income - previous.expense,
      },
    },
    categories: categoryRows.map((row) => ({
      category: row._id,
      total: row.total,
      count: row.count,
      share: totalExpense > 0 ? (row.total / totalExpense) * 100 : 0,
    })),
    trend,
    budgets,
    recentTransactions: recent.map(serializeTransaction),
  });
});
