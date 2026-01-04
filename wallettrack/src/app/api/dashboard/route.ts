export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import Budget from "@/models/Budget";

const JWT_SECRET = process.env.JWT_SECRET!;

/* ---------- Auth Helper ---------- */
function getUserId(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.split(" ")[1];
  const decoded: any = jwt.verify(token, JWT_SECRET);
  return new mongoose.Types.ObjectId(decoded.userId);
}

/* ---------- GET Dashboard Data ---------- */
export async function GET(req: Request) {
  try {
    await connectDB();
    const userId = getUserId(req);

    /* ---------- Month Range ---------- */
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    /* ---------- Income & Expense ---------- */
    const summary = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfMonth, $lt: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let income = 0;
    let expense = 0;

    summary.forEach((item) => {
      if (item._id === "income") income = item.total;
      if (item._id === "expense") expense = item.total;
    });

    /* ---------- Category-wise Expenses ---------- */
    const categories = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "expense",
          date: { $gte: startOfMonth, $lt: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$category",
          spent: { $sum: "$amount" },
        },
      },
    ]);

    /* ---------- Budgets ---------- */
    const budgets = await Budget.find({ userId, month });

    const budgetSummary = budgets.map((b) => {
      const spent = categories.find((c) => c._id === b.category)?.spent || 0;

      return {
        category: b.category,
        limit: b.limit,
        spent,
        remaining: b.limit - spent,
        exceeded: spent > b.limit,
      };
    });

    return NextResponse.json({
      success: true,
      month,
      income,
      expense,
      balance: income - expense,
      categories,
      budgets: budgetSummary,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 401 }
    );
  }
}
