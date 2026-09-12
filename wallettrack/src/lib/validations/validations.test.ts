import { describe, expect, it } from "vitest";
import { loginSchema, passwordSchema, registerSchema } from "./auth";
import { amountSchema, monthSchema, objectIdSchema } from "./common";
import { transactionQuerySchema } from "./transaction";
import { createBudgetSchema } from "./budget";

describe("passwordSchema", () => {
  it("accepts a password meeting every rule", () => {
    expect(passwordSchema.safeParse("Str0ng!Passw0rd").success).toBe(true);
  });

  it.each([
    ["too short", "Ab1!x"],
    ["no lowercase", "STR0NG!PASS"],
    ["no uppercase", "str0ng!pass"],
    ["no digit", "Strong!Pass"],
    ["no symbol", "Str0ngPass1"],
  ])("rejects a password with %s", (_label, value) => {
    expect(passwordSchema.safeParse(value).success).toBe(false);
  });

  it("reports every unmet rule at once, not just the first", () => {
    const result = passwordSchema.safeParse("weak");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.length).toBeGreaterThan(1);
  });
});

describe("registerSchema", () => {
  const valid = {
    name: "Ada Lovelace",
    email: "ADA@Example.COM ",
    password: "Str0ng!Passw0rd",
    confirmPassword: "Str0ng!Passw0rd",
  };

  it("normalises the email to lowercase and trims it", () => {
    const result = registerSchema.parse(valid);
    expect(result.email).toBe("ada@example.com");
  });

  it("rejects mismatched passwords against the confirm field", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "Different1!" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });

  it("rejects a malformed email", () => {
    expect(registerSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(
      false,
    );
  });

  it("rejects a one-character name", () => {
    expect(registerSchema.safeParse({ ...valid, name: "A" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts any non-empty password", () => {
    // The strength policy applies to new passwords. Enforcing it at sign-in
    // would lock out accounts created before the policy existed.
    expect(
      loginSchema.safeParse({ email: "ada@example.com", password: "old" }).success,
    ).toBe(true);
  });

  it("rejects an empty password", () => {
    expect(
      loginSchema.safeParse({ email: "ada@example.com", password: "" }).success,
    ).toBe(false);
  });
});

describe("amountSchema", () => {
  it("coerces numeric strings, as HTML inputs produce", () => {
    expect(amountSchema.parse("1875.25")).toBe(1875.25);
  });

  it.each([0, -1, Number.NaN])("rejects %j", (value) => {
    expect(amountSchema.safeParse(value).success).toBe(false);
  });

  it("rejects more than two decimal places", () => {
    expect(amountSchema.safeParse(10.123).success).toBe(false);
  });

  it("rejects an implausibly large amount", () => {
    expect(amountSchema.safeParse(1_000_000_001).success).toBe(false);
  });
});

describe("monthSchema", () => {
  it.each(["2026-01", "2026-12"])("accepts %s", (month) => {
    expect(monthSchema.safeParse(month).success).toBe(true);
  });

  it.each(["2026-13", "2026-00", "2026-1", "september"])("rejects %j", (month) => {
    expect(monthSchema.safeParse(month).success).toBe(false);
  });
});

describe("objectIdSchema", () => {
  it("accepts a 24-character hex id", () => {
    expect(objectIdSchema.safeParse("6aa502fb6286f80b2d24bba9").success).toBe(true);
  });

  it.each(["not-an-id", "6aa502fb6286f80b2d24bba", "../../etc/passwd", ""])(
    "rejects %j",
    (id) => {
      expect(objectIdSchema.safeParse(id).success).toBe(false);
    },
  );
});

describe("transactionQuerySchema", () => {
  it("applies defaults when nothing is supplied", () => {
    const query = transactionQuerySchema.parse({});
    expect(query).toMatchObject({ page: 1, limit: 10, sort: "-date" });
  });

  it("treats empty query params as absent filters", () => {
    const query = transactionQuerySchema.parse({ search: "", type: "", category: "" });

    expect(query.search).toBeUndefined();
    expect(query.type).toBeUndefined();
    expect(query.category).toBeUndefined();
  });

  it("caps the page size", () => {
    // Without a ceiling, `?limit=100000` is a free denial-of-service.
    expect(transactionQuerySchema.safeParse({ limit: "100000" }).success).toBe(false);
  });

  it("only allows sorts from the whitelist", () => {
    expect(transactionQuerySchema.safeParse({ sort: "-date" }).success).toBe(true);
    expect(transactionQuerySchema.safeParse({ sort: "passwordHash" }).success).toBe(false);
  });

  it("rejects a date range that runs backwards", () => {
    const result = transactionQuerySchema.safeParse({
      startDate: "2026-09-30",
      endDate: "2026-09-01",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an amount range that runs backwards", () => {
    expect(
      transactionQuerySchema.safeParse({ minAmount: "500", maxAmount: "100" }).success,
    ).toBe(false);
  });
});

describe("createBudgetSchema", () => {
  it("accepts a well-formed budget", () => {
    const result = createBudgetSchema.parse({
      category: "  Food & Dining  ",
      limit: "7000",
      month: "2026-09",
    });

    expect(result).toEqual({ category: "Food & Dining", limit: 7000, month: "2026-09" });
  });

  it("rejects a zero limit", () => {
    expect(
      createBudgetSchema.safeParse({ category: "Food", limit: 0, month: "2026-09" })
        .success,
    ).toBe(false);
  });
});
