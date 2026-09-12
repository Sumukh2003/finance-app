import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

/**
 * Runs before every request: enforces authentication at the routing layer and
 * attaches security headers.
 *
 * This is a first line of defence, not the only one - each API route still
 * calls `requireUser()`, so a misconfigured matcher cannot expose data.
 */

/** Signed-in users are bounced away from these. */
const AUTH_ROUTES = ["/login", "/register"];

/** Require a session; unauthenticated visitors are redirected to sign in. */
const PROTECTED_PAGE_PREFIX = "/dashboard";

/** API paths reachable without a session. */
const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/contact",
  "/api/health",
];

function buildCsp(nonce: string, isDev: boolean): string {
  return [
    "default-src 'self'",
    // 'strict-dynamic' lets the nonced Next.js bootstrap load its own chunks
    // while still refusing any script an injected tag tries to pull in.
    // 'unsafe-eval' is required by the dev-only React refresh runtime.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ""}`,
    // Inline styles cannot carry a nonce here: Tailwind, Recharts and React
    // style attributes all emit them. Inline CSS is a far narrower risk than
    // inline script, so this is the practical stopping point.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ]
    .filter(Boolean)
    .join("; ");
}

function applySecurityHeaders(
  response: NextResponse,
  nonce: string,
  isDev: boolean,
): NextResponse {
  const headers = response.headers;

  headers.set("Content-Security-Policy", buildCsp(nonce, isDev));
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );

  if (!isDev) {
    headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return response;
}

function unauthorizedJson(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: { code: "unauthorized", message: "You need to sign in to do that." },
    },
    { status: 401 },
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isDev = process.env.NODE_ENV !== "production";

  // A fresh nonce per request. Next.js reads it back out of the request-scoped
  // CSP header and stamps it onto the scripts it renders.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", buildCsp(nonce, isDev));

  const forward = () =>
    NextResponse.next({ request: { headers: requestHeaders } });

  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (pathname.startsWith("/api/")) {
    const isPublic = PUBLIC_API_ROUTES.some(
      (publicPath) => pathname === publicPath || pathname.startsWith(`${publicPath}/`),
    );

    if (!isPublic && !session) {
      return applySecurityHeaders(unauthorizedJson(), nonce, isDev);
    }

    return applySecurityHeaders(forward(), nonce, isDev);
  }

  if (pathname.startsWith(PROTECTED_PAGE_PREFIX) && !session) {
    const loginUrl = new URL("/login", request.url);
    // Remember where they were headed so sign-in can return them there.
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return applySecurityHeaders(
      NextResponse.redirect(loginUrl),
      nonce,
      isDev,
    );
  }

  if (session && AUTH_ROUTES.includes(pathname)) {
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/dashboard", request.url)),
      nonce,
      isDev,
    );
  }

  return applySecurityHeaders(forward(), nonce, isDev);
}

export const config = {
  /**
   * Everything except Next's own static output and metadata files. Static
   * assets do not need auth checks, and skipping them keeps the proxy off the
   * hot path for images and chunks.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\.(?:png|jpg|jpeg|gif|svg|webp|ico|avif)$).*)",
  ],
};
