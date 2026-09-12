import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ApiError } from "@/lib/api/errors";
import { created, parseJsonBody, route } from "@/lib/api/response";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validations/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = route(async (request) => {
  enforceRateLimit({
    key: `register:${getClientIp(request)}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  const { name, email, password } = await parseJsonBody(request, registerSchema);

  await connectDB();

  if (await User.exists({ email })) {
    // Registration inherently reveals whether an address is taken, so a clear
    // message here costs nothing the flow does not already give away.
    throw ApiError.conflict("An account with that email already exists.");
  }

  const user = await User.create({
    name,
    email,
    passwordHash: await hashPassword(password),
  });

  await setSessionCookie(
    await createSessionToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    }),
  );

  return created({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      currency: user.currency,
    },
  });
});
