import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const transactions = await Transaction.find()
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  return NextResponse.json(transactions);
}
