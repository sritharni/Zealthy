export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE_ENTITY"
  | "INTERNAL_SERVER_ERROR";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details;
  }

  static badRequest(message = "Bad request", details?: unknown) {
    return new ApiError("BAD_REQUEST", message, details);
  }

  static unauthorized(message = "Unauthorized", details?: unknown) {
    return new ApiError("UNAUTHORIZED", message, details);
  }

  static forbidden(message = "Forbidden", details?: unknown) {
    return new ApiError("FORBIDDEN", message, details);
  }

  static notFound(message = "Resource not found", details?: unknown) {
    return new ApiError("NOT_FOUND", message, details);
  }

  static conflict(message = "Conflict", details?: unknown) {
    return new ApiError("CONFLICT", message, details);
  }

  static unprocessable(message = "Unprocessable entity", details?: unknown) {
    return new ApiError("UNPROCESSABLE_ENTITY", message, details);
  }

  static internal(message = "Internal server error", details?: unknown) {
    return new ApiError("INTERNAL_SERVER_ERROR", message, details);
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}
