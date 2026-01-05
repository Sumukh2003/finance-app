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

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || "";
    const sort = url.searchParams.get("sort") || "-date";
    const type = url.searchParams.get("type");

    const query: any = { userId };
    if (type) query.type = type;

    if (search) {
      query.$or = [
        { category: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      transactions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const userId = await authenticate(req);

    const { type, category, description, amount, date } = await req.json();
    if (!type || !category || !amount) {
      return NextResponse.json(
        { success: false, error: "Type, category, and amount are required" },
        { status: 400 }
      );
    }

    const transaction = await Transaction.create({
      userId,
      type,
      category,
      description,
      amount,
      date: date || new Date(),
    });

    return NextResponse.json({ success: true, transaction }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 401 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const userId = await authenticate(req);
    const { id, type, category, description, amount, date } = await req.json();
    if (!id) throw new Error("Transaction ID required");

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      { type, category, description, amount, date },
      { new: true }
    );

    if (!transaction) throw new Error("Transaction not found");
    return NextResponse.json({ success: true, transaction });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const userId = await authenticate(req);
    const { id } = await req.json();
    if (!id) throw new Error("Transaction ID required");

    const deleted = await Transaction.findOneAndDelete({ _id: id, userId });
    if (!deleted) throw new Error("Transaction not found");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    );
  }
}
