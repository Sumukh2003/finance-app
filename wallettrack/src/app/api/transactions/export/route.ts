import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { parseSearchParams, route } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guard";
import { UTF8_BOM, csvFilename, toCsv } from "@/lib/csv";
import {
  buildTransactionFilter,
  serializeTransaction,
  sortSpecFor,
  type SerializedTransaction,
} from "@/lib/queries/transactions";
import { transactionQuerySchema } from "@/lib/validations/transaction";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Upper bound on a single export. Large enough to cover years of ordinary
 * personal use, small enough that one request cannot pull an unbounded result
 * set into memory.
 */
const EXPORT_LIMIT = 10_000;

const COLUMNS = [
  { header: "Date", value: (t: SerializedTransaction) => t.date.slice(0, 10) },
  { header: "Type", value: (t: SerializedTransaction) => t.type },
  { header: "Category", value: (t: SerializedTransaction) => t.category },
  { header: "Description", value: (t: SerializedTransaction) => t.description },
  { header: "Amount", value: (t: SerializedTransaction) => t.amount },
] as const;

/**
 * Exports the transactions matching the caller's current filters.
 *
 * Runs on the server against the full filtered set, so the file matches what
 * the user is looking at rather than only the page currently in the browser.
 */
export const GET = route(async (request) => {
  const user = await requireUser();
  const query = parseSearchParams(request, transactionQuerySchema);

  await connectDB();

  const documents = await Transaction.find(
    buildTransactionFilter(user.objectId, query),
  )
    .sort(sortSpecFor(query.sort))
    .limit(EXPORT_LIMIT)
    .lean();

  const csv = toCsv(documents.map(serializeTransaction), COLUMNS);

  return new Response(UTF8_BOM + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${csvFilename("wallettrack-transactions")}"`,
      "Cache-Control": "no-store",
    },
  });
});
