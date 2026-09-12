import { Types } from "mongoose";
import { ApiError } from "@/lib/api/errors";
import { getSession, type SessionPayload } from "./session";

export type AuthenticatedUser = SessionPayload & {
  /** The user id as an ObjectId, ready for aggregation `$match` stages. */
  objectId: Types.ObjectId;
};

/**
 * Resolves the signed-in user for a route handler, or throws a 401.
 *
 * The ObjectId is materialised here because aggregation pipelines do **not**
 * cast strings to ObjectIds the way `Model.find()` does — matching on the raw
 * string silently returns zero documents.
 */
export async function requireUser(): Promise<AuthenticatedUser> {
  const session = await getSession();

  if (!session || !Types.ObjectId.isValid(session.userId)) {
    throw ApiError.unauthorized();
  }

  return { ...session, objectId: new Types.ObjectId(session.userId) };
}
