require("reflect-metadata");

const { NestFactory } = require("@nestjs/core");
const { ExpressAdapter } = require("@nestjs/platform-express");

const { ApiExceptionFilter } = require("../dist/common/filters/api-exception.filter");
const { AppModule } = require("../dist/app.module");
const { createCorsOptions } = require("../dist/config/cors");

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

module.exports = async function handler(req, res) {
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
};
