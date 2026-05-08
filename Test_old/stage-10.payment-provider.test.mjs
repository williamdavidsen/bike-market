import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

describe("stage 10 payment provider architecture", () => {
  it("contains provider interface, providers, service, routes, and tests", () => {
    const requiredPaths = [
      "apps/backend/src/payments/payment-provider.ts",
      "apps/backend/src/payments/providers/mock-payment.provider.ts",
      "apps/backend/src/payments/providers/stripe-payment.provider.ts",
      "apps/backend/src/payments/providers/vipps-payment.provider.ts",
      "apps/backend/src/services/payment.service.ts",
      "apps/backend/src/routes/payment.routes.ts",
      "apps/backend/tests/payment.test.ts"
    ];

    for (const path of requiredPaths) {
      assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
    }
  });

  it("exposes webhook and admin refund endpoints", () => {
    const routes = readFileSync(join(root, "apps/backend/src/routes/payment.routes.ts"), "utf8");
    const index = readFileSync(join(root, "apps/backend/src/routes/index.ts"), "utf8");

    assert.match(routes, /\/webhook/);
    assert.match(routes, /\/orders\/:id\/refund/);
    assert.match(routes, /requireRole\("ADMIN"\)/);
    assert.match(index, /\/payments/);
    assert.match(index, /paymentRouters\.adminRouter/);
  });

  it("contains webhook signature, idempotency, event storage, and stock capture safeguards", () => {
    const service = readFileSync(join(root, "apps/backend/src/services/payment.service.ts"), "utf8");
    const provider = readFileSync(
      join(root, "apps/backend/src/payments/providers/mock-payment.provider.ts"),
      "utf8"
    );
    const schema = readFileSync(join(root, "apps/backend/prisma/schema.prisma"), "utf8");

    assert.match(provider, /signature/);
    assert.match(service, /findUnique/);
    assert.match(service, /paymentEvent\.create/);
    assert.match(service, /status: "PAID"/);
    assert.match(service, /quantity: Math\.max/);
    assert.match(service, /reserved: Math\.max/);
    assert.match(schema, /eventId\s+String\?\s+@unique/);
  });
});
