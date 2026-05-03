import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";

import { ApiExceptionFilter } from "@/common/filters/api-exception.filter";
import { AppModule } from "@/app.module";
import { createCorsOptions } from "@/config/cors";

const adapter = new ExpressAdapter();
let bootstrapPromise: Promise<ReturnType<ExpressAdapter["getInstance"]>> | null = null;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, adapter, { cors: false });

  app.enableCors(createCorsOptions());
  app.useGlobalFilters(new ApiExceptionFilter());
  app.setGlobalPrefix("");

  await app.init();

  return adapter.getInstance();
}

export default async function handler(
  req: { method?: string; url?: string },
  res: {
    statusCode: number;
    setHeader(name: string, value: string): void;
    end(body: string): void;
  },
) {
  try {
    const server = await (bootstrapPromise ??= bootstrap().catch((error) => {
      bootstrapPromise = null;
      throw error;
    }));

    return server(req, res);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        error: {
          code: "FUNCTION_BOOTSTRAP_FAILED",
          message: "Backend failed to start",
        },
      }),
    );
  }
}
