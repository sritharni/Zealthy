import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import type { Response } from "express";

import { ApiError, isApiError } from "@/lib/http/api-error";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (isApiError(error)) {
      response.status(error.status).json({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      });
      return;
    }

    if (error instanceof ZodError) {
      response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        error: {
          code: "UNPROCESSABLE_ENTITY",
          message: "Validation failed",
          details: error.flatten(),
        },
      });
      return;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        response.status(HttpStatus.CONFLICT).json({
          error: {
            code: "CONFLICT",
            message: "A record with these values already exists",
            details: { target: error.meta?.target },
          },
        });
        return;
      }

      if (error.code === "P2025") {
        response.status(HttpStatus.NOT_FOUND).json({
          error: { code: "NOT_FOUND", message: "Resource not found" },
        });
        return;
      }
    }

    console.error("Unhandled API error:", error);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong" },
    });
  }
}
