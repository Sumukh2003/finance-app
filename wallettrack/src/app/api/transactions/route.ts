import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import {
  created,
  ok,
  parseJsonBody,
  parseSearchParams,
  route,
} from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guard";
import {
  buildTransactionFilter,
  getTransactionTotals,
  serializeTransaction,
  sortSpecFor,
} from "@/lib/queries/transactions";
import {
  createTransactionSchema,
  transactionQuerySchema,
} from "@/lib/validations/transaction";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = route(async (request) => {
  const user = await requireUser();
  const query = parseSearchParams(request, transactionQuerySchema);

  await connectDB();

  const filter = buildTransactionFilter(user.objectId, query);
  const skip = (query.page - 1) * query.limit;

  // The count, the page, and the totals are independent reads: run them
  // concurrently rather than paying for three sequential round trips.
  const [total, documents, totals] = await Promise.all([
    Transaction.countDocuments(filter),
    Transaction.find(filter)
      .sort(sortSpecFor(query.sort))
      .skip(skip)
      .limit(query.limit)
      .lean(),
    getTransactionTotals(filter),
  ]);

  return ok({
    transactions: documents.map(serializeTransaction),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
      hasMore: skip + documents.length < total,
    },
    totals,
  });
});

export const POST = route(async (request) => {
  const user = await requireUser();
  const input = await parseJsonBody(request, createTransactionSchema);

  await connectDB();

  const transaction = await Transaction.create({
    ...input,
    description: input.description ?? "",
    userId: user.objectId,
  });

  return created({ transaction: serializeTransaction(transaction.toObject()) });
});
