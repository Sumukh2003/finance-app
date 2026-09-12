import { z } from "zod";
import { emailSchema } from "./auth";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),
  email: emailSchema,
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(120, "Subject must be 120 characters or fewer"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(4000, "Message must be 4000 characters or fewer"),
});

export type ContactInput = z.infer<typeof contactSchema>;
