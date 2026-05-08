import type { Cart } from "../../types/api";

const SHIPPING_NOK = 99;
const FREE_SHIPPING_LIMIT_NOK = 999;
const MVA_RATE = 0.25;

export function cartSubtotal(cart: Cart | undefined): number {
  return Number(cart?.summary.subtotalNok ?? 0);
}

export function cartMvaIncluded(cart: Cart | undefined): number {
  const subtotal = cartSubtotal(cart);

  return subtotal - subtotal / (1 + MVA_RATE);
}

export function cartShippingEstimate(cart: Cart | undefined): number {
  const subtotal = cartSubtotal(cart);

  if (subtotal <= 0 || subtotal >= FREE_SHIPPING_LIMIT_NOK) {
    return 0;
  }

  return SHIPPING_NOK;
}

export function cartEstimatedTotal(cart: Cart | undefined): number {
  return cartSubtotal(cart) + cartShippingEstimate(cart);
}
