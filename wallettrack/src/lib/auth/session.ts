import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env, isProduction } from "@/lib/env";

export const SESSION_COOKIE = "wt_session";

const ISSUER = "wallettrack";
const AUDIENCE = "wallettrack:web";

/**
 * Session tokens are signed with HS256 and read by both the Node runtime
 * (route handlers) and the Edge runtime (proxy), so `jose` is used throughout —
 * Node's `crypto` based libraries are not available at the edge.
 */
const signingKey = new TextEncoder().encode(env.AUTH_SECRET);

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
};

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${env.SESSION_MAX_AGE}s`)
    .sign(signingKey);
}

/** Returns the session payload, or `null` when the token is missing/invalid/expired. */
export async function verifySessionToken(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, signingKey, {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ["HS256"],
    });

    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return null;
    }

    return {
      userId: payload.sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : "",
    };
  } catch {
    // Expired, tampered with, or signed by a rotated key — all equally "no session".
    return null;
  }
}

/**
 * Cookie flags:
 * - `httpOnly` keeps the token out of reach of any script on the page, so an
 *   XSS bug cannot exfiltrate a session (the reason this is not localStorage).
 * - `sameSite: lax` blocks cross-site POSTs while keeping normal navigation working.
 * - `secure` in production so the cookie is never sent over plaintext HTTP.
 */
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: isProduction,
  path: "/",
} as const;

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    ...cookieOptions,
    maxAge: env.SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

/** Reads and verifies the session from the incoming request cookies. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
