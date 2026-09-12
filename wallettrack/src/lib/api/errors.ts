/**
 * Machine-readable error codes. Clients switch on these rather than on
 * human-readable messages, which are free to change.
 */
export const ErrorCode = {
  BAD_REQUEST: "bad_request",
  VALIDATION_FAILED: "validation_failed",
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  NOT_FOUND: "not_found",
  CONFLICT: "conflict",
  RATE_LIMITED: "rate_limited",
  SERVICE_UNAVAILABLE: "service_unavailable",
  INTERNAL: "internal_error",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Field-level validation problems, keyed by form field name. */
export type FieldErrors = Record<string, string[]>;

/**
 * An error that is safe to surface to the client verbatim.
 *
 * Anything thrown that is *not* an ApiError is treated as an unexpected fault:
 * logged server-side, reported to the client as a generic 500.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly fields?: FieldErrors;

  constructor(
    status: number,
    code: ErrorCode,
    message: string,
    fields?: FieldErrors,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }

  static badRequest(message = "The request was malformed.") {
    return new ApiError(400, ErrorCode.BAD_REQUEST, message);
  }

  static validation(fields: FieldErrors, message = "Please check the highlighted fields.") {
    return new ApiError(422, ErrorCode.VALIDATION_FAILED, message, fields);
  }

  static unauthorized(message = "You need to sign in to do that.") {
    return new ApiError(401, ErrorCode.UNAUTHORIZED, message);
  }

  static forbidden(message = "You do not have access to this resource.") {
    return new ApiError(403, ErrorCode.FORBIDDEN, message);
  }

  static notFound(message = "We could not find what you were looking for.") {
    return new ApiError(404, ErrorCode.NOT_FOUND, message);
  }

  static conflict(message = "That resource already exists.") {
    return new ApiError(409, ErrorCode.CONFLICT, message);
  }

  static rateLimited(message = "Too many requests. Please slow down and try again shortly.") {
    return new ApiError(429, ErrorCode.RATE_LIMITED, message);
  }

  static unavailable(message = "That service is temporarily unavailable.") {
    return new ApiError(503, ErrorCode.SERVICE_UNAVAILABLE, message);
  }
}
