export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Budget from "@/models/Budget";
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

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    if (!month) {
      return NextResponse.json(
        { success: false, error: "month (YYYY-MM) is required" },
        { status: 400 }
      );
    }

    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const budgets = await Budget.find({ userId, month });

    const expenses = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "expense",
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$category",
          spent: { $sum: "$amount" },
        },
      },
    ]);

    const expenseMap = new Map(expenses.map((e) => [e._id, e.spent]));

    const summary = budgets.map((b) => {
      const spent = expenseMap.get(b.category) || 0;
      const remaining = b.limit - spent;

      return {
        category: b.category,
        limit: b.limit,
        spent,
        remaining,
        overBudget: remaining < 0,
      };
    });

    return NextResponse.json({ success: true, summary });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 401 }
    );
  }
}
