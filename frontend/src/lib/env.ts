import { z } from "zod";

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:4000"),
});

function parsePublicEnv() {
  const result = PublicEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });
  if (!result.success) {
    throw new Error("Invalid public environment");
  }
  return result.data;
}

export const publicEnv = parsePublicEnv();
