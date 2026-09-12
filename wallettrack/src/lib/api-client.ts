import type { ErrorCode, FieldErrors } from "@/lib/api/errors";

/**
 * Browser-side API client.
 *
 * One place that knows the response envelope, so components never reach into
 * `data.success` or guess where an error message lives. Credentials ride on the
 * httpOnly session cookie, which means there is no token for this module - or
 * for any injected script - to read.
 */

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: ErrorCode | "network_error";
  readonly fields?: FieldErrors;

  constructor(
    message: string,
    status: number,
    code: ErrorCode | "network_error",
    fields?: FieldErrors,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }

  /** True when the session is missing or expired. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Appended as a query string; `undefined` and `""` values are dropped. */
  query?: Record<string, string | number | boolean | undefined | null>;
};

export function buildQueryString(
  query: RequestOptions["query"] = {},
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export async function apiRequest<T>(
  path: string,
  { body, query, headers, ...init }: RequestOptions = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${path}${buildQueryString(query)}`, {
      ...init,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      // Never serve an API read from the browser cache; stale balances are
      // worse than a slightly slower refresh.
      cache: "no-store",
    });
  } catch {
    throw new ApiClientError(
      "Could not reach the server. Check your connection and try again.",
      0,
      "network_error",
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    const error = payload?.error;
    throw new ApiClientError(
      error?.message ?? "Something went wrong. Please try again.",
      response.status,
      error?.code ?? "internal_error",
      error?.fields,
    );
  }

  return payload.data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};

/** Extracts a user-facing message from anything thrown by a request. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}

/**
 * Maps server-side field errors onto react-hook-form.
 *
 * Server validation is authoritative, so its messages have to land on the same
 * inputs the client-side rules would have flagged.
 */
export function applyFieldErrors(
  error: unknown,
  setError: (field: string, options: { type: string; message: string }) => void,
): boolean {
  if (!(error instanceof ApiClientError) || !error.fields) return false;

  let applied = false;

  for (const [field, messages] of Object.entries(error.fields)) {
    if (field === "_" || !messages?.length) continue;
    setError(field, { type: "server", message: messages[0]! });
    applied = true;
  }

  return applied;
}
