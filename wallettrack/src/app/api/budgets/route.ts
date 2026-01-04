import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Budget from "@/models/Budget";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  await connectDB();

  try {
    const authHeader = req.headers.get("authorization")!;
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const body = await req.json();
    const { category, limit, month } = body;

    const budget = await Budget.create({
      userId: decoded.userId,
      category,
      limit,
      month,
    });

    return NextResponse.json({ success: true, budget });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create budget" },
      { status: 400 }
    );
  }
}
