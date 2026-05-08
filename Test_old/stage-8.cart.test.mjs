import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

describe("stage 8 cart API", () => {
  it("contains cart routes, service, and endpoint tests", () => {
    const requiredPaths = [
      "apps/backend/src/routes/cart.routes.ts",
      "apps/backend/src/services/cart.service.ts",
      "apps/backend/tests/cart.test.ts"
    ];

    for (const path of requiredPaths) {
      assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
    }
  });

  it("exposes the required cart endpoints", () => {
    const router = readFileSync(join(root, "apps/backend/src/routes/cart.routes.ts"), "utf8");

    for (const routePattern of ["router.get(", "router.post(", "router.patch(", "router.delete("]) {
      assert.match(router, new RegExp(routePattern.replace("(", "\\(")));
    }

    assert.match(router, /\/items/);
    assert.match(router, /\/items\/:id/);
    assert.match(router, /requireAuth/);
  });

  it("includes backend price recalculation and stock checks", () => {
    const service = readFileSync(join(root, "apps/backend/src/services/cart.service.ts"), "utf8");

    assert.match(service, /resolveUnitPrice/);
    assert.match(service, /INSUFFICIENT_STOCK/);
    assert.match(service, /subtotalNok/);
    assert.match(service, /lineTotalNok/);
  });
});
