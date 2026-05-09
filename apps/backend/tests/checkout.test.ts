import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";
import { AppError } from "../src/errors/app-error.js";
import type {
  CheckoutService,
  CheckoutStartInput,
  OrderView
} from "../src/services/checkout.service.js";
import type { PaymentService, PaymentWebhookResult } from "../src/services/payment.service.js";
import type { PaymentSession } from "../src/payments/payment-provider.js";
import { createAccessToken } from "../src/utils/token.js";

type CartItemFixture = {
  variantId: string;
  quantity: number;
  productId: string;
  productName: string;
  variantName: string;
  sku: string;
  dbUnitPriceNok: string;
};

class InMemoryCheckoutService implements CheckoutService {
  public reservedStock = 0;
  public readonly orders: OrderView[] = [];
  public cartItems: CartItemFixture[] = [
    {
      variantId: "variant-urban",
      quantity: 2,
      productId: "prod-urban",
      productName: "Bikemarket Urban E1",
      variantName: "Medium / Svart",
      sku: "URBAN-M-BLK",
      dbUnitPriceNok: "24990.00"
    }
  ];

  public availableStock = 4;

  public async startCheckout(
    userId: string,
    userEmail: string,
    input: CheckoutStartInput
  ): Promise<OrderView> {
    if (this.cartItems.length === 0) {
      throw new AppError("Cart is empty", 400, "EMPTY_CART");
    }

    const requestedQuantity = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);

    if (requestedQuantity > this.availableStock - this.reservedStock) {
      throw new AppError("Requested quantity exceeds available stock", 409, "INSUFFICIENT_STOCK");
    }

    const items = this.cartItems.map((item, index) => {
      const lineTotal = Number(item.dbUnitPriceNok) * item.quantity;

      return {
        id: `order-item-${index + 1}`,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        variantName: item.variantName,
        sku: item.sku,
        quantity: item.quantity,
        unitPriceNok: Number(item.dbUnitPriceNok).toFixed(2),
        lineTotalNok: lineTotal.toFixed(2)
      };
    });
    const subtotal = items.reduce((sum, item) => sum + Number(item.lineTotalNok), 0);
    const shipping = subtotal >= 1000 ? 0 : 99;
    const tax = subtotal * 0.25;
    const total = subtotal + shipping + tax;
    const shippingName = `${input.shippingAddress.firstName} ${input.shippingAddress.lastName}`;

    this.reservedStock += requestedQuantity;
    this.cartItems = [];

    const order: OrderView = {
      id: `order-${this.orders.length + 1}`,
      userId,
      orderNumber: `SYK-TEST-${this.orders.length + 1}`,
      status: "PENDING",
      currency: "NOK",
      subtotalNok: subtotal.toFixed(2),
      shippingNok: shipping.toFixed(2),
      taxNok: tax.toFixed(2),
      totalNok: total.toFixed(2),
      email: userEmail,
      shippingName,
      shippingLine1: input.shippingAddress.line1,
      shippingLine2: input.shippingAddress.line2 ?? null,
      shippingPostal: input.shippingAddress.postalCode,
      shippingCity: input.shippingAddress.city,
      shippingCountry: input.shippingAddress.country ?? "NO",
      items
    };

    this.orders.push(order);

    return order;
  }

  public async listOrders(userId: string): Promise<OrderView[]> {
    return this.orders.filter((order) => order.userId === userId);
  }

  public async getOrder(userId: string, orderId: string): Promise<OrderView> {
    const order = this.orders.find((item) => item.id === orderId && item.userId === userId);

    if (!order) {
      throw new AppError("Order was not found", 404, "ORDER_NOT_FOUND");
    }

    return order;
  }
}

class InMemoryPaymentService implements PaymentService {
  public async createPaymentSession(order: OrderView): Promise<PaymentSession> {
    return {
      paymentId: `payment-${order.id}`,
      provider: "MOCK",
      providerReference: `ref-${order.orderNumber}`,
      redirectUrl: `https://mock.example.com/${order.id}`,
      amountNok: order.totalNok,
      currency: order.currency
    };
  }

  public async handleWebhook(): Promise<PaymentWebhookResult> {
    return { processed: true, status: "PAID" };
  }

  public async refundOrder(): Promise<void> {
    return Promise.resolve();
  }
}

function createCheckoutTestApp(service = new InMemoryCheckoutService()) {
  return createApp({
    checkoutService: service,
    paymentService: new InMemoryPaymentService()
  });
}

function accessToken(): string {
  return createAccessToken({
    id: "user-1",
    email: "kunde@example.com",
    role: "CUSTOMER"
  });
}

function checkoutPayload(clientTotalNok = "1.00") {
  return {
    clientTotalNok,
    shippingAddress: {
      firstName: "Kari",
      lastName: "Nordmann",
      line1: "Storgata 1",
      postalCode: "0155",
      city: "Oslo",
      country: "NO"
    }
  };
}

describe("checkout and order endpoints", () => {
  it("creates an order from the authenticated user's cart", async () => {
    const response = await request(createCheckoutTestApp())
      .post("/api/checkout/start")
      .set("Authorization", `Bearer ${accessToken()}`)
      .send(checkoutPayload())
      .expect(201);

    assert.equal(response.body.success, true);
    assert.equal(response.body.data.order.status, "PENDING");
    assert.equal(response.body.data.order.items.length, 1);
    assert.equal(response.body.data.order.items[0].productName, "Bikemarket Urban E1");
    assert.equal(response.body.data.paymentSession.provider, "MOCK");
    assert.equal(response.body.data.paymentSession.amountNok, response.body.data.order.totalNok);
  });

  it("calculates totals from backend prices and ignores frontend totals", async () => {
    const response = await request(createCheckoutTestApp())
      .post("/api/checkout/start")
      .set("Authorization", `Bearer ${accessToken()}`)
      .send(checkoutPayload("0.01"))
      .expect(201);

    assert.equal(response.body.data.order.subtotalNok, "49980.00");
    assert.equal(response.body.data.order.taxNok, "12495.00");
    assert.equal(response.body.data.order.shippingNok, "0.00");
    assert.equal(response.body.data.order.totalNok, "62475.00");
  });

  it("increases reserved stock when checkout starts", async () => {
    const service = new InMemoryCheckoutService();

    await request(createCheckoutTestApp(service))
      .post("/api/checkout/start")
      .set("Authorization", `Bearer ${accessToken()}`)
      .send(checkoutPayload())
      .expect(201);

    assert.equal(service.reservedStock, 2);
  });

  it("blocks checkout when the cart is empty", async () => {
    const service = new InMemoryCheckoutService();
    service.cartItems = [];

    const response = await request(createCheckoutTestApp(service))
      .post("/api/checkout/start")
      .set("Authorization", `Bearer ${accessToken()}`)
      .send(checkoutPayload())
      .expect(400);

    assert.equal(response.body.error.code, "EMPTY_CART");
  });

  it("lists and returns current user's orders", async () => {
    const service = new InMemoryCheckoutService();
    const app = createCheckoutTestApp(service);
    const token = accessToken();

    const created = await request(app)
      .post("/api/checkout/start")
      .set("Authorization", `Bearer ${token}`)
      .send(checkoutPayload())
      .expect(201);

    const orderId = created.body.data.order.id;
    const list = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    const detail = await request(app)
      .get(`/api/orders/${orderId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    assert.equal(list.body.data.orders.length, 1);
    assert.equal(detail.body.data.order.id, orderId);
  });
});
