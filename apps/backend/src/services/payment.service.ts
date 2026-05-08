import { prisma } from "../db/prisma.js";
import { AppError } from "../errors/app-error.js";
import { MockPaymentProvider } from "../payments/providers/mock-payment.provider.js";
import type { PaymentProvider, PaymentSession } from "../payments/payment-provider.js";
import type { OrderView } from "./checkout.service.js";

export type PaymentWebhookResult = {
  processed: boolean;
  status: "PAID" | "FAILED" | "REFUNDED";
};

export interface PaymentService {
  createPaymentSession(order: OrderView): Promise<PaymentSession>;
  handleWebhook(payload: unknown, signature: string): Promise<PaymentWebhookResult>;
  refundOrder(orderId: string, amountNok?: number): Promise<void>;
}

type DecimalLike = {
  toString(): string;
};

type DatabasePayment = {
  id: string;
  orderId: string;
  status: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
  amountNok: DecimalLike | string | number;
};

type DatabaseOrder = {
  id: string;
  status:
    | "PENDING"
    | "PAYMENT_PROCESSING"
    | "PAID"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED"
    | "SHIPPED"
    | "DELIVERED";
  totalNok: DecimalLike | string | number;
  items: Array<{
    variantId: string | null;
    quantity: number;
  }>;
};

type DatabaseInventory = {
  id: string;
  variantId: string;
  quantity: number;
  reserved: number;
};

type PrismaPaymentTx = {
  payment: {
    create(args: unknown): Promise<DatabasePayment>;
    update(args: unknown): Promise<DatabasePayment>;
    findFirst(args: unknown): Promise<DatabasePayment | null>;
  };
  paymentEvent: {
    create(args: unknown): Promise<unknown>;
    findUnique(args: unknown): Promise<unknown | null>;
  };
  order: {
    update(args: unknown): Promise<DatabaseOrder>;
    findFirst(args: unknown): Promise<DatabaseOrder | null>;
  };
  inventory: {
    findUnique(args: unknown): Promise<DatabaseInventory | null>;
    update(args: unknown): Promise<unknown>;
  };
};

type PrismaPaymentClient = PrismaPaymentTx & {
  $transaction<T>(callback: (tx: PrismaPaymentTx) => Promise<T>): Promise<T>;
};

const paymentClient = prisma as unknown as PrismaPaymentClient;

function decimalToNumber(value: DecimalLike | string | number): number {
  return Number(value.toString());
}

export class PrismaPaymentService implements PaymentService {
  public constructor(private readonly provider: PaymentProvider = new MockPaymentProvider()) {}

  public async createPaymentSession(order: OrderView): Promise<PaymentSession> {
    const session = await this.provider.createPayment(order);

    await paymentClient.payment.create({
      data: {
        id: session.paymentId,
        orderId: order.id,
        provider: session.provider,
        status: "PENDING",
        amountNok: order.totalNok,
        currency: order.currency,
        providerReference: session.providerReference
      }
    });

    return session;
  }

  public async handleWebhook(payload: unknown, signature: string): Promise<PaymentWebhookResult> {
    const event = await this.provider.verifyWebhook(payload, signature);

    return paymentClient.$transaction(async (tx) => {
      const existingEvent = await tx.paymentEvent.findUnique({
        where: { eventId: event.eventId }
      });

      if (existingEvent) {
        return {
          processed: false,
          status: this.statusFromEvent(event.type)
        };
      }

      const payment = await tx.payment.findFirst({ where: { id: event.paymentId } });

      if (!payment) {
        throw new AppError("Payment was not found", 404, "PAYMENT_NOT_FOUND");
      }

      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          eventId: event.eventId,
          type: event.type,
          payload: event.payload
        }
      });

      if (event.type === "payment.paid") {
        await this.markPaymentPaid(tx, payment, event.providerTransactionId);
        return { processed: true, status: "PAID" };
      }

      if (event.type === "payment.failed") {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED", providerTransactionId: event.providerTransactionId }
        });
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: "FAILED" }
        });
        return { processed: true, status: "FAILED" };
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED", providerTransactionId: event.providerTransactionId }
      });
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: "REFUNDED" }
      });

      return { processed: true, status: "REFUNDED" };
    });
  }

  public async refundOrder(orderId: string, amountNok?: number): Promise<void> {
    const payment = await paymentClient.payment.findFirst({
      where: { orderId, status: "PAID" }
    });

    if (!payment) {
      throw new AppError("Paid payment was not found", 404, "PAYMENT_NOT_FOUND");
    }

    await this.provider.refundPayment(payment.id, amountNok ?? decimalToNumber(payment.amountNok));
  }

  private async markPaymentPaid(
    tx: PrismaPaymentTx,
    payment: DatabasePayment,
    providerTransactionId?: string
  ): Promise<void> {
    const order = await tx.order.findFirst({
      where: { id: payment.orderId },
      include: { items: true }
    });

    if (!order) {
      throw new AppError("Order was not found", 404, "ORDER_NOT_FOUND");
    }

    for (const item of order.items) {
      if (!item.variantId) {
        continue;
      }

      const inventory = await tx.inventory.findUnique({
        where: { variantId: item.variantId }
      });

      if (!inventory) {
        continue;
      }

      await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: Math.max(inventory.quantity - item.quantity, 0),
          reserved: Math.max(inventory.reserved - item.quantity, 0)
        }
      });
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        providerTransactionId
      }
    });
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID" }
    });
  }

  private statusFromEvent(type: "payment.paid" | "payment.failed" | "payment.refunded") {
    if (type === "payment.paid") {
      return "PAID";
    }

    if (type === "payment.failed") {
      return "FAILED";
    }

    return "REFUNDED";
  }
}

export const paymentService = new PrismaPaymentService();
