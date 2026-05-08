import { Router } from "express";
import { createAuthRouter } from "./auth.routes.js";
import { createCartRouter } from "./cart.routes.js";
import { createCatalogRouters } from "./catalog.routes.js";
import { createCheckoutRouter } from "./checkout.routes.js";
import { healthRouter } from "./health.routes.js";
import { createPaymentRouters } from "./payment.routes.js";
import type { AuthService } from "../services/auth.service.js";
import type { CartService } from "../services/cart.service.js";
import type { CatalogService } from "../services/catalog.service.js";
import type { CheckoutService } from "../services/checkout.service.js";
import type { PaymentService } from "../services/payment.service.js";

type ApiRouterOptions = {
  authService?: AuthService;
  catalogService?: CatalogService;
  cartService?: CartService;
  checkoutService?: CheckoutService;
  paymentService?: PaymentService;
};

export function createApiRouter(options: ApiRouterOptions = {}) {
  const apiRouter = Router();
  const catalogRouters = createCatalogRouters(options.catalogService);
  const checkoutRouters = createCheckoutRouter(options.checkoutService, options.paymentService);
  const paymentRouters = createPaymentRouters(options.paymentService);

  apiRouter.use("/health", healthRouter);
  apiRouter.use("/auth", createAuthRouter(options.authService));
  apiRouter.use("/cart", createCartRouter(options.cartService));
  apiRouter.use("/checkout", checkoutRouters.checkoutRouter);
  apiRouter.use("/orders", checkoutRouters.ordersRouter);
  apiRouter.use("/payments", paymentRouters.paymentsRouter);
  apiRouter.use("/products", catalogRouters.productsRouter);
  apiRouter.use("/categories", catalogRouters.categoriesRouter);
  apiRouter.use("/brands", catalogRouters.brandsRouter);
  apiRouter.use("/admin", catalogRouters.adminRouter);
  apiRouter.use("/admin", paymentRouters.adminRouter);

  return apiRouter;
}
