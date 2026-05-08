import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/app-error.js";
import type { UserRole } from "../types/auth.js";
import { verifyAccessToken } from "../utils/token.js";

function readBearerToken(req: Request): string {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Authentication token is required", 401, "UNAUTHENTICATED");
  }

  return header.slice("Bearer ".length).trim();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    req.user = verifyAccessToken(readBearerToken(req));
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError("Authentication token has expired", 401, "TOKEN_EXPIRED"));
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError("Authentication token is invalid", 401, "UNAUTHENTICATED"));
      return;
    }

    next(error);
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Authentication token is required", 401, "UNAUTHENTICATED"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError("This action requires a different role", 403, "FORBIDDEN"));
      return;
    }

    next();
  };
}
