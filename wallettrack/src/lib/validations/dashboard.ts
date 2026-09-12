import { z } from "zod";
import { monthSchema } from "./common";

export const dashboardQuerySchema = z.object({
  month: monthSchema.optional(),
});
