import { describe, expect, it } from "vitest";
import { Types } from "mongoose";
import { buildTransactionFilter, escapeRegex } from "./transactions";

const userId = new Types.ObjectId("6aa502fb6286f80b2d24bba9");

describe("escapeRegex", () => {
  it("escapes every regex metacharacter", () => {
    expect(escapeRegex("a.b*c+d?e^f$g{h}i(j)k|l[m]n")).toBe(
      "a\\.b\\*c\\+d\\?e\\^f\\$g\\{h\\}i\\(j\\)k\\|l\\[m\\]n",
    );
  });

  it("escapes backslashes", () => {
    expect(escapeRegex("a\\b")).toBe("a\\\\b");
  });

  it("makes a catastrophic-backtracking pattern inert", () => {
    // Unescaped, this compiles to a pattern that can hang the database on a
    // long non-matching input.
    const pattern = new RegExp(escapeRegex("(a+)+$"));

    expect(pattern.test("(a+)+$")).toBe(true);
    expect(pattern.test("aaaaaaaaaaaaaaaaaaaaaaaaa")).toBe(false);
  });

  it("leaves ordinary search terms searchable", () => {
    expect(new RegExp(escapeRegex("coffee"), "i").test("Coffee beans")).toBe(true);
  });
});

describe("buildTransactionFilter", () => {
  it("always scopes to the user, even with no filters", () => {
    // Every query must be bounded by the owner. A missing userId would return
    // every user's data.
    expect(buildTransactionFilter(userId, {})).toEqual({ userId });
  });

  it("applies type and category filters", () => {
    const filter = buildTransactionFilter(userId, {
      type: "expense",
      category: "Food & Dining",
    });

    expect(filter).toMatchObject({ type: "expense", category: "Food & Dining" });
  });

  it("treats the end date as inclusive of the whole day", () => {
    const filter = buildTransactionFilter(userId, {
      startDate: new Date(2026, 8, 1),
      endDate: new Date(2026, 8, 30),
    });

    const date = filter.date as { $gte: Date; $lte: Date };

    expect(date.$gte.getDate()).toBe(1);
    // A transaction recorded at 18:42 on the 30th still belongs to the range a
    // user selected by picking "30 September" as the end date.
    expect(date.$lte.getDate()).toBe(30);
    expect(date.$lte.getHours()).toBe(23);
    expect(date.$lte.getMinutes()).toBe(59);
  });

  it("supports an open-ended date range", () => {
    const from = buildTransactionFilter(userId, { startDate: new Date(2026, 0, 1) });
    expect(from.date).toHaveProperty("$gte");
    expect(from.date).not.toHaveProperty("$lte");
  });

  it("applies amount bounds", () => {
    const filter = buildTransactionFilter(userId, { minAmount: 100, maxAmount: 5000 });
    expect(filter.amount).toEqual({ $gte: 100, $lte: 5000 });
  });

  it("includes a zero minimum rather than treating it as absent", () => {
    const filter = buildTransactionFilter(userId, { minAmount: 0 });
    expect(filter.amount).toEqual({ $gte: 0 });
  });

  it("searches category and description with an escaped, case-insensitive pattern", () => {
    const filter = buildTransactionFilter(userId, { search: "food." });
    const or = filter.$or as [{ category: RegExp }, { description: RegExp }];

    expect(or).toHaveLength(2);
    expect(or[0].category.flags).toContain("i");
    expect(or[0].category.source).toBe("food\\.");
    expect(or[1].description.source).toBe("food\\.");
  });

  it("omits filters that were not supplied", () => {
    const filter = buildTransactionFilter(userId, { type: "income" });

    expect(filter).not.toHaveProperty("category");
    expect(filter).not.toHaveProperty("date");
    expect(filter).not.toHaveProperty("amount");
    expect(filter).not.toHaveProperty("$or");
  });
});
