import mongoose, { Schema, models } from "mongoose";

const BudgetSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    limit: {
      type: Number,
      required: true,
    },
    month: {
      type: String, // e.g. "2026-01"
      required: true,
    },
  },
  { timestamps: true }
);

export default models.Budget || mongoose.model("Budget", BudgetSchema);
