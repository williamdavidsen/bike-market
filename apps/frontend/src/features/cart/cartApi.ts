import { api } from "../../lib/api";
import type { AddCartItemInput, Cart, UpdateCartItemInput } from "../../types/api";

export async function fetchCart(): Promise<Cart> {
  const response = await api.get<{ cart: Cart }>("/cart");

  return response.cart;
}

export async function addCartItem(input: AddCartItemInput): Promise<Cart> {
  const response = await api.post<{ cart: Cart }>("/cart/items", input);

  return response.cart;
}

export async function updateCartItem(input: UpdateCartItemInput): Promise<Cart> {
  const response = await api.patch<{ cart: Cart }>(`/cart/items/${input.itemId}`, {
    quantity: input.quantity
  });

  return response.cart;
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const response = await api.delete<{ cart: Cart }>(`/cart/items/${itemId}`);

  return response.cart;
}

export async function clearCart(): Promise<Cart> {
  const response = await api.delete<{ cart: Cart }>("/cart");

  return response.cart;
}
