import { serverEnv } from "@/lib/env";

export function createCorsOptions() {
  const frontendOrigins = (process.env.FRONTEND_ORIGINS ?? serverEnv.FRONTEND_ORIGINS)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    origin: frontendOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
}
