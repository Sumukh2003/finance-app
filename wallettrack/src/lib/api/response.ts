import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { ApiError, ErrorCode, type FieldErrors } from "./errors";
import { isProduction } from "@/lib/env";

/**
 * Every endpoint answers with the same envelope, so the client never has to
 * guess where the payload or the error text lives.
 */
export type ApiSuccess<T> = { success: true; data: T };

export type ApiFailure = {
  success: false;
  error: { code: ErrorCode; message: string; fields?: FieldErrors };
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, init);
}

export function created<T>(data: T) {
  return ok(data, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

function failure(error: ApiError, init?: ResponseInit) {
  return NextResponse.json<ApiFailure>(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.fields ? { fields: error.fields } : {}),
      },
    },
    { status: error.status, ...init },
  );
}

/** Flattens a ZodError into `{ fieldName: ["message", ...] }`. */
export function toFieldErrors(error: ZodError): FieldErrors {
  const fields: FieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_";
    (fields[key] ??= []).push(issue.message);
  }

  return fields;
}

/**
 * Parses a JSON request body against a schema.
 * Throws an ApiError the route handler wrapper knows how to render.
 */
export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    throw ApiError.badRequest("Request body must be valid JSON.");
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw ApiError.validation(toFieldErrors(parsed.error));
  }

  return parsed.data;
}

/** Parses URL search params against a schema. */
export function parseSearchParams<T>(request: Request, schema: ZodType<T>): T {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = schema.safeParse(params);

  if (!parsed.success) {
    throw ApiError.validation(
      toFieldErrors(parsed.error),
      "Some query parameters are invalid.",
    );
  }

  return parsed.data;
}

type MongoServerError = { code?: number; keyPattern?: Record<string, unknown> };

function isDuplicateKeyError(error: unknown): error is MongoServerError {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as MongoServerError).code === 11000
  );
}

/**
 * Wraps a route handler so every thrown error becomes a well-formed response.
 *
 * Expected failures (ApiError, ZodError, duplicate keys) map to precise status
 * codes. Anything else is logged and reported as a generic 500 — internal
 * messages and stack traces never reach the client in production.
 */
export function route<Args extends unknown[]>(
  handler: (request: Request, ...args: Args) => Promise<Response>,
) {
  return async (request: Request, ...args: Args): Promise<Response> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return failure(error);
      }

      if (error instanceof ZodError) {
        return failure(ApiError.validation(toFieldErrors(error)));
      }

      if (isDuplicateKeyError(error)) {
        return failure(ApiError.conflict("That record already exists."));
      }

      console.error("[api] Unhandled error", {
        method: request.method,
        url: request.url,
        error,
      });

      return failure(
        new ApiError(
          500,
          ErrorCode.INTERNAL,
          isProduction
            ? "Something went wrong on our end. Please try again."
            : `Unhandled server error: ${
                error instanceof Error ? error.message : String(error)
              }`,
        ),
      );
    }
  };
}
