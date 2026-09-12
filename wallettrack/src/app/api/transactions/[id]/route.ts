import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { ApiError } from "@/lib/api/errors";
import { ok, parseJsonBody, route } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guard";
import { serializeTransaction } from "@/lib/queries/transactions";
import { objectIdSchema } from "@/lib/validations/common";
import { updateTransactionSchema } from "@/lib/validations/transaction";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

async function resolveId(context: Context): Promise<string> {
  const { id } = await context.params;
  const parsed = objectIdSchema.safeParse(id);

  if (!parsed.success) {
    // A malformed id is a 404 rather than a 400: to the caller, "not a real id"
    // and "not your record" are the same outcome, and saying which is which
    // would leak whether ids exist.
    throw ApiError.notFound("Transaction not found.");
  }

  return parsed.data;
}

export const GET = route(async (_request, context: Context) => {
  const user = await requireUser();
  const id = await resolveId(context);

  await connectDB();

  const transaction = await Transaction.findOne({
    _id: id,
    userId: user.objectId,
  }).lean();

  if (!transaction) throw ApiError.notFound("Transaction not found.");

  return ok({ transaction: serializeTransaction(transaction) });
});

export const PATCH = route(async (request, context: Context) => {
  const user = await requireUser();
  const id = await resolveId(context);
  const updates = await parseJsonBody(request, updateTransactionSchema);

  await connectDB();

  // Ownership is part of the filter, not a separate check: a user can never
  // update another user's record, even by guessing an id.
  const transaction = await Transaction.findOneAndUpdate(
    { _id: id, userId: user.objectId },
    { $set: updates },
    { new: true, runValidators: true },
  ).lean();

  if (!transaction) throw ApiError.notFound("Transaction not found.");

  return ok({ transaction: serializeTransaction(transaction) });
});

export const DELETE = route(async (_request, context: Context) => {
  const user = await requireUser();
  const id = await resolveId(context);

  await connectDB();

  const deleted = await Transaction.findOneAndDelete({
    _id: id,
    userId: user.objectId,
  }).lean();

  if (!deleted) throw ApiError.notFound("Transaction not found.");

  return ok({ deleted: true, id });
});
