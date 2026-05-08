import { prisma } from "../db/prisma.js";
import { AppError } from "../errors/app-error.js";

export type CartSummary = {
  subtotalNok: string;
  itemCount: number;
};

export type CartItemProduct = {
  id: string;
  name: string;
  slug: string;
};

export type CartItemVariant = {
  id: string;
  sku: string;
  name: string;
  color: string | null;
  size: string | null;
};

export type CartItemView = {
  id: string;
  variantId: string;
  quantity: number;
  unitPriceNok: string;
  lineTotalNok: string;
  product: CartItemProduct;
  variant: CartItemVariant;
};

export type CartView = {
  id: string;
  userId: string;
  currency: string;
  items: CartItemView[];
  summary: CartSummary;
};

export type AddCartItemInput = {
  variantId: string;
  quantity: number;
};

export type UpdateCartItemInput = {
  quantity: number;
};

export interface CartService {
  getCart(userId: string): Promise<CartView>;
  addItem(userId: string, input: AddCartItemInput): Promise<CartView>;
  updateItem(userId: string, itemId: string, input: UpdateCartItemInput): Promise<CartView>;
  removeItem(userId: string, itemId: string): Promise<CartView>;
  clearCart(userId: string): Promise<CartView>;
}

type DecimalLike = {
  toString(): string;
};

type DatabaseCartItem = {
  id: string;
  variantId: string;
  quantity: number;
  unitPriceNok: DecimalLike | string | number;
  variant: {
    id: string;
    sku: string;
    name: string;
    color: string | null;
    size: string | null;
    isActive: boolean;
    priceNok: DecimalLike | string | number | null;
    inventory: {
      quantity: number;
      reserved: number;
    } | null;
    product: {
      id: string;
      name: string;
      slug: string;
      basePriceNok: DecimalLike | string | number;
      salePriceNok: DecimalLike | string | number | null;
    };
  };
};

type DatabaseCart = {
  id: string;
  userId: string | null;
  currency: string;
  items: DatabaseCartItem[];
};

type DatabaseVariant = DatabaseCartItem["variant"];

type PrismaCartClient = {
  cart: {
    findFirst(args: unknown): Promise<DatabaseCart | null>;
    create(args: unknown): Promise<DatabaseCart>;
  };
  cartItem: {
    findFirst(args: unknown): Promise<DatabaseCartItem | null>;
    create(args: unknown): Promise<DatabaseCartItem>;
    update(args: unknown): Promise<DatabaseCartItem>;
    delete(args: unknown): Promise<DatabaseCartItem>;
    deleteMany(args: unknown): Promise<unknown>;
  };
  productVariant: {
    findUnique(args: unknown): Promise<DatabaseVariant | null>;
  };
};

const cartClient = prisma as unknown as PrismaCartClient;

function decimalToNumber(value: DecimalLike | string | number | null): number {
  if (value === null) {
    return 0;
  }

  return Number(value.toString());
}

function money(value: number): string {
  return value.toFixed(2);
}

function cartInclude() {
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

function variantInclude() {
  return {
    inventory: true,
    product: true
  };
}

function availableStock(variant: DatabaseVariant): number {
  if (!variant.inventory) {
    return 0;
  }

  return Math.max(variant.inventory.quantity - variant.inventory.reserved, 0);
}

function resolveUnitPrice(variant: DatabaseVariant): number {
  return decimalToNumber(
    variant.priceNok ?? variant.product.salePriceNok ?? variant.product.basePriceNok
  );
}

function mapCart(cart: DatabaseCart): CartView {
  const items = cart.items.map((item) => {
    const unitPrice = decimalToNumber(item.unitPriceNok);
    const lineTotal = unitPrice * item.quantity;

    return {
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPriceNok: money(unitPrice),
      lineTotalNok: money(lineTotal),
      product: {
        id: item.variant.product.id,
        name: item.variant.product.name,
        slug: item.variant.product.slug
      },
      variant: {
        id: item.variant.id,
        sku: item.variant.sku,
        name: item.variant.name,
        color: item.variant.color,
        size: item.variant.size
      }
    };
  });

  const subtotal = items.reduce((sum, item) => sum + Number(item.lineTotalNok), 0);

  return {
    id: cart.id,
    userId: cart.userId ?? "",
    currency: cart.currency,
    items,
    summary: {
      subtotalNok: money(subtotal),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
    }
  };
}

export class PrismaCartService implements CartService {
  public async getCart(userId: string): Promise<CartView> {
    return mapCart(await this.getOrCreateCart(userId));
  }

  public async addItem(userId: string, input: AddCartItemInput): Promise<CartView> {
    const cart = await this.getOrCreateCart(userId);
    const variant = await cartClient.productVariant.findUnique({
      where: { id: input.variantId },
      include: variantInclude()
    });

    if (!variant?.isActive) {
      throw new AppError("Product variant was not found", 404, "VARIANT_NOT_FOUND");
    }

    const existingItem = cart.items.find((item) => item.variantId === input.variantId);
    const nextQuantity = (existingItem?.quantity ?? 0) + input.quantity;

    this.ensureStock(variant, nextQuantity);

    if (existingItem) {
      await cartClient.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: nextQuantity,
          unitPriceNok: resolveUnitPrice(variant)
        }
      });
    } else {
      await cartClient.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: input.variantId,
          quantity: input.quantity,
          unitPriceNok: resolveUnitPrice(variant)
        }
      });
    }

    return this.getCart(userId);
  }

  public async updateItem(
    userId: string,
    itemId: string,
    input: UpdateCartItemInput
  ): Promise<CartView> {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((cartItem) => cartItem.id === itemId);

    if (!item) {
      throw new AppError("Cart item was not found", 404, "CART_ITEM_NOT_FOUND");
    }

    this.ensureStock(item.variant, input.quantity);

    await cartClient.cartItem.update({
      where: { id: itemId },
      data: {
        quantity: input.quantity,
        unitPriceNok: resolveUnitPrice(item.variant)
      }
    });

    return this.getCart(userId);
  }

  public async removeItem(userId: string, itemId: string): Promise<CartView> {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((cartItem) => cartItem.id === itemId);

    if (!item) {
      throw new AppError("Cart item was not found", 404, "CART_ITEM_NOT_FOUND");
    }

    await cartClient.cartItem.delete({ where: { id: itemId } });

    return this.getCart(userId);
  }

  public async clearCart(userId: string): Promise<CartView> {
    const cart = await this.getOrCreateCart(userId);

    await cartClient.cartItem.deleteMany({ where: { cartId: cart.id } });

    return this.getCart(userId);
  }

  private async getOrCreateCart(userId: string): Promise<DatabaseCart> {
    const existingCart = await cartClient.cart.findFirst({
      where: { userId, status: "ACTIVE" },
      include: cartInclude()
    });

    if (existingCart) {
      return existingCart;
    }

    return cartClient.cart.create({
      data: {
        userId,
        status: "ACTIVE",
        currency: "NOK"
      },
      include: cartInclude()
    });
  }

  private ensureStock(variant: DatabaseVariant, quantity: number): void {
    if (quantity > availableStock(variant)) {
      throw new AppError("Requested quantity exceeds available stock", 409, "INSUFFICIENT_STOCK");
    }
  }
}

export const cartService = new PrismaCartService();
