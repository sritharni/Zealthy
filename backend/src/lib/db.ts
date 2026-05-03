import { PrismaClient } from "@prisma/client";

import { serverEnv } from "./env";

// Reuse a single PrismaClient across hot reloads in dev to avoid exhausting
// connection limits. In production each lambda gets its own instance.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: serverEnv.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (serverEnv.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}