import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const requiredPaths = [
  "apps/backend/tsconfig.json",
  "apps/backend/src/app.ts",
  "apps/backend/src/server.ts",
  "apps/backend/src/config/env.ts",
  "apps/backend/src/routes/index.ts",
  "apps/backend/src/routes/health.routes.ts",
  "apps/backend/src/middlewares/error.middleware.ts",
  "apps/backend/src/middlewares/not-found.middleware.ts",
  "apps/backend/src/errors/app-error.ts",
  "apps/backend/src/utils/api-response.ts",
  "apps/backend/tests/health.test.ts",
  "apps/backend/tests/not-found.test.ts"
];

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

describe("stage 2 backend foundation", () => {
  it("contains the required backend source and test files", () => {
    for (const path of requiredPaths) {
      assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
    }
  });

  it("configures backend scripts for dev, build, typecheck, and tests", () => {
    const pkg = readJson("apps/backend/package.json");

    assert.equal(pkg.scripts.dev, "tsx watch src/server.ts");
    assert.equal(pkg.scripts.build, "tsc -p tsconfig.json");
    assert.equal(pkg.scripts.typecheck, "tsc -p tsconfig.json --noEmit");
    assert.equal(pkg.scripts.test, "node --test --import tsx \"tests/**/*.test.ts\"");
  });

  it("keeps TypeScript strict mode enabled", () => {
    const tsconfig = readJson("apps/backend/tsconfig.json");

    assert.equal(tsconfig.compilerOptions.strict, true);
    assert.equal(tsconfig.compilerOptions.module, "NodeNext");
    assert.equal(tsconfig.compilerOptions.moduleResolution, "NodeNext");
  });
});
