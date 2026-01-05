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

    const url = new URL(req.url);

    // default = current month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const month = url.searchParams.get("month") || currentMonth;

    const startOfMonth = new Date(`${month}-01`);
    const endOfMonth = new Date(
      new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1)
    );

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

    /* ---------- Category-wise Expenses (FIXED) ---------- */
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
          total: { $sum: "$amount" }, // 👈 IMPORTANT
        },
      },
    ]);

    /* ---------- Monthly Trend (NEW) ---------- */
    const monthly = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    /* ---------- Budgets ---------- */
    const budgets = await Budget.find({ userId, month });

    const budgetSummary = budgets.map((b) => {
      const spent = categories.find((c) => c._id === b.category)?.total || 0;

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
      categories, // ✅ Pie chart
      monthly, // ✅ Line chart
      budgets: budgetSummary,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 401 }
    );
  }
}
