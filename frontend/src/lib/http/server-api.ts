import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/token";
import { publicEnv } from "@/lib/env";
import { ApiError } from "@/lib/http/api-error";
import type { ApiFailure, ApiSuccess } from "@/lib/http/api-response";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

export const serverApi = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T, TBody>(path: string, body: TBody) => request<T>("POST", path, body),
  patch: <T, TBody>(path: string, body: TBody) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  let response: Response;
  try {
    response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch (error) {
    throw error instanceof Error ? error : new TypeError("Unable to reach the backend API");
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw ApiError.internal(`Backend request failed for ${path}`);
  }

  const json = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if ("error" in json) {
    throw new ApiError(json.error.code, json.error.message, json.error.details);
  }

  return json.data;
}
