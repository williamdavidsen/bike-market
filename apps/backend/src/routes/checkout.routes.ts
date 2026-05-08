import { Router } from "express";
import { z } from "zod";
import { AppError } from "../errors/app-error.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate-request.middleware.js";
import type { CheckoutService } from "../services/checkout.service.js";
import { checkoutService } from "../services/checkout.service.js";
import type { PaymentService } from "../services/payment.service.js";
import { paymentService } from "../services/payment.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const idParamSchema = z.object({
  id: z.string().min(1)
});

const checkoutStartSchema = z.object({
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    line1: z.string().min(1),
    line2: z.string().nullable().optional(),
    postalCode: z.string().min(3),
    city: z.string().min(1),
    country: z.string().min(2).default("NO")
  }),
  clientTotalNok: z.string().optional()
});

function currentUser(user: Express.Request["user"]) {
  if (!user) {
    throw new AppError("Authentication token is required", 401, "UNAUTHENTICATED");
  }

  return user;
}

function routeParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function createCheckoutRouter(
  service: CheckoutService = checkoutService,
  payments: PaymentService = paymentService
) {
  const checkoutRouter = Router();
  const ordersRouter = Router();

  checkoutRouter.use(requireAuth);
  ordersRouter.use(requireAuth);

  checkoutRouter.post(
    "/start",
    validateRequest({ body: checkoutStartSchema }),
    asyncHandler(async (req, res) => {
      const user = currentUser(req.user);
      const order = await service.startCheckout(user.id, user.email, req.body);
      const paymentSession = await payments.createPaymentSession(order);

      sendSuccess(res, { order, paymentSession }, "Checkout started", 201);
    })
  );

  ordersRouter.get(
    "/",
    asyncHandler(async (req, res) => {
      const user = currentUser(req.user);
      const orders = await service.listOrders(user.id);

      sendSuccess(res, { orders }, "Orders listed");
    })
  );

  ordersRouter.get(
    "/:id",
    validateRequest({ params: idParamSchema }),
    asyncHandler(async (req, res) => {
      const user = currentUser(req.user);
      const order = await service.getOrder(user.id, routeParam(req.params.id));

      sendSuccess(res, { order }, "Order detail");
    })
  );

  return {
    checkoutRouter,
    ordersRouter
  };
}
