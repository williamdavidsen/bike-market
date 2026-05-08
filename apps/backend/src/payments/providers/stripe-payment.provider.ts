import { AppError } from "../../errors/app-error.js";
import type { PaymentProvider, PaymentSession, VerifiedPaymentEvent } from "../payment-provider.js";
import type { OrderView } from "../../services/checkout.service.js";

export class StripePaymentProvider implements PaymentProvider {
  public async createPayment(_order: OrderView): Promise<PaymentSession> {
    throw new AppError("Stripe provider is not configured yet", 501, "PAYMENT_PROVIDER_NOT_READY");
  }

  public async verifyWebhook(_payload: unknown, _signature: string): Promise<VerifiedPaymentEvent> {
    throw new AppError("Stripe provider is not configured yet", 501, "PAYMENT_PROVIDER_NOT_READY");
  }

  public async refundPayment(_paymentId: string, _amount: number): Promise<void> {
    throw new AppError("Stripe provider is not configured yet", 501, "PAYMENT_PROVIDER_NOT_READY");
  }
}
