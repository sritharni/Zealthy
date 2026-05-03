import { Injectable } from "@nestjs/common";
import type { Request } from "express";

import type { AuthSession, SessionUser } from "@/shared";

import { verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { serverEnv } from "@/lib/env";
import { ApiError } from "@/lib/http/api-error";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
let joseModulePromise: Promise<typeof import("jose")> | null = null;

function loadJose(): Promise<typeof import("jose")> {
  joseModulePromise ??= Function("specifier", "return import(specifier)")("jose") as Promise<
    typeof import("jose")
  >;
  return joseModulePromise;
}

@Injectable()
export class AuthService {
  async login(email: string, password: string): Promise<AuthSession> {
    const patient = await db.patient.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
      },
    });

    if (!patient) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const isValid = await verifyPassword(password, patient.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const session = {
      sub: patient.id,
      email: patient.email,
      firstName: patient.firstName,
      lastName: patient.lastName,
    } satisfies SessionUser;

    const { SignJWT } = await loadJose();
    const token = await new SignJWT(session)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
      .sign(this.getSecret());

    return {
      accessToken: token,
      user: session,
    };
  }

  logout(): void {
    return;
  }

  async getSession(request: Request): Promise<SessionUser> {
    const token = this.extractBearerToken(request);
    if (!token) {
      throw ApiError.unauthorized("Missing bearer token");
    }

    try {
      const { jwtVerify } = await loadJose();
      const { payload } = await jwtVerify(token, this.getSecret());
      if (
        typeof payload.sub !== "string" ||
        typeof payload.email !== "string" ||
        typeof payload.firstName !== "string" ||
        typeof payload.lastName !== "string"
      ) {
        throw ApiError.unauthorized("Invalid bearer token");
      }

      return {
        sub: payload.sub,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
      };
    } catch {
      throw ApiError.unauthorized("Invalid bearer token");
    }
  }

  private extractBearerToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header) {
      return null;
    }

    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return null;
    }

    return token;
  }

  private getSecret(): Uint8Array {
    return new TextEncoder().encode(serverEnv.AUTH_SECRET);
  }
}
