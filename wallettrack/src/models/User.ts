import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const SUPPORTED_CURRENCIES = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "AUD",
  "CAD",
  "SGD",
  "JPY",
] as const;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    /**
     * Never returned by default. Queries that genuinely need the hash must opt
     * in with `.select("+passwordHash")`, so it cannot leak through a stray
     * `findOne()` that gets serialised into a response.
     */
    passwordHash: {
      type: String,
      select: false,
    },
    /**
     * Legacy field from the pre-`passwordHash` schema. Accounts created before
     * the rename still store their bcrypt hash here; `POST /api/auth/login`
     * migrates them to `passwordHash` on the next successful sign-in. Remove
     * this field once no documents contain it.
     *
     * @deprecated Use `passwordHash`.
     */
    password: {
      type: String,
      select: false,
    },
    currency: {
      type: String,
      enum: SUPPORTED_CURRENCIES,
      default: "INR",
    },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.passwordHash;
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User: Model<UserDocument> =
  (mongoose.models.User as Model<UserDocument>) ??
  mongoose.model<UserDocument>("User", userSchema);
