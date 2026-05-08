import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

test("frontend routes contain the register-to-order happy path screens", () => {
  const router = read("apps/frontend/src/app/router.tsx");

  for (const route of [
    "registrer",
    "produkter",
    "produkt/:slug",
    "handlekurv",
    "kasse",
    "betaling/suksess",
    "bestillinger"
  ]) {
    assert.match(router, new RegExp(route.replace("/", "\\/")));
  }
});

test("checkout starts backend order creation and completes mock payment", () => {
  const checkout = read("apps/frontend/src/pages/CheckoutPage.tsx");

  assert.match(checkout, /useStartCheckout/);
  assert.match(checkout, /clientTotalNok/);
  assert.match(checkout, /completeMockPayment\.mutateAsync/);
  assert.match(checkout, /navigate\(`\/betaling\/suksess/);
});

test("product detail adds selected variants to backend cart before opening drawer", () => {
  const productDetail = read("apps/frontend/src/pages/ProductDetailPage.tsx");

  assert.match(productDetail, /selectedVariant/);
  assert.match(productDetail, /useAddCartItem/);
  assert.match(productDetail, /addCartItem\.mutateAsync/);
  assert.match(productDetail, /openCart\(\)/);
});
