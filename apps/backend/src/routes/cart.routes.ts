import { Router } from "express";
import { z } from "zod";
import { AppError } from "../errors/app-error.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate-request.middleware.js";
import type { CartService } from "../services/cart.service.js";
import { cartService } from "../services/cart.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const idParamSchema = z.object({
  id: z.string().min(1)
});

const addCartItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().positive()
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().positive()
});

function currentUserId(userId: string | undefined): string {
  if (!userId) {
    throw new AppError("Authentication token is required", 401, "UNAUTHENTICATED");
  }

  return userId;
}

function routeParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function createCartRouter(service: CartService = cartService) {
  const router = Router();

  router.use(requireAuth);

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const cart = await service.getCart(currentUserId(req.user?.id));

      sendSuccess(res, { cart }, "Cart fetched");
    })
  );

  router.post(
    "/items",
    validateRequest({ body: addCartItemSchema }),
    asyncHandler(async (req, res) => {
      const cart = await service.addItem(currentUserId(req.user?.id), req.body);

      sendSuccess(res, { cart }, "Cart item added", 201);
    })
  );

  router.patch(
    "/items/:id",
    validateRequest({ params: idParamSchema, body: updateCartItemSchema }),
    asyncHandler(async (req, res) => {
      const cart = await service.updateItem(
        currentUserId(req.user?.id),
        routeParam(req.params.id),
        req.body
      );

      sendSuccess(res, { cart }, "Cart item updated");
    })
  );

  router.delete(
    "/items/:id",
    validateRequest({ params: idParamSchema }),
    asyncHandler(async (req, res) => {
      const cart = await service.removeItem(currentUserId(req.user?.id), routeParam(req.params.id));

      sendSuccess(res, { cart }, "Cart item removed");
    })
  );

  router.delete(
    "/",
    asyncHandler(async (req, res) => {
      const cart = await service.clearCart(currentUserId(req.user?.id));

      sendSuccess(res, { cart }, "Cart cleared");
    })
  );

  return router;
}
