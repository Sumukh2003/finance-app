import { z } from "zod";

/**
 * Normalise before validating, not after.
 *
 * `z.email().trim()` checks the raw string first, so a trailing space - which
 * autofill and copy-paste add routinely - is reported as an invalid address
 * even though it would have been fine once trimmed.
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address").max(254, "Email address is too long"));

/**
 * Password policy, enforced identically on the client (instant feedback) and
 * on the server (the only place it actually counts).
 */
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "Use 128 characters or fewer")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/\d/, "Include a number")
  .regex(/[^A-Za-z0-9]/, "Include a symbol");

export const passwordRequirements = [
  { id: "length", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { id: "lower", label: "A lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { id: "upper", label: "An uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { id: "number", label: "A number", test: (v: string) => /\d/.test(v) },
  { id: "symbol", label: "A symbol", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name must be 80 characters or fewer"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  // Deliberately loose: the policy applies to new passwords, not to checking
  // an existing one. Rejecting a legacy password here would lock users out.
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),
  currency: z.enum(["INR", "USD", "EUR", "GBP", "AUD", "CAD", "SGD", "JPY"]),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
