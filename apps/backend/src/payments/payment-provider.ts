import type { OrderView } from "../services/checkout.service.js";

export type PaymentSession = {
  paymentId: string;
  provider: "MOCK" | "STRIPE" | "VIPPS" | "KLARNA";
  providerReference: string;
  redirectUrl: string;
  amountNok: string;
  currency: string;
};

export type VerifiedPaymentEvent = {
  eventId: string;
  paymentId: string;
  type: "payment.paid" | "payment.failed" | "payment.refunded";
  providerTransactionId?: string;
  payload: Record<string, unknown>;
};

export interface PaymentProvider {
  createPayment(order: OrderView): Promise<PaymentSession>;
  verifyWebhook(payload: unknown, signature: string): Promise<VerifiedPaymentEvent>;
  refundPayment(paymentId: string, amount: number): Promise<void>;
}
