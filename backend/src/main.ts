import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { ApiExceptionFilter } from "@/common/filters/api-exception.filter";
import { AppModule } from "@/app.module";
import { createCorsOptions } from "@/config/cors";
import { serverEnv } from "@/lib/env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  app.enableCors(createCorsOptions());
  app.useGlobalFilters(new ApiExceptionFilter());
  app.setGlobalPrefix("");

  await app.listen(serverEnv.BACKEND_PORT);
  console.log(`Zealthy backend listening on http://localhost:${serverEnv.BACKEND_PORT}`);
}

void bootstrap();
