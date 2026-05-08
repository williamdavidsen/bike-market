import { Router } from "express";
import { z } from "zod";
import { AppError } from "../errors/app-error.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate-request.middleware.js";
import type { AuthService } from "../services/auth.service.js";
import { authService } from "../services/auth.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(3).optional()
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1)
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
});

function requireRequestUserId(userId: string | undefined): string {
  if (!userId) {
    throw new AppError("Authentication token is required", 401, "UNAUTHENTICATED");
  }

  return userId;
}

export function createAuthRouter(service: AuthService = authService) {
  const router = Router();

  router.post(
    "/register",
    validateRequest({ body: registerSchema }),
    asyncHandler(async (req, res) => {
      const result = await service.register(req.body);

      sendSuccess(res, result, "User registered", 201);
    })
  );

  router.post(
    "/login",
    validateRequest({ body: loginSchema }),
    asyncHandler(async (req, res) => {
      const result = await service.login(req.body);

      sendSuccess(res, result, "Login successful");
    })
  );

  router.post(
    "/refresh",
    validateRequest({ body: refreshTokenSchema }),
    asyncHandler(async (req, res) => {
      const tokens = await service.refresh(req.body.refreshToken);

      sendSuccess(res, { tokens }, "Token refreshed");
    })
  );

  router.post(
    "/logout",
    validateRequest({ body: refreshTokenSchema }),
    asyncHandler(async (req, res) => {
      await service.logout(req.body.refreshToken);

      sendSuccess(res, {}, "Logout successful");
    })
  );

  router.get(
    "/me",
    requireAuth,
    asyncHandler(async (req, res) => {
      const user = await service.getCurrentUser(requireRequestUserId(req.user?.id));

      sendSuccess(res, { user }, "Current user");
    })
  );

  return router;
}
