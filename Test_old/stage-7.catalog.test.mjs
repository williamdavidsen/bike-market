import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

describe("stage 7 product category and brand API", () => {
  it("contains catalog routes, service, and endpoint tests", () => {
    const requiredPaths = [
      "apps/backend/src/routes/catalog.routes.ts",
      "apps/backend/src/services/catalog.service.ts",
      "apps/backend/tests/catalog.test.ts"
    ];

    for (const path of requiredPaths) {
      assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
    }
  });

  it("exposes public catalog and admin CRUD route groups", () => {
    const router = readFileSync(join(root, "apps/backend/src/routes/catalog.routes.ts"), "utf8");

    for (const endpoint of [
      "/products",
      "/categories",
      "/brands",
      "products/:id",
      "categories/:id",
      "brands/:id"
    ]) {
      assert.match(router, new RegExp(endpoint.replace("/", "\\/")));
    }

    assert.match(router, /requireRole\("ADMIN"\)/);
  });

  it("supports the required product filters", () => {
    const router = readFileSync(join(root, "apps/backend/src/routes/catalog.routes.ts"), "utf8");

    for (const filter of [
      "category",
      "brand",
      "minPrice",
      "maxPrice",
      "size",
      "color",
      "inStock",
      "campaign",
      "sort"
    ]) {
      assert.match(router, new RegExp(filter));
    }
  });
});
