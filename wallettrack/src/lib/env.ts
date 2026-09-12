import { z } from "zod";

/**
 * Runtime environment contract.
 *
 * Validated once, at module load, so a misconfigured deployment fails fast at
 * boot instead of throwing an opaque error on the first request that needs it.
 */
const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required")
    .refine(
      (value) =>
        value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"),
      "MONGODB_URI must be a mongodb:// or mongodb+srv:// connection string",
    ),

  MONGODB_DB_NAME: z.string().min(1).optional(),

  /**
   * Signing key for session tokens. 32+ characters keeps the key at least as
   * large as the HS256 output it protects.
   */
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters long"),

  /** Session lifetime in seconds. Defaults to 7 days. */
  SESSION_MAX_AGE: z.coerce.number().int().positive().default(60 * 60 * 24 * 7),

  /* ---------- Optional: contact form email delivery ---------- */
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASSWORD: z.string().min(1).optional(),
  CONTACT_RECIPIENT_EMAIL: z.email().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

function loadEnv(): ServerEnv {
  const parsed = serverSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
    // JWT_SECRET is the legacy name; accepted so existing deployments keep working.
    AUTH_SECRET: process.env.AUTH_SECRET ?? process.env.JWT_SECRET,
    SESSION_MAX_AGE: process.env.SESSION_MAX_AGE,
    // GMAIL_USER / GMAIL_PASS are the legacy names. When only those are set,
    // fill in Gmail's SMTP endpoint so existing deployments keep sending mail
    // without an env change.
    SMTP_HOST:
      process.env.SMTP_HOST ?? (process.env.GMAIL_USER ? "smtp.gmail.com" : undefined),
    SMTP_PORT: process.env.SMTP_PORT ?? (process.env.GMAIL_USER ? "465" : undefined),
    SMTP_USER: process.env.SMTP_USER ?? process.env.GMAIL_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD ?? process.env.GMAIL_PASS,
    CONTACT_RECIPIENT_EMAIL:
      process.env.CONTACT_RECIPIENT_EMAIL ?? process.env.GMAIL_USER,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Invalid environment configuration:\n${details}\n\n` +
        "See .env.example for the full list of required variables.",
    );
  }

  return parsed.data;
}

export const env = loadEnv();

export const isProduction = env.NODE_ENV === "production";

/** True only when every SMTP variable needed to actually send mail is present. */
export const isEmailConfigured = Boolean(
  env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASSWORD,
);
