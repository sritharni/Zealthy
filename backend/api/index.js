import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";

import { ApiExceptionFilter } from "../dist/common/filters/api-exception.filter.js";
import { AppModule } from "../dist/app.module.js";
import { createCorsOptions } from "../dist/config/cors.js";

const adapter = new ExpressAdapter();
let bootstrapPromise = null;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, adapter, { cors: false });

  app.enableCors(createCorsOptions());
  app.useGlobalFilters(new ApiExceptionFilter());
  app.setGlobalPrefix("");

  await app.init();

  return adapter.getInstance();
}

export default async function handler(req, res) {
  try {
    const server = await (bootstrapPromise ??= bootstrap().catch((error) => {
      bootstrapPromise = null;
      throw error;
    }));

    return server(req, res);
  } catch {
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
