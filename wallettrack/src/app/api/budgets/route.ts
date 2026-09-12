import { connectDB } from "@/lib/db";
import { Budget } from "@/models/Budget";
import { ApiError } from "@/lib/api/errors";
import {
  created,
  ok,
  parseJsonBody,
  parseSearchParams,
  route,
} from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guard";
import { getBudgetSummary } from "@/lib/queries/budgets";
import { budgetQuerySchema, createBudgetSchema } from "@/lib/validations/budget";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lists budgets for a month, already joined with the spend they are tracking.
 *
 * The previous API returned budgets and spend from two separate endpoints,
 * leaving the client to reconcile them; one call keeps the two consistent.
 */
export const GET = route(async (request) => {
  const user = await requireUser();
  const { month } = parseSearchParams(request, budgetQuerySchema);

  await connectDB();

  if (!month) {
    const budgets = await Budget.find({ userId: user.objectId })
      .sort({ month: -1, category: 1 })
      .lean();

    return ok({
      budgets: budgets.map((budget) => ({
        id: budget._id.toString(),
        category: budget.category,
        limit: budget.limit,
        month: budget.month,
      })),
    });
  }

  return ok(await getBudgetSummary(user.objectId, month));
});

export const POST = route(async (request) => {
  const user = await requireUser();
  const input = await parseJsonBody(request, createBudgetSchema);

  await connectDB();

  try {
    const budget = await Budget.create({ ...input, userId: user.objectId });

    return created({
      budget: {
        id: budget._id.toString(),
        category: budget.category,
        limit: budget.limit,
        month: budget.month,
      },
    });
  } catch (error) {
    // The unique index on (userId, month, category) is the source of truth. A
    // read-then-write check would let two concurrent requests both pass.
    if ((error as { code?: number }).code === 11000) {
      throw ApiError.conflict(
        `A budget for "${input.category}" already exists this month. Edit it instead.`,
      );
    }
    throw error;
  }
});
