import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

test("stage 16 checkout API starts checkout and supports mock payment webhook flow", () => {
  const api = read("apps/frontend/src/features/checkout/checkoutApi.ts");
  const queries = read("apps/frontend/src/features/checkout/checkoutQueries.ts");

  assert.match(api, /startCheckout/);
  assert.match(api, /\/checkout\/start/);
  assert.match(api, /completeMockPayment/);
  assert.match(api, /\/payments\/webhook/);
  assert.match(api, /x-payment-signature/);
  assert.match(api, /payment\.paid/);
  assert.match(queries, /useStartCheckout/);
  assert.match(queries, /useCompleteMockPayment/);
});

test("stage 16 CheckoutPage includes address, delivery, payment provider, order summary, and redirect states", () => {
  const page = read("apps/frontend/src/pages/CheckoutPage.tsx");

  for (const term of [
    "Adresse",
    "Levering",
    "Sendes hjem",
    "Hent i butikk",
    "Betaling",
    "Mock payment",
    "Vipps",
    "Stripe",
    "Klarna",
    "CartSummary",
    "startCheckout",
    "completeMockPayment",
    "navigate(`/betaling/suksess",
    "navigate(\"/betaling/feilet\")"
  ]) {
    assert.match(page, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `CheckoutPage should include ${term}`);
  }
});

test("stage 16 payment success and failed pages are routed", () => {
  const router = read("apps/frontend/src/app/router.tsx");
  const success = read("apps/frontend/src/pages/PaymentSuccessPage.tsx");
  const failed = read("apps/frontend/src/pages/PaymentFailedPage.tsx");

  assert.match(router, /betaling\/suksess/);
  assert.match(router, /betaling\/feilet/);
  assert.match(success, /PaymentSuccessPage/);
  assert.match(success, /Mine bestillinger/);
  assert.match(failed, /PaymentFailedPage/);
  assert.match(failed, /Prøv igjen/);
});

test("stage 16 checkout does not trust frontend totals for prices", () => {
  const page = read("apps/frontend/src/pages/CheckoutPage.tsx");
  const summary = read("apps/frontend/src/components/cart/CartSummary.tsx");

  assert.match(page, /clientTotalNok/);
  assert.match(summary, /Subtotal fra backend/);
  assert.match(summary, /Produktpriser og subtotal hentes fra backend/);
});
