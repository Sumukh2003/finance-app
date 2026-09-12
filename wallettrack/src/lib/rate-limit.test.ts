import { afterEach, describe, expect, it, vi } from "vitest";
import {
  __resetRateLimits,
  checkRateLimit,
  enforceRateLimit,
  getClientIp,
} from "./rate-limit";
import { ApiError } from "./api/errors";

afterEach(() => {
  __resetRateLimits();
  vi.useRealTimers();
});

describe("checkRateLimit", () => {
  it("allows exactly `limit` requests, then blocks", () => {
    const options = { key: "test:allow", limit: 3, windowMs: 60_000 };

    expect(checkRateLimit(options).allowed).toBe(true);
    expect(checkRateLimit(options).allowed).toBe(true);
    expect(checkRateLimit(options).allowed).toBe(true);
    expect(checkRateLimit(options).allowed).toBe(false);
  });

  it("counts down the remaining allowance", () => {
    const options = { key: "test:remaining", limit: 3, windowMs: 60_000 };

    expect(checkRateLimit(options).remaining).toBe(2);
    expect(checkRateLimit(options).remaining).toBe(1);
    expect(checkRateLimit(options).remaining).toBe(0);
  });

  it("tracks each key independently", () => {
    const a = { key: "test:a", limit: 1, windowMs: 60_000 };
    const b = { key: "test:b", limit: 1, windowMs: 60_000 };

    expect(checkRateLimit(a).allowed).toBe(true);
    expect(checkRateLimit(a).allowed).toBe(false);
    // One caller being throttled must not throttle everyone else.
    expect(checkRateLimit(b).allowed).toBe(true);
  });

  it("starts a fresh window once the old one expires", () => {
    vi.useFakeTimers();
    const options = { key: "test:window", limit: 1, windowMs: 1_000 };

    expect(checkRateLimit(options).allowed).toBe(true);
    expect(checkRateLimit(options).allowed).toBe(false);

    vi.advanceTimersByTime(1_001);

    expect(checkRateLimit(options).allowed).toBe(true);
  });

  it("reports how long until the window resets", () => {
    vi.useFakeTimers();
    const options = { key: "test:retry", limit: 1, windowMs: 30_000 };

    checkRateLimit(options);
    vi.advanceTimersByTime(10_000);

    expect(checkRateLimit(options).retryAfter).toBe(20);
  });
});

describe("enforceRateLimit", () => {
  it("throws a 429 ApiError once over quota", () => {
    const options = { key: "test:throw", limit: 1, windowMs: 60_000 };

    expect(() => enforceRateLimit(options)).not.toThrow();

    try {
      enforceRateLimit(options);
      expect.unreachable("expected enforceRateLimit to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(429);
      expect((error as ApiError).code).toBe("rate_limited");
    }
  });
});

describe("getClientIp", () => {
  const request = (headers: Record<string, string>) =>
    new Request("https://example.com", { headers });

  it("takes the first entry of x-forwarded-for", () => {
    expect(getClientIp(request({ "x-forwarded-for": "203.0.113.9, 70.41.3.18" }))).toBe(
      "203.0.113.9",
    );
  });

  it("falls back to x-real-ip", () => {
    expect(getClientIp(request({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
  });

  it("returns a stable placeholder when no header is present", () => {
    // Everyone anonymous shares one bucket - deliberately conservative, since
    // the alternative is no limit at all.
    expect(getClientIp(request({}))).toBe("unknown");
  });
});
