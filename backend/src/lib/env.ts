import { z } from "zod";

const ServerEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  FRONTEND_ORIGINS: z.string().default("http://localhost:3000"),
  BACKEND_PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

function parseServerEnv() {
  const result = ServerEnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid server environment variables:", result.error.flatten().fieldErrors);
    throw new Error("Invalid server environment");
  }
  return result.data;
}
export const serverEnv = parseServerEnv();
