import type { ApiErrorCode } from "./api-error.js";

export type ApiSuccess<T> = {
  data: T;
};

export type ApiFailure = {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
