import axios, { AxiosError, type AxiosInstance } from "axios";

import { getAccessTokenFromDocument } from "@/lib/auth/token";
import { publicEnv } from "@/lib/env";

import { ApiError, type ApiErrorCode } from "./api-error";
import type { ApiFailure, ApiSuccess } from "./api-response";

function isApiFailureBody(value: unknown): value is ApiFailure {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as { error?: unknown }).error === "object"
  );
}

/**
 * Single Axios instance for all client-side requests. Response interceptor
 * unwraps `{ data }` envelopes and rethrows server failures as {@link ApiError}
 * so call sites only deal with the payload type or a typed error.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: publicEnv.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessTokenFromDocument();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const body: unknown = response.data;
    if (typeof body === "object" && body !== null && "data" in body) {
      response.data = (body as ApiSuccess<unknown>).data;
    }
    return response;
  },
  (error: unknown) => {
    if (error instanceof AxiosError && error.response) {
      const body: unknown = error.response.data;
      if (isApiFailureBody(body)) {
        return Promise.reject(
          new ApiError(
            body.error.code as ApiErrorCode,
            body.error.message,
            body.error.details,
          ),
        );
      }
      return Promise.reject(
        new ApiError("INTERNAL_SERVER_ERROR", `Request failed with status ${error.response.status}`),
      );
    }
    return Promise.reject(
      error instanceof Error
        ? new ApiError("INTERNAL_SERVER_ERROR", error.message)
        : new ApiError("INTERNAL_SERVER_ERROR", "Network error"),
    );
  },
);
