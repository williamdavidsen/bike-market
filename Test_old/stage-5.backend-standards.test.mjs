import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

describe("stage 5 backend standards", () => {
  it("configures ESLint and Prettier for the backend workspace", () => {
    const pkg = readJson("apps/backend/package.json");

    assert.equal(existsSync(join(root, "apps/backend/eslint.config.js")), true);
    assert.equal(existsSync(join(root, "apps/backend/.prettierrc.json")), true);
    assert.match(pkg.scripts.lint, /eslint/);
    assert.match(pkg.scripts.format, /prettier --check/);
    assert.equal(pkg.devDependencies.eslint.startsWith("^"), true);
    assert.equal(pkg.devDependencies.prettier.startsWith("^"), true);
  });

  it("keeps strict TypeScript enabled", () => {
    const tsconfig = readJson("apps/backend/tsconfig.json");

    assert.equal(tsconfig.compilerOptions.strict, true);
    assert.equal(tsconfig.compilerOptions.noUncheckedIndexedAccess, true);
    assert.equal(tsconfig.compilerOptions.noImplicitOverride, true);
  });

  it("contains central API, error, validation, async, and logger utilities", () => {
    const requiredPaths = [
      "apps/backend/src/utils/api-response.ts",
      "apps/backend/src/errors/app-error.ts",
      "apps/backend/src/utils/async-handler.ts",
      "apps/backend/src/middlewares/validate-request.middleware.ts",
      "apps/backend/src/utils/logger.ts"
    ];

    for (const path of requiredPaths) {
      assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
    }
  });
});
