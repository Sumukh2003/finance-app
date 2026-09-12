import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ApiError } from "@/lib/api/errors";
import { ok, parseJsonBody, route } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guard";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { updateProfileSchema } from "@/lib/validations/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = route(async () => {
  const session = await requireUser();
  await connectDB();

  const user = await User.findById(session.objectId).lean();

  if (!user) {
    // Valid token, missing account: deleted, or signed before a data reset.
    throw ApiError.unauthorized("Your account is no longer available.");
  }

  return ok({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      currency: user.currency,
      createdAt: user.createdAt,
    },
  });
});

export const PATCH = route(async (request) => {
  const session = await requireUser();
  const { name, currency } = await parseJsonBody(request, updateProfileSchema);

  await connectDB();

  const user = await User.findByIdAndUpdate(
    session.objectId,
    { $set: { name, currency } },
    { new: true, runValidators: true },
  ).lean();

  if (!user) throw ApiError.notFound("Account not found.");

  // The display name is baked into the session token, so re-issue it or the
  // header keeps showing the old name until the next sign-in.
  await setSessionCookie(
    await createSessionToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    }),
  );

  return ok({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      currency: user.currency,
      createdAt: user.createdAt,
    },
  });
});
