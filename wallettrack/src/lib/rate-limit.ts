import { ApiError } from "@/lib/api/errors";

type Bucket = { count: number; resetAt: number };

/**
 * Fixed-window rate limiter backed by an in-process Map.
 *
 * Scope and caveat: state lives in one server process, so with several
 * instances behind a load balancer each enforces its own quota, and the state
 * resets on deploy. That is an acceptable floor for abuse control on a small
 * deployment — it turns "unlimited credential stuffing" into "limited per
 * instance". For a multi-instance production deployment, swap the store for
 * Redis (Upstash et al.) behind this same interface; no call site changes.
 */
const buckets = new Map<string, Bucket>();

/** Drops expired buckets so the map cannot grow without bound. */
function evictExpired(now: number): void {
  if (buckets.size < 5_000) return;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitOptions = {
  /** Stable identifier for the caller — usually `route:ip`. */
  key: string;
  /** Maximum number of requests allowed per window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets. */
  retryAfter: number;
};

export function checkRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  evictExpired(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.ceil((existing.resetAt - now) / 1000);

  if (existing.count > limit) {
    return { allowed: false, remaining: 0, retryAfter };
  }

  return { allowed: true, remaining: limit - existing.count, retryAfter };
}

/** Applies a rate limit and throws a 429 when the caller is over quota. */
export function enforceRateLimit(options: RateLimitOptions): void {
  const result = checkRateLimit(options);

  if (!result.allowed) {
    throw ApiError.rateLimited(
      `Too many attempts. Please try again in ${result.retryAfter} second${
        result.retryAfter === 1 ? "" : "s"
      }.`,
    );
  }
}

/**
 * Best-effort client identity for rate-limit keys.
 *
 * `x-forwarded-for` is attacker-controllable unless a trusted proxy overwrites
 * it — which Vercel, Cloudflare and most managed platforms do. Treat it as a
 * throttling hint, never as an authentication or authorisation signal.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [first] = forwardedFor.split(",");
    if (first?.trim()) return first.trim();
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Clears all buckets. Test-only helper. */
export function __resetRateLimits(): void {
  buckets.clear();
}
