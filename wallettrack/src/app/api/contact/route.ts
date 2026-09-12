import { ok, parseJsonBody, route } from "@/lib/api/response";
import { ApiError } from "@/lib/api/errors";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validations/contact";
import { env, isEmailConfigured } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Escapes text destined for an HTML email body. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Strips CR/LF from values interpolated into headers.
 *
 * A newline inside a header value lets a sender append headers of their own -
 * `Bcc:` most usefully - turning the contact form into an open relay. The
 * previous version placed the submitted name and address straight into `From`.
 */
function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, 200);
}

export const POST = route(async (request) => {
  enforceRateLimit({
    key: `contact:${getClientIp(request)}`,
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });

  const { name, email, subject, message } = await parseJsonBody(
    request,
    contactSchema,
  );

  if (!isEmailConfigured || !env.CONTACT_RECIPIENT_EMAIL) {
    console.warn("[contact] Submission dropped: SMTP is not configured.");
    throw ApiError.unavailable(
      "Messaging is not available right now. Please email us directly instead.",
    );
  }

  // Imported lazily so the SMTP client is not bundled into deployments that
  // never send mail.
  const nodemailer = (await import("nodemailer")).default;

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER!, pass: env.SMTP_PASSWORD! },
  });

  await transporter.sendMail({
    // The envelope sender stays an address we control, so SPF and DKIM still
    // pass; the submitted address goes in Reply-To where replies belong.
    from: `"WalletTrack Contact" <${env.SMTP_USER}>`,
    replyTo: `"${sanitizeHeader(name)}" <${sanitizeHeader(email)}>`,
    to: env.CONTACT_RECIPIENT_EMAIL,
    subject: sanitizeHeader(`[WalletTrack] ${subject}`),
    text: `From: ${name} <${email}>\n\n${message}`,
    html: `
      <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <hr />
      <p style="white-space: pre-wrap">${escapeHtml(message)}</p>
    `,
  });

  return ok({ sent: true });
});
