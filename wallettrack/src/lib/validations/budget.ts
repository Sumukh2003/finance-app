import { z } from "zod";
import { amountSchema, categorySchema, monthSchema } from "./common";

export const createBudgetSchema = z.object({
  category: categorySchema,
  limit: amountSchema,
  month: monthSchema,
});

export type CreateBudgetInput = z.input<typeof createBudgetSchema>;

export const updateBudgetSchema = createBudgetSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export const budgetQuerySchema = z.object({
  month: monthSchema.optional(),
});
