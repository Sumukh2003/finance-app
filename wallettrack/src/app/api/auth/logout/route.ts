import { ok, route } from "@/lib/api/response";
import { clearSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = route(async () => {
  await clearSessionCookie();
  return ok({ signedOut: true });
});
