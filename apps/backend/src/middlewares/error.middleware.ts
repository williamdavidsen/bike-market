import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/app-error.js";
import { logger } from "../utils/logger.js";

type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export const errorMiddleware: ErrorRequestHandler = (error, req, res, _next): void => {
  const isKnownError = error instanceof AppError;
  const statusCode = isKnownError ? error.statusCode : 500;
  const code = isKnownError ? error.code : "INTERNAL_SERVER_ERROR";
  const message = isKnownError ? error.message : "Internal server error";

  if (!isKnownError || statusCode >= 500) {
    logger.error("Request failed", error, {
      method: req.method,
      path: req.originalUrl,
      statusCode
    });
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message
    }
  };

  res.status(statusCode).json(response);
};
