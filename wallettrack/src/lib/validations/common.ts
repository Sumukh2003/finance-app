import { z } from "zod";
import { MAX_AMOUNT } from "@/lib/constants";

/** `YYYY-MM`, e.g. "2026-03". */
export const monthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format");

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid identifier");

/**
 * Money is stored as a Number in Mongo, so amounts are constrained to two
 * decimal places and a sane ceiling to keep totals exact and reject nonsense.
 */
export const amountSchema = z.coerce
  .number({ error: "Amount is required" })
  .positive("Amount must be greater than zero")
  .max(MAX_AMOUNT, "Amount is unrealistically large")
  .refine(
    (value) => Number.isFinite(value) && Math.round(value * 100) === value * 100,
    "Amount can have at most two decimal places",
  );

/**
 * A calendar date, normalised to UTC midnight.
 *
 * Accepts `YYYY-MM-DD` (what a date input produces) or a full ISO timestamp.
 * Either way the time component is discarded, because "the 12th" is a day, not
 * an instant — keeping the time is what lets a transaction drift into the
 * neighbouring month when the server and the user are in different timezones.
 */
export const isoDateSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date")
  .transform((value) => {
    // A bare `YYYY-MM-DD` is already parsed as UTC midnight by the spec; for a
    // full timestamp, take its UTC calendar date.
    const parsed = new Date(value);
    return new Date(
      Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()),
    );
  });

export const categorySchema = z
  .string()
  .trim()
  .min(1, "Category is required")
  .max(60, "Category must be 60 characters or fewer");

export const transactionTypeSchema = z.enum(["income", "expense"], {
  error: "Type must be either income or expense",
});

/** Turns "" into undefined so empty query params mean "no filter". */
export const emptyStringToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());
