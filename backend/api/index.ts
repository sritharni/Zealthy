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

export default async function handler(req: unknown, res: unknown) {
  const server = await (bootstrapPromise ??= bootstrap());
  return server(req, res);
}
