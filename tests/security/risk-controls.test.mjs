import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

test("admin access is guarded on backend and frontend", () => {
  assert.match(read("apps/backend/src/routes/catalog.routes.ts"), /requireRole\("ADMIN"\)/);
  assert.match(read("apps/backend/src/routes/payment.routes.ts"), /requireRole\("ADMIN"\)/);
  assert.match(read("apps/frontend/src/components/layout/AdminRoute.tsx"), /user\.role !== "ADMIN"/);
});

test("payment webhooks keep signature and idempotency protections", () => {
  assert.match(read("apps/backend/src/routes/payment.routes.ts"), /x-payment-signature/);
  assert.match(read("apps/backend/src/services/payment.service.ts"), /paymentEvent\.findUnique/);
  assert.match(read("apps/backend/src/services/payment.service.ts"), /processed: false/);
});

test("backend recalculates sensitive totals and stock server-side", () => {
  assert.match(read("apps/backend/src/services/cart.service.ts"), /INSUFFICIENT_STOCK/);
  assert.match(read("apps/backend/src/services/checkout.service.ts"), /clientTotalNok/);
  assert.match(read("apps/backend/src/services/checkout.service.ts"), /reserved/);
  assert.match(read("apps/backend/tests/checkout.test.ts"), /ignores frontend totals/);
});

test("source and examples do not contain obvious production secrets", () => {
  for (const path of [
    ".env.example",
    ".env.production.example",
    "apps/backend/src/config/env.ts",
    "apps/backend/src/utils/token.ts"
  ]) {
    const content = read(path);

    assert.doesNotMatch(content, /sk_live_[A-Za-z0-9]+/);
    assert.doesNotMatch(content, /-----BEGIN (RSA|OPENSSH|EC|PRIVATE) KEY-----/);
    assert.doesNotMatch(content, /prod(uction)?[-_ ]?(secret|password|credential)/i);
  }
});
