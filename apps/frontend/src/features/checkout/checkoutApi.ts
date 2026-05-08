import { api, apiRequest } from "../../lib/api";
import type { CheckoutStartInput, CheckoutStartResult, PaymentWebhookResult } from "../../types/api";

export async function startCheckout(input: CheckoutStartInput): Promise<CheckoutStartResult> {
  return api.post<CheckoutStartResult>("/checkout/start", input);
}

export async function completeMockPayment(paymentId: string, orderId: string): Promise<PaymentWebhookResult> {
  return apiRequest<PaymentWebhookResult>("/payments/webhook", {
    method: "POST",
    headers: {
      "x-payment-signature": "mock-signature"
    },
    body: {
      eventId: `mock-paid-${orderId}-${Date.now()}`,
      paymentId,
      type: "payment.paid",
      providerTransactionId: `mock-tx-${orderId}`
    }
  });
}
