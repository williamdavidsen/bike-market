import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const completedStageTests = [
  "Test_old/stage-1.structure.test.mjs",
  "Test_old/stage-2.backend.test.mjs",
  "Test_old/stage-3.docker-postgres.test.mjs",
  "Test_old/stage-4.prisma.test.mjs",
  "Test_old/stage-5.backend-standards.test.mjs",
  "Test_old/stage-6.auth.test.mjs",
  "Test_old/stage-7.catalog.test.mjs",
  "Test_old/stage-8.cart.test.mjs",
  "Test_old/stage-9.checkout-order.test.mjs",
  "Test_old/stage-10.payment-provider.test.mjs",
  "Test_old/stage-11.frontend-foundation.test.mjs",
  "Test_old/stage-12.frontend-catalog.test.mjs",
  "Test_old/stage-13.frontend-product-filtering.test.mjs",
  "Test_old/stage-14.frontend-product-detail.test.mjs",
  "Test_old/stage-15.frontend-cart.test.mjs",
  "Test_old/stage-16.frontend-checkout.test.mjs",
  "Test_old/stage-17.frontend-admin.test.mjs"
];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function readJson(path) {
  return JSON.parse(read(path));
}

describe("QA regression guard", () => {
  it("keeps the QA strategy document in the repo", () => {
    const strategyPath = "docs/qa-test-strategy.md";

    assert.equal(existsSync(join(root, strategyPath)), true);

    const strategy = read(strategyPath);
    for (const requiredTopic of [
      "Risk-Based Rules",
      "Frontend price input must never be trusted",
      "Payment webhooks must verify signatures",
      "Exit Criteria For Every Stage"
    ]) {
      assert.match(strategy, new RegExp(requiredTopic));
    }
  });

  it("runs every completed stage through the default regression command", () => {
    const pkg = readJson("package.json");

    assert.equal(pkg.scripts.test, "node --test tests/**/*.test.mjs");

    for (const path of completedStageTests) {
      assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
    }
  });

  it("keeps production secrets out of env examples and security-sensitive source files", () => {
    const searchableFiles = [
      ".env.example",
      "apps/backend/.env.example",
      "apps/backend/src/config/env.ts",
      "apps/backend/src/utils/token.ts"
    ];

    for (const path of searchableFiles) {
      const content = read(path);

      assert.doesNotMatch(content, /sk_live_[A-Za-z0-9]+/);
      assert.doesNotMatch(content, /pk_live_[A-Za-z0-9]+/);
      assert.doesNotMatch(content, /-----BEGIN (RSA|OPENSSH|EC|PRIVATE) KEY-----/);
      assert.doesNotMatch(content, /prod(uction)?[-_ ]?(secret|password|credential)/i);
    }
  });

  it("keeps security middleware and standard error responses wired into the backend", () => {
    const app = read("apps/backend/src/app.ts");
    const errorMiddleware = read("apps/backend/src/middlewares/error.middleware.ts");

    assert.match(app, /helmet\(\)/);
    assert.match(app, /cors\(/);
    assert.match(app, /rateLimit\(/);
    assert.match(app, /express\.json/);
    assert.match(errorMiddleware, /success: false/);
    assert.match(errorMiddleware, /INTERNAL_SERVER_ERROR/);
  });

  it("keeps completed risk areas covered by API behavior tests", () => {
    const requiredBackendTests = [
      "apps/backend/tests/auth.test.ts",
      "apps/backend/tests/catalog.test.ts",
      "apps/backend/tests/cart.test.ts",
      "apps/backend/tests/checkout.test.ts",
      "apps/backend/tests/payment.test.ts",
      "apps/backend/tests/validation.test.ts",
      "apps/backend/tests/not-found.test.ts"
    ];

    for (const path of requiredBackendTests) {
      assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
    }

    const authTests = read("apps/backend/tests/auth.test.ts");
    const cartTests = read("apps/backend/tests/cart.test.ts");
    const catalogTests = read("apps/backend/tests/catalog.test.ts");
    const checkoutTests = read("apps/backend/tests/checkout.test.ts");
    const paymentTests = read("apps/backend/tests/payment.test.ts");

    assert.match(authTests, /rejects customers/);
    assert.match(authTests, /revokes the old refresh token/);
    assert.match(cartTests, /blocks quantities above available stock/);
    assert.match(cartTests, /subtotalNok/);
    assert.match(catalogTests, /filters products by category/);
    assert.match(catalogTests, /blocks non-admin users/);
    assert.match(checkoutTests, /ignores frontend totals/);
    assert.match(checkoutTests, /increases reserved stock/);
    assert.match(paymentTests, /duplicate webhook/);
    assert.match(paymentTests, /captures stock/);
  });
});
