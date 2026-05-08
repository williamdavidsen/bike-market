import { randomUUID } from "node:crypto";
import { prisma } from "../db/prisma.js";
import { AppError } from "../errors/app-error.js";

export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "SHIPPED"
  | "DELIVERED";

export type ShippingAddressInput = {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string | null;
  postalCode: string;
  city: string;
  country?: string;
};

export type CheckoutStartInput = {
  shippingAddress: ShippingAddressInput;
  clientTotalNok?: string;
};

export type OrderItemView = {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  quantity: number;
  unitPriceNok: string;
  lineTotalNok: string;
};

export type OrderView = {
  id: string;
  userId: string | null;
  orderNumber: string;
  status: OrderStatus;
  currency: string;
  subtotalNok: string;
  shippingNok: string;
  taxNok: string;
  totalNok: string;
  email: string;
  shippingName: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingPostal: string;
  shippingCity: string;
  shippingCountry: string;
  items: OrderItemView[];
};

export interface CheckoutService {
  startCheckout(userId: string, userEmail: string, input: CheckoutStartInput): Promise<OrderView>;
  listOrders(userId: string): Promise<OrderView[]>;
  getOrder(userId: string, orderId: string): Promise<OrderView>;
}

type DecimalLike = {
  toString(): string;
};

type DatabaseCartItem = {
  id: string;
  variantId: string;
  quantity: number;
  variant: {
    id: string;
    sku: string;
    name: string;
    priceNok: DecimalLike | string | number | null;
    inventory: {
      id: string;
      quantity: number;
      reserved: number;
    } | null;
    product: {
      id: string;
      name: string;
      basePriceNok: DecimalLike | string | number;
      salePriceNok: DecimalLike | string | number | null;
    };
  };
};

type DatabaseCart = {
  id: string;
  userId: string | null;
  items: DatabaseCartItem[];
};

type DatabaseOrder = {
  id: string;
  userId: string | null;
  orderNumber: string;
  status: OrderStatus;
  currency: string;
  subtotalNok: DecimalLike | string | number;
  shippingNok: DecimalLike | string | number;
  taxNok: DecimalLike | string | number;
  totalNok: DecimalLike | string | number;
  email: string;
  shippingName: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingPostal: string;
  shippingCity: string;
  shippingCountry: string;
  items: Array<{
    id: string;
    productId: string;
    variantId: string | null;
    productName: string;
    variantName: string | null;
    sku: string | null;
    quantity: number;
    unitPriceNok: DecimalLike | string | number;
    lineTotalNok: DecimalLike | string | number;
  }>;
};

type PrismaCheckoutTx = {
  cart: {
    findFirst(args: unknown): Promise<DatabaseCart | null>;
    update(args: unknown): Promise<unknown>;
  };
  inventory: {
    update(args: unknown): Promise<unknown>;
  };
  order: {
    create(args: unknown): Promise<DatabaseOrder>;
    findMany(args: unknown): Promise<DatabaseOrder[]>;
    findFirst(args: unknown): Promise<DatabaseOrder | null>;
  };
};

type PrismaCheckoutClient = PrismaCheckoutTx & {
  $transaction<T>(callback: (tx: PrismaCheckoutTx) => Promise<T>): Promise<T>;
};

const checkoutClient = prisma as unknown as PrismaCheckoutClient;
const vatRate = 0.25;
const freeShippingThreshold = 1000;
const standardShippingNok = 99;

function decimalToNumber(value: DecimalLike | string | number | null): number {
  if (value === null) {
    return 0;
  }

  return Number(value.toString());
}

function money(value: number): string {
  return value.toFixed(2);
}

function orderInclude() {
  return {
    items: {
      orderBy: { id: "asc" }
    }
  };
}

