import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

describe("stage 9 checkout and order system", () => {
  it("contains checkout routes, service, migration, and endpoint tests", () => {
    const requiredPaths = [
      "apps/backend/src/routes/checkout.routes.ts",
      "apps/backend/src/services/checkout.service.ts",
      "apps/backend/prisma/migrations/20260506230000_update_order_status_for_checkout/migration.sql",
      "apps/backend/tests/checkout.test.ts"
    ];

    for (const path of requiredPaths) {
      assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
    }
  });

  it("exposes checkout and order endpoints", () => {
    const routes = readFileSync(join(root, "apps/backend/src/routes/checkout.routes.ts"), "utf8");
    const index = readFileSync(join(root, "apps/backend/src/routes/index.ts"), "utf8");

    assert.match(routes, /\/start/);
    assert.match(routes, /ordersRouter\.get\(\s*"\/"/);
    assert.match(routes, /ordersRouter\.get\(\s*"\/:id"/);
    assert.match(index, /\/checkout/);
    assert.match(index, /\/orders/);
  });

  it("supports the required order statuses", () => {
    const schema = readFileSync(join(root, "apps/backend/prisma/schema.prisma"), "utf8");

    for (const status of [
      "PENDING",
      "PAYMENT_PROCESSING",
      "PAID",
      "FAILED",
      "CANCELLED",
      "REFUNDED",
      "SHIPPED",
      "DELIVERED"
    ]) {
      assert.match(schema, new RegExp(status));
    }
  });

  it("contains transaction, stock reserve, and backend price recalculation safeguards", () => {
    const service = readFileSync(join(root, "apps/backend/src/services/checkout.service.ts"), "utf8");

    assert.match(service, /\$transaction/);
    assert.match(service, /ensureStock/);
    assert.match(service, /reserved/);
    assert.match(service, /resolveUnitPrice/);
    assert.match(service, /taxNok/);
    assert.match(service, /shippingNok/);
    assert.match(service, /EMPTY_CART/);
  });
});
