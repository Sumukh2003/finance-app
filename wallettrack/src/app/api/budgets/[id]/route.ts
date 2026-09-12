import { connectDB } from "@/lib/db";
import { Budget } from "@/models/Budget";
import { ApiError } from "@/lib/api/errors";
import { ok, parseJsonBody, route } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guard";
import { objectIdSchema } from "@/lib/validations/common";
import { updateBudgetSchema } from "@/lib/validations/budget";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

async function resolveId(context: Context): Promise<string> {
  const { id } = await context.params;
  const parsed = objectIdSchema.safeParse(id);

  if (!parsed.success) throw ApiError.notFound("Budget not found.");

  return parsed.data;
}

export const PATCH = route(async (request, context: Context) => {
  const user = await requireUser();
  const id = await resolveId(context);
  const updates = await parseJsonBody(request, updateBudgetSchema);

  await connectDB();

  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId: user.objectId },
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();

    if (!budget) throw ApiError.notFound("Budget not found.");

    return ok({
      budget: {
        id: budget._id.toString(),
        category: budget.category,
        limit: budget.limit,
        month: budget.month,
      },
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw ApiError.conflict(
        "Another budget already covers that category this month.",
      );
    }
    throw error;
  }
});

export const DELETE = route(async (_request, context: Context) => {
  const user = await requireUser();
  const id = await resolveId(context);

  await connectDB();

  const deleted = await Budget.findOneAndDelete({
    _id: id,
    userId: user.objectId,
  }).lean();

  if (!deleted) throw ApiError.notFound("Budget not found.");

  return ok({ deleted: true, id });
});
