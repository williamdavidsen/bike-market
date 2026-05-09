import { AppError } from "../../errors/app-error.js";
import type { PaymentProvider, PaymentSession, VerifiedPaymentEvent } from "../payment-provider.js";
import type { OrderView } from "../../services/checkout.service.js";

type MockWebhookPayload = {
  eventId?: unknown;
  paymentId?: unknown;
  type?: unknown;
  providerTransactionId?: unknown;
};

export class MockPaymentProvider implements PaymentProvider {
  public async createPayment(order: OrderView): Promise<PaymentSession> {
    return {
      paymentId: `mock-payment-${order.id}`,
      provider: "MOCK",
      providerReference: `mock-ref-${order.orderNumber}`,
      redirectUrl: `https://mock-payments.bikemarket.local/pay/${order.id}`,
      amountNok: order.totalNok,
      currency: order.currency
    };
  }

  public async verifyWebhook(payload: unknown, signature: string): Promise<VerifiedPaymentEvent> {
    if (signature !== "mock-signature") {
      throw new AppError("Invalid payment webhook signature", 401, "INVALID_WEBHOOK_SIGNATURE");
    }

    const event = payload as MockWebhookPayload;

    if (
      typeof event.eventId !== "string" ||
      typeof event.paymentId !== "string" ||
      !["payment.paid", "payment.failed", "payment.refunded"].includes(String(event.type))
    ) {
      throw new AppError("Invalid payment webhook payload", 400, "INVALID_WEBHOOK_PAYLOAD");
    }

    return {
      eventId: event.eventId,
      paymentId: event.paymentId,
      type: event.type as VerifiedPaymentEvent["type"],
      providerTransactionId:
        typeof event.providerTransactionId === "string" ? event.providerTransactionId : undefined,
      payload: event as Record<string, unknown>
    };
  }

  public async refundPayment(_paymentId: string, _amount: number): Promise<void> {
    return Promise.resolve();
  }
}
