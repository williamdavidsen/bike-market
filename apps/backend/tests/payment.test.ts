import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";
import type { PaymentSession } from "../src/payments/payment-provider.js";
import type { PaymentService, PaymentWebhookResult } from "../src/services/payment.service.js";
import { createAccessToken } from "../src/utils/token.js";

class InMemoryPaymentService implements PaymentService {
  public orderStatus = "PENDING";
  public paymentStatus = "PENDING";
  public quantity = 5;
  public reserved = 2;
  public readonly eventIds = new Set<string>();
  public refundedOrderId: string | null = null;

  public async createPaymentSession(): Promise<PaymentSession> {
    return {
      paymentId: "payment-1",
      provider: "MOCK",
      providerReference: "ref-1",
      redirectUrl: "https://mock.example.com/pay/payment-1",
      amountNok: "100.00",
      currency: "NOK"
    };
  }

  public async handleWebhook(payload: unknown, signature: string): Promise<PaymentWebhookResult> {
    if (signature !== "mock-signature") {
      throw new Error("Invalid signature");
    }

    const event = payload as { eventId: string; type: "payment.paid" | "payment.failed" };

    if (this.eventIds.has(event.eventId)) {
      return { processed: false, status: event.type === "payment.paid" ? "PAID" : "FAILED" };
    }

    this.eventIds.add(event.eventId);

    if (event.type === "payment.paid") {
      this.paymentStatus = "PAID";
      this.orderStatus = "PAID";
      this.quantity -= 2;
      this.reserved -= 2;
      return { processed: true, status: "PAID" };
    }

    this.paymentStatus = "FAILED";
    this.orderStatus = "FAILED";
    return { processed: true, status: "FAILED" };
  }

  public async refundOrder(orderId: string): Promise<void> {
    this.refundedOrderId = orderId;
  }
}

function adminToken(): string {
  return createAccessToken({
    id: "admin-1",
    email: "admin@example.com",
    role: "ADMIN"
  });
}

function customerToken(): string {
  return createAccessToken({
    id: "customer-1",
    email: "customer@example.com",
    role: "CUSTOMER"
  });
}

describe("payment webhook endpoints", () => {
  it("processes a successful payment webhook and captures stock", async () => {
    const service = new InMemoryPaymentService();
    const response = await request(createApp({ paymentService: service }))
      .post("/api/payments/webhook")
      .set("x-payment-signature", "mock-signature")
      .send({ eventId: "evt-1", paymentId: "payment-1", type: "payment.paid" })
      .expect(200);

    assert.equal(response.body.data.processed, true);
    assert.equal(service.orderStatus, "PAID");
    assert.equal(service.paymentStatus, "PAID");
    assert.equal(service.quantity, 3);
    assert.equal(service.reserved, 0);
  });

  it("is idempotent for duplicate webhook events", async () => {
    const service = new InMemoryPaymentService();
    const app = createApp({ paymentService: service });
    const payload = { eventId: "evt-duplicate", paymentId: "payment-1", type: "payment.paid" };

    await request(app)
      .post("/api/payments/webhook")
      .set("x-payment-signature", "mock-signature")
      .send(payload)
      .expect(200);

    const duplicate = await request(app)
      .post("/api/payments/webhook")
      .set("x-payment-signature", "mock-signature")
      .send(payload)
      .expect(200);

    assert.equal(duplicate.body.data.processed, false);
    assert.equal(service.quantity, 3);
    assert.equal(service.reserved, 0);
  });
});

describe("admin payment actions", () => {
  it("blocks customers from refunding orders", async () => {
    const response = await request(createApp({ paymentService: new InMemoryPaymentService() }))
      .post("/api/admin/orders/order-1/refund")
      .set("Authorization", `Bearer ${customerToken()}`)
      .send({ amountNok: 100 })
      .expect(403);

    assert.equal(response.body.error.code, "FORBIDDEN");
  });

  it("allows admins to request a refund", async () => {
    const service = new InMemoryPaymentService();

    await request(createApp({ paymentService: service }))
      .post("/api/admin/orders/order-1/refund")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ amountNok: 100 })
      .expect(200);

    assert.equal(service.refundedOrderId, "order-1");
  });
});
