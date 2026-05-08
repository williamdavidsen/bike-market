import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate-request.middleware.js";
import type { PaymentService } from "../services/payment.service.js";
import { paymentService } from "../services/payment.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const refundParamSchema = z.object({
  id: z.string().min(1)
});

const refundBodySchema = z.object({
  amountNok: z.number().positive().optional()
});

function routeParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function createPaymentRouters(service: PaymentService = paymentService) {
  const paymentsRouter = Router();
  const adminRouter = Router();

  paymentsRouter.post(
    "/webhook",
    asyncHandler(async (req, res) => {
      const signature = req.header("x-payment-signature") ?? "";
      const result = await service.handleWebhook(req.body, signature);

      sendSuccess(
        res,
        result,
        result.processed ? "Webhook processed" : "Webhook already processed"
      );
    })
  );

  adminRouter.post(
    "/orders/:id/refund",
    requireAuth,
    requireRole("ADMIN"),
    validateRequest({ params: refundParamSchema, body: refundBodySchema }),
    asyncHandler(async (req, res) => {
      await service.refundOrder(routeParam(req.params.id), req.body.amountNok);

      sendSuccess(res, {}, "Refund requested");
    })
  );

  return {
    paymentsRouter,
    adminRouter
  };
}
