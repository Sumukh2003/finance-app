import { z } from "zod";
import {
  amountSchema,
  categorySchema,
  emptyStringToUndefined,
  isoDateSchema,
  transactionTypeSchema,
} from "./common";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  TRANSACTION_SORTS,
} from "@/lib/constants";

const descriptionSchema = z
  .string()
  .trim()
  .max(280, "Description must be 280 characters or fewer")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  category: categorySchema,
  description: descriptionSchema,
  amount: amountSchema,
  date: isoDateSchema.default(() => new Date()),
});

export type CreateTransactionInput = z.input<typeof createTransactionSchema>;

/** PATCH semantics: every field optional, but at least one must be present. */
export const updateTransactionSchema = createTransactionSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

const sortKeys = Object.keys(TRANSACTION_SORTS) as [
  keyof typeof TRANSACTION_SORTS,
  ...(keyof typeof TRANSACTION_SORTS)[],
];

/**
 * Query filters for the transaction list.
 *
 * `sort` is an enum rather than a free-form string so a caller cannot sort by
 * an unindexed field (a cheap way to stall the database) or probe the schema.
 */
export const transactionQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
    search: emptyStringToUndefined(z.string().trim().max(120)),
    type: emptyStringToUndefined(transactionTypeSchema),
    category: emptyStringToUndefined(z.string().trim().max(60)),
    startDate: emptyStringToUndefined(isoDateSchema),
    endDate: emptyStringToUndefined(isoDateSchema),
    minAmount: emptyStringToUndefined(z.coerce.number().min(0)),
    maxAmount: emptyStringToUndefined(z.coerce.number().min(0)),
    sort: z.enum(sortKeys).default("-date"),
  })
  .refine(
    (q) => !q.startDate || !q.endDate || q.startDate <= q.endDate,
    { message: "Start date must be before end date", path: ["startDate"] },
  )
  .refine(
    (q) => q.minAmount === undefined || q.maxAmount === undefined || q.minAmount <= q.maxAmount,
    { message: "Minimum amount must be below the maximum", path: ["minAmount"] },
  );

export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
