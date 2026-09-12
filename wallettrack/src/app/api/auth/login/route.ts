import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ApiError } from "@/lib/api/errors";
import { ok, parseJsonBody, route } from "@/lib/api/response";
import { fakePasswordCheck, verifyPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One message for both "no such user" and "wrong password" - see below. */
const INVALID_CREDENTIALS = "That email or password is incorrect.";

export const POST = route(async (request) => {
  const ip = getClientIp(request);
  const { email, password } = await parseJsonBody(request, loginSchema);

  // Two limits: per IP (stops one host spraying many accounts) and per account
  // (stops a distributed attack grinding a single account).
  enforceRateLimit({ key: `login:ip:${ip}`, limit: 10, windowMs: 15 * 60 * 1000 });
  enforceRateLimit({ key: `login:email:${email}`, limit: 5, windowMs: 15 * 60 * 1000 });

  await connectDB();

  const user = await User.findOne({ email }).select("+passwordHash +password");

  if (!user) {
    // Hash a throwaway value so a miss costs as much time as a hit. Returning
    // early would make unregistered emails measurably faster to probe.
    await fakePasswordCheck(password);
    throw ApiError.unauthorized(INVALID_CREDENTIALS);
  }

  const storedHash = user.passwordHash ?? user.password;

  if (!storedHash || !(await verifyPassword(password, storedHash))) {
    throw ApiError.unauthorized(INVALID_CREDENTIALS);
  }

  // Self-healing migration for accounts created before the password ->
  // passwordHash rename: promote the hash on the first successful sign-in.
  const alreadyMigrated = Boolean(user.passwordHash);

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        lastLoginAt: new Date(),
        ...(alreadyMigrated ? {} : { passwordHash: storedHash }),
      },
      ...(alreadyMigrated ? {} : { $unset: { password: "" } }),
    },
  );

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
    },
  });
});
