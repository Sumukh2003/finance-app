import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { SessionProvider, type SessionUser } from "@/components/providers";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import type { CurrencyCode } from "@/lib/format";

/**
 * Authenticated shell for every dashboard route.
 *
 * The session is resolved on the server, so a protected page never renders
 * before the check completes. The previous version asked the browser to fetch
 * the session after mount, which meant private markup was painted first and
 * only then replaced by a redirect.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // The proxy already redirects unauthenticated visitors; this is the
  // belt-and-braces check that also covers a token for a deleted account.
  if (!session) redirect("/login");

  await connectDB();
  const record = await User.findById(session.userId).lean();

  if (!record) redirect("/login");

  const user: SessionUser = {
    id: record._id.toString(),
    name: record.name,
    email: record.email,
    currency: (record.currency ?? "INR") as CurrencyCode,
  };

  return (
    <SessionProvider user={user}>
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
