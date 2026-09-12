import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { MAX_AMOUNT } from "@/lib/constants";

const transactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 280,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than zero"],
      max: MAX_AMOUNT,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

/**
 * Every query is scoped to one user, so `userId` leads each compound index.
 * These three cover the list view (sorted by date), the type/category
 * aggregations behind the dashboard, and amount-range filtering.
 */
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1, date: -1 });

export type TransactionDocument = InferSchemaType<typeof transactionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Transaction: Model<TransactionDocument> =
  (mongoose.models.Transaction as Model<TransactionDocument>) ??
  mongoose.model<TransactionDocument>("Transaction", transactionSchema);
