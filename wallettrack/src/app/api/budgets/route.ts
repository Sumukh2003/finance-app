import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Budget from "@/models/Budget";
import jwt from "jsonwebtoken";

/* ---------- Helper ---------- */
function getUserId(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) throw new Error("No auth header");

  const token = authHeader.split(" ")[1];
  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
  return decoded.userId;
}

/* ---------- CREATE BUDGET ---------- */
export async function POST(req: Request) {
  await connectDB();

  try {
    const userId = getUserId(req);
    const { category, limit, month } = await req.json();

    const budget = await Budget.create({
      userId,
      category,
      limit,
      month,
    });

    return NextResponse.json({ success: true, budget });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create budget" },
      { status: 400 }
    );
  }
}

/* ---------- GET BUDGETS (by month) ---------- */
export async function GET(req: Request) {
  await connectDB();

  try {
    const userId = getUserId(req);
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    const budgets = await Budget.find({
      userId,
      ...(month ? { month } : {}),
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, budgets });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch budgets" },
      { status: 400 }
    );
  }
}

/* ---------- UPDATE BUDGET ---------- */
export async function PUT(req: Request) {
  await connectDB();

  try {
    const userId = getUserId(req);
    const { id, category, limit, month } = await req.json();

    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId },
      { category, limit, month },
      { new: true }
    );

    if (!budget) {
      return NextResponse.json(
        { success: false, message: "Budget not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, budget });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update budget" },
      { status: 400 }
    );
  }
}

/* ---------- DELETE BUDGET ---------- */
export async function DELETE(req: Request) {
  await connectDB();

  try {
    const userId = getUserId(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Budget ID required" },
        { status: 400 }
      );
    }

    const budget = await Budget.findOneAndDelete({ _id: id, userId });

    if (!budget) {
      return NextResponse.json(
        { success: false, message: "Budget not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete budget" },
      { status: 400 }
    );
  }
}
