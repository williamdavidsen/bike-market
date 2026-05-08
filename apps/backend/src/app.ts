import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { createApiRouter } from "./routes/index.js";
import type { AuthService } from "./services/auth.service.js";
import type { CartService } from "./services/cart.service.js";
import type { CatalogService } from "./services/catalog.service.js";
import type { CheckoutService } from "./services/checkout.service.js";
import type { PaymentService } from "./services/payment.service.js";

type CreateAppOptions = {
  authService?: AuthService;
  catalogService?: CatalogService;
  cartService?: CartService;
  checkoutService?: CheckoutService;
  paymentService?: PaymentService;
};

const allowedFrontendOrigins = new Set([
  env.FRONTEND_URL,
  env.FRONTEND_URL.replace("localhost", "127.0.0.1")
]);

export function createApp(options: CreateAppOptions = {}) {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedFrontendOrigins.has(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      },
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: "draft-8",
      legacyHeaders: false
    })
  );

  app.use(
    "/api",
    createApiRouter({
      authService: options.authService,
      catalogService: options.catalogService,
      cartService: options.cartService,
      checkoutService: options.checkoutService,
      paymentService: options.paymentService
    })
  );
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
