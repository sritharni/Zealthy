import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { apiRoutes, routes } from "@/config/routes";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/token";
import { serverApi } from "@/lib/http/server-api";
import { ApiError } from "@/lib/http/api-error";
import type { SessionUser } from "@/features/auth/schema";

export async function getPatientSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return null;
  }

  try {
    return await serverApi.get<SessionUser>(apiRoutes.auth.me);
  } catch (error) {
    if (error instanceof ApiError && error.code === "UNAUTHORIZED") {
      return null;
    }

    // If the backend is unavailable during SSR, render the signed-out experience
    // instead of crashing the public entry page with a 500.
    if (error instanceof TypeError) {
      return null;
    }

    throw error;
  }
}

export async function requirePatientSession(): Promise<SessionUser> {
  const session = await getPatientSession();
  if (!session) {
    redirect(routes.home);
  }
  return session;
}
