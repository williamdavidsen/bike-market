import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";
import { AppError } from "../src/errors/app-error.js";
import type {
  AddCartItemInput,
  CartItemView,
  CartService,
  CartView,
  UpdateCartItemInput
} from "../src/services/cart.service.js";
import { createAccessToken } from "../src/utils/token.js";

type VariantFixture = {
  id: string;
  sku: string;
  name: string;
  color: string | null;
  size: string | null;
  unitPriceNok: string;
  stock: number;
  product: {
    id: string;
    name: string;
    slug: string;
  };
};

class InMemoryCartService implements CartService {
  public readonly variants = new Map<string, VariantFixture>([
    [
      "variant-urban",
      {
        id: "variant-urban",
        sku: "URBAN-M-BLK",
        name: "Medium / Svart",
        color: "Svart",
        size: "M",
        unitPriceNok: "24990.00",
        stock: 3,
        product: {
          id: "prod-urban",
          name: "Bikemarket Urban E1",
          slug: "bikemarket-urban-e1"
        }
      }
    ]
  ]);

  private readonly carts = new Map<string, CartView>();
  private nextItemId = 1;

  public async getCart(userId: string): Promise<CartView> {
    return this.getOrCreateCart(userId);
  }

  public async addItem(userId: string, input: AddCartItemInput): Promise<CartView> {
    const cart = this.getOrCreateCart(userId);
    const variant = this.requireVariant(input.variantId);
    const existingItem = cart.items.find((item) => item.variantId === input.variantId);
    const nextQuantity = (existingItem?.quantity ?? 0) + input.quantity;

    this.ensureStock(variant, nextQuantity);

    if (existingItem) {
      existingItem.quantity = nextQuantity;
      existingItem.unitPriceNok = variant.unitPriceNok;
    } else {
      cart.items.push(this.createCartItem(variant, input.quantity));
    }

    return this.recalculate(cart);
  }

  public async updateItem(
    userId: string,
    itemId: string,
    input: UpdateCartItemInput
  ): Promise<CartView> {
    const cart = this.getOrCreateCart(userId);
    const item = this.requireCartItem(cart, itemId);
    const variant = this.requireVariant(item.variantId);

    this.ensureStock(variant, input.quantity);
    item.quantity = input.quantity;
    item.unitPriceNok = variant.unitPriceNok;

    return this.recalculate(cart);
  }

  public async removeItem(userId: string, itemId: string): Promise<CartView> {
    const cart = this.getOrCreateCart(userId);

    cart.items = cart.items.filter((item) => item.id !== itemId);

    return this.recalculate(cart);
  }

  public async clearCart(userId: string): Promise<CartView> {
    const cart = this.getOrCreateCart(userId);

    cart.items = [];

    return this.recalculate(cart);
  }

  private getOrCreateCart(userId: string): CartView {
    const existingCart = this.carts.get(userId);

    if (existingCart) {
      return existingCart;
    }

    const cart: CartView = {
      id: `cart-${userId}`,
      userId,
      currency: "NOK",
      items: [],
      summary: {
        subtotalNok: "0.00",
        itemCount: 0
      }
    };

    this.carts.set(userId, cart);

    return cart;
  }

  private requireVariant(variantId: string): VariantFixture {
    const variant = this.variants.get(variantId);

    if (!variant) {
      throw new AppError("Product variant was not found", 404, "VARIANT_NOT_FOUND");
    }

    return variant;
  }

  private requireCartItem(cart: CartView, itemId: string): CartItemView {
    const item = cart.items.find((cartItem) => cartItem.id === itemId);

    if (!item) {
      throw new AppError("Cart item was not found", 404, "CART_ITEM_NOT_FOUND");
    }

    return item;
  }

  private ensureStock(variant: VariantFixture, quantity: number): void {
    if (quantity > variant.stock) {
      throw new AppError("Requested quantity exceeds available stock", 409, "INSUFFICIENT_STOCK");
    }
  }

  private createCartItem(variant: VariantFixture, quantity: number): CartItemView {
    return {
      id: `item-${this.nextItemId++}`,
      variantId: variant.id,
      quantity,
      unitPriceNok: variant.unitPriceNok,
      lineTotalNok: "0.00",
      product: variant.product,
      variant: {
        id: variant.id,
        sku: variant.sku,
        name: variant.name,
        color: variant.color,
        size: variant.size
      }
    };
  }

  private recalculate(cart: CartView): CartView {
    let subtotal = 0;
    let itemCount = 0;

    for (const item of cart.items) {
      const lineTotal = Number(item.unitPriceNok) * item.quantity;

      item.lineTotalNok = lineTotal.toFixed(2);
      subtotal += lineTotal;
      itemCount += item.quantity;
    }

    cart.summary = {
      subtotalNok: subtotal.toFixed(2),
      itemCount
    };

    return cart;
  }
}

function accessToken(): string {
  return createAccessToken({
    id: "user-1",
    email: "kunde@example.com",
    role: "CUSTOMER"
  });
}

describe("cart endpoints", () => {
  it("requires authentication", async () => {
    const response = await request(createApp({ cartService: new InMemoryCartService() }))
      .get("/api/cart")
      .expect(401);

    assert.equal(response.body.error.code, "UNAUTHENTICATED");
  });

  it("adds an item to the current user's cart", async () => {
    const response = await request(createApp({ cartService: new InMemoryCartService() }))
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${accessToken()}`)
      .send({ variantId: "variant-urban", quantity: 1 })
      .expect(201);

    assert.equal(response.body.data.cart.items.length, 1);
    assert.equal(response.body.data.cart.items[0].quantity, 1);
    assert.equal(response.body.data.cart.summary.subtotalNok, "24990.00");
  });

  it("increments quantity when the same product variant is added again", async () => {
    const service = new InMemoryCartService();
    const app = createApp({ cartService: service });
    const token = accessToken();

    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ variantId: "variant-urban", quantity: 1 })
      .expect(201);

    const response = await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ variantId: "variant-urban", quantity: 2 })
      .expect(201);

    assert.equal(response.body.data.cart.items.length, 1);
    assert.equal(response.body.data.cart.items[0].quantity, 3);
    assert.equal(response.body.data.cart.summary.subtotalNok, "74970.00");
  });

  it("blocks quantities above available stock", async () => {
    const response = await request(createApp({ cartService: new InMemoryCartService() }))
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${accessToken()}`)
      .send({ variantId: "variant-urban", quantity: 4 })
      .expect(409);

    assert.equal(response.body.error.code, "INSUFFICIENT_STOCK");
  });

  it("updates, removes, and clears cart items", async () => {
    const service = new InMemoryCartService();
    const app = createApp({ cartService: service });
    const token = accessToken();

    const added = await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ variantId: "variant-urban", quantity: 2 })
      .expect(201);

    const itemId = added.body.data.cart.items[0].id;

    const updated = await request(app)
      .patch(`/api/cart/items/${itemId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 1 })
      .expect(200);

    assert.equal(updated.body.data.cart.summary.subtotalNok, "24990.00");

    const removed = await request(app)
      .delete(`/api/cart/items/${itemId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    assert.equal(removed.body.data.cart.items.length, 0);

    await request(app)
      .post("/api/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ variantId: "variant-urban", quantity: 1 })
      .expect(201);

    const cleared = await request(app)
      .delete("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    assert.equal(cleared.body.data.cart.summary.subtotalNok, "0.00");
  });
});
