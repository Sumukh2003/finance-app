import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { MAX_AMOUNT } from "@/lib/constants";

const budgetSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    limit: {
      type: Number,
      required: true,
      min: [0.01, "Budget limit must be greater than zero"],
      max: MAX_AMOUNT,
    },
    /** Budget period as `YYYY-MM`. */
    month: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
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
 * One budget per category per month, enforced by the database rather than by a
 * read-then-write check that two concurrent requests could both pass.
 */
budgetSchema.index({ userId: 1, month: 1, category: 1 }, { unique: true });

export type BudgetDocument = InferSchemaType<typeof budgetSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Budget: Model<BudgetDocument> =
  (mongoose.models.Budget as Model<BudgetDocument>) ??
  mongoose.model<BudgetDocument>("Budget", budgetSchema);

export default Budget;
