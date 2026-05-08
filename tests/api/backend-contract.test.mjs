import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function exists(path) {
  return existsSync(join(root, path));
}

test("backend behavior tests cover the critical ecommerce APIs", () => {
  for (const path of [
    "apps/backend/tests/auth.test.ts",
    "apps/backend/tests/catalog.test.ts",
    "apps/backend/tests/cart.test.ts",
    "apps/backend/tests/checkout.test.ts",
    "apps/backend/tests/payment.test.ts",
    "apps/backend/tests/validation.test.ts",
    "apps/backend/tests/not-found.test.ts"
  ]) {
    assert.equal(exists(path), true, `${path} should exist`);
  }
});

test("API tests cover auth, admin, cart, checkout, and payment risk controls", () => {
  assert.match(read("apps/backend/tests/auth.test.ts"), /revokes the old refresh token/);
  assert.match(read("apps/backend/tests/catalog.test.ts"), /blocks non-admin users/);
  assert.match(read("apps/backend/tests/catalog.test.ts"), /update and delete products/);
  assert.match(read("apps/backend/tests/cart.test.ts"), /blocks quantities above available stock/);
  assert.match(read("apps/backend/tests/checkout.test.ts"), /ignores frontend totals/);
  assert.match(read("apps/backend/tests/payment.test.ts"), /duplicate webhook/);
});

test("backend exposes standard response and validation middleware", () => {
  assert.match(read("apps/backend/src/utils/api-response.ts"), /success: true/);
  assert.match(read("apps/backend/src/middlewares/error.middleware.ts"), /success: false/);
  assert.match(read("apps/backend/src/middlewares/validate-request.middleware.ts"), /ValidationError/);
  assert.match(read("apps/backend/src/errors/app-error.ts"), /VALIDATION_ERROR/);
});
