import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

describe("stage 4 prisma schema foundation", () => {
  it("contains Prisma schema, config, and seed files", () => {
    const requiredPaths = [
      "apps/backend/prisma.config.ts",
      "apps/backend/prisma/schema.prisma",
      "apps/backend/prisma/seed.ts",
      "apps/backend/src/db/prisma.ts"
    ];

    for (const path of requiredPaths) {
      assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
    }
  });

  it("defines the first e-commerce models", () => {
    const schema = readFileSync(join(root, "apps/backend/prisma/schema.prisma"), "utf8");
    const models = [
      "User",
      "Address",
      "Category",
      "Brand",
      "Product",
      "ProductImage",
      "ProductVariant",
      "Inventory",
      "Cart",
      "CartItem",
      "Order",
      "OrderItem",
      "Payment",
      "PaymentEvent",
      "RefreshToken"
    ];

    for (const model of models) {
      assert.match(schema, new RegExp(`model ${model} \\{`));
    }
  });

  it("adds Prisma scripts and dependencies to the backend workspace", () => {
    const pkg = readJson("apps/backend/package.json");

    assert.equal(pkg.scripts["db:generate"], "prisma generate");
    assert.equal(pkg.scripts["db:migrate"], "prisma migrate dev");
    assert.equal(pkg.scripts["db:seed"], "tsx prisma/seed.ts");
    assert.equal(pkg.prisma.seed, "tsx prisma/seed.ts");
    assert.equal(pkg.dependencies["@prisma/client"].startsWith("^"), true);
    assert.equal(pkg.dependencies["@prisma/adapter-pg"].startsWith("^"), true);
    assert.equal(pkg.devDependencies.prisma.startsWith("^"), true);
  });
});