function checkoutCartInclude() {
  return {
    items: {
      include: {
        variant: {
          include: {
            inventory: true,
            product: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    }
  };
}

function resolveUnitPrice(item: DatabaseCartItem): number {
  return decimalToNumber(
    item.variant.priceNok ?? item.variant.product.salePriceNok ?? item.variant.product.basePriceNok
  );
}

function ensureCartCanCheckout(cart: DatabaseCart): void {
  if (cart.items.length === 0) {
    throw new AppError("Cart is empty", 400, "EMPTY_CART");
  }
}

function ensureStock(item: DatabaseCartItem): void {
  const inventory = item.variant.inventory;
  const available = inventory ? inventory.quantity - inventory.reserved : 0;

  if (item.quantity > available) {
    throw new AppError("Requested quantity exceeds available stock", 409, "INSUFFICIENT_STOCK");
  }
}

function shippingForSubtotal(subtotal: number): number {
  return subtotal >= freeShippingThreshold ? 0 : standardShippingNok;
}

function createOrderNumber(): string {
  return `SYK-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function mapOrder(order: DatabaseOrder): OrderView {
  return {
    id: order.id,
    userId: order.userId,
    orderNumber: order.orderNumber,
    status: order.status,
    currency: order.currency,
    subtotalNok: money(decimalToNumber(order.subtotalNok)),
    shippingNok: money(decimalToNumber(order.shippingNok)),
    taxNok: money(decimalToNumber(order.taxNok)),
    totalNok: money(decimalToNumber(order.totalNok)),
    email: order.email,
    shippingName: order.shippingName,
    shippingLine1: order.shippingLine1,
    shippingLine2: order.shippingLine2,
    shippingPostal: order.shippingPostal,
    shippingCity: order.shippingCity,
    shippingCountry: order.shippingCountry,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      variantName: item.variantName,
      sku: item.sku,
      quantity: item.quantity,
      unitPriceNok: money(decimalToNumber(item.unitPriceNok)),
      lineTotalNok: money(decimalToNumber(item.lineTotalNok))
    }))
  };
}

export class PrismaCheckoutService implements CheckoutService {
  public async startCheckout(
    userId: string,
    userEmail: string,
    input: CheckoutStartInput
  ): Promise<OrderView> {
    return checkoutClient.$transaction(async (tx) => {
      const cart = await tx.cart.findFirst({
        where: { userId, status: "ACTIVE" },
        include: checkoutCartInclude()
      });

      if (!cart) {
        throw new AppError("Cart is empty", 400, "EMPTY_CART");
      }

      ensureCartCanCheckout(cart);

      const orderItems = cart.items.map((item) => {
        ensureStock(item);

        const unitPrice = resolveUnitPrice(item);

        return {
          productId: item.variant.product.id,
          variantId: item.variantId,
          productName: item.variant.product.name,
          variantName: item.variant.name,
          sku: item.variant.sku,
          quantity: item.quantity,
          unitPriceNok: money(unitPrice),
          lineTotalNok: money(unitPrice * item.quantity)
        };
      });

      const subtotal = orderItems.reduce((sum, item) => sum + Number(item.lineTotalNok), 0);
      const shipping = shippingForSubtotal(subtotal);
      const tax = subtotal * vatRate;
      const total = subtotal + shipping + tax;
      const shippingName = `${input.shippingAddress.firstName} ${input.shippingAddress.lastName}`;

      for (const item of cart.items) {
        const inventory = item.variant.inventory;

        if (!inventory) {
          throw new AppError(
            "Requested quantity exceeds available stock",
            409,
            "INSUFFICIENT_STOCK"
          );
        }

        await tx.inventory.update({
          where: { id: inventory.id },
          data: {
            reserved: inventory.reserved + item.quantity
          }
        });
      }

      const order = await tx.order.create({
        data: {
          userId,
          orderNumber: createOrderNumber(),
          status: "PENDING",
          currency: "NOK",
          subtotalNok: money(subtotal),
          shippingNok: money(shipping),
          taxNok: money(tax),
          totalNok: money(total),
          email: userEmail,
          shippingName,
          shippingLine1: input.shippingAddress.line1,
          shippingLine2: input.shippingAddress.line2,
          shippingPostal: input.shippingAddress.postalCode,
          shippingCity: input.shippingAddress.city,
          shippingCountry: input.shippingAddress.country ?? "NO",
          items: {
            create: orderItems
          }
        },
        include: orderInclude()
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: { status: "CONVERTED" }
      });

      return mapOrder(order);
    });
  }

  public async listOrders(userId: string): Promise<OrderView[]> {
    const orders = await checkoutClient.order.findMany({
      where: { userId },
      include: orderInclude(),
      orderBy: { createdAt: "desc" }
    });

    return orders.map(mapOrder);
  }

  public async getOrder(userId: string, orderId: string): Promise<OrderView> {
    const order = await checkoutClient.order.findFirst({
      where: { id: orderId, userId },
      include: orderInclude()
    });

    if (!order) {
      throw new AppError("Order was not found", 404, "ORDER_NOT_FOUND");
    }

    return mapOrder(order);
  }
}

export const checkoutService = new PrismaCheckoutService();
