import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ApiError } from "@/lib/api/errors";
import { ok, parseJsonBody, route } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guard";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { changePasswordSchema } from "@/lib/validations/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = route(async (request) => {
  const session = await requireUser();

  enforceRateLimit({
    key: `password-change:${getClientIp(request)}:${session.userId}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  const { currentPassword, newPassword } = await parseJsonBody(
    request,
    changePasswordSchema,
  );

  await connectDB();

  const user = await User.findById(session.objectId).select(
    "+passwordHash +password",
  );

  if (!user) throw ApiError.unauthorized();

  const storedHash = user.passwordHash ?? user.password;

  if (!storedHash || !(await verifyPassword(currentPassword, storedHash))) {
    throw ApiError.validation(
      { currentPassword: ["That password is incorrect."] },
      "Your current password is incorrect.",
    );
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: { passwordHash: await hashPassword(newPassword) },
      $unset: { password: "" },
    },
  );

  return ok({ updated: true });
});
