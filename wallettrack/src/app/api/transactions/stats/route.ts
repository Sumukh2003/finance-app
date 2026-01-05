export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

async function authenticate(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.split(" ")[1];
  const decoded: any = jwt.verify(token, JWT_SECRET);
  return decoded.userId;
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const userId = await authenticate(req);

    /* ---------- TOTAL INCOME ---------- */
    const incomeAgg = await Transaction.aggregate([
      { $match: { userId, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    /* ---------- TOTAL EXPENSE ---------- */
    const expenseAgg = await Transaction.aggregate([
      { $match: { userId, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    /* ---------- CATEGORY WISE EXPENSE ---------- */
    const categoryAgg = await Transaction.aggregate([
      { $match: { userId, type: "expense" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    /* ---------- MONTHLY TOTALS ---------- */
    const monthlyAgg = await Transaction.aggregate([
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

    return NextResponse.json({
      success: true,
      income: incomeAgg[0]?.total || 0,
      expense: expenseAgg[0]?.total || 0,
      categories: categoryAgg,
      monthly: monthlyAgg,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 401 }
    );
  }
}
