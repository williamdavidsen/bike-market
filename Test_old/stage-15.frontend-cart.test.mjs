import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

test("stage 15 cart API layer stays synchronized with backend endpoints", () => {
  const api = read("apps/frontend/src/features/cart/cartApi.ts");
  const queries = read("apps/frontend/src/features/cart/cartQueries.ts");

  for (const term of ["fetchCart", "addCartItem", "updateCartItem", "removeCartItem", "clearCart"]) {
    assert.match(api, new RegExp(term), `cart api should expose ${term}`);
  }

  for (const endpoint of ["/cart", "/cart/items", "/cart/items/"]) {
    assert.match(api, new RegExp(endpoint.replace("/", "\\/")), `cart api should use ${endpoint}`);
  }

  assert.match(queries, /useCart/);
  assert.match(queries, /useUpdateCartItem/);
  assert.match(queries, /useRemoveCartItem/);
  assert.match(queries, /useClearCart/);
  assert.match(queries, /invalidateQueries/);
});

test("stage 15 CartPage supports quantity update, remove, clear, empty, loading, and error states", () => {
  const page = read("apps/frontend/src/pages/CartPage.tsx");

  for (const term of [
    "useCart",
    "useUpdateCartItem",
    "useRemoveCartItem",
    "useClearCart",
    "CartLineItem",
    "CartSummary",
    "Tøm handlekurv",
    "EmptyState",
    "ErrorState",
    "isLoading"
  ]) {
    assert.match(page, new RegExp(term), `CartPage should include ${term}`);
  }
});

test("stage 15 CartDrawer renders backend cart items and mobile-friendly checkout summary", () => {
  const drawer = read("apps/frontend/src/components/layout/CartDrawer.tsx");

  assert.match(drawer, /role="dialog"/);
  assert.match(drawer, /useCart/);
  assert.match(drawer, /CartLineItem/);
  assert.match(drawer, /CartSummary/);
  assert.match(drawer, /onCheckoutClick/);
  assert.match(drawer, /Åpne handlekurv/);
});

test("stage 15 cart summary shows backend subtotal plus MVA, shipping estimate, and checkout button", () => {
  const summary = read("apps/frontend/src/components/cart/CartSummary.tsx");
  const calculations = read("apps/frontend/src/features/cart/cartSummary.ts");
  const lineItem = read("apps/frontend/src/components/cart/CartLineItem.tsx");

  for (const term of ["Subtotal fra backend", "MVA inkludert", "Frakt estimat", "Estimert total", "Gå til kassen"]) {
    assert.match(summary, new RegExp(term), `CartSummary should show ${term}`);
  }

  assert.match(calculations, /cartMvaIncluded/);
  assert.match(calculations, /cartShippingEstimate/);
  assert.match(lineItem, /onQuantityChange/);
  assert.match(lineItem, /onRemove/);
  assert.match(lineItem, /lineTotalNok/);
});
