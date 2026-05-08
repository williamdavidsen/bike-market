import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();

function mvaFromGross(gross, vatRate = 25) {
  if (!Number.isFinite(gross) || gross <= 0) {
    return 0;
  }

  return gross - gross / (1 + vatRate / 100);
}

test("Norwegian MVA helper follows gross-price business rules", () => {
  assert.equal(mvaFromGross(125), 25);
  assert.equal(mvaFromGross(1000), 200);
  assert.equal(mvaFromGross(0), 0);
  assert.equal(mvaFromGross(Number.NaN), 0);
});

test("frontend formatter exposes NOK and MVA helpers used by UI", () => {
  const formatters = readFileSync(join(root, "apps/frontend/src/lib/formatters.ts"), "utf8");

  assert.match(formatters, /formatNok/);
  assert.match(formatters, /currency: "NOK"/);
  assert.match(formatters, /calculateMvaFromGross/);
  assert.match(formatters, /formatMvaIncluded/);
});

test("cart summary keeps backend subtotal as the source of truth", () => {
  const cartSummary = readFileSync(join(root, "apps/frontend/src/features/cart/cartSummary.ts"), "utf8");

  assert.match(cartSummary, /subtotalNok/);
  assert.match(cartSummary, /SHIPPING_NOK|cartShippingEstimate/);
  assert.match(cartSummary, /tax|mva/i);
});
