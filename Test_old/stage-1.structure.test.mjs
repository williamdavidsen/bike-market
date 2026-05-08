import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const requiredPaths = [
  "package.json",
  ".gitignore",
  ".env.example",
  "README.md",
  "apps/backend/package.json",
  "apps/backend/.env.example",
  "apps/backend/src/.gitkeep",
  "apps/frontend/package.json",
  "apps/frontend/.env.example",
  "apps/frontend/src/.gitkeep",
  "packages/shared/package.json",
  "packages/shared/src/.gitkeep"
];

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

describe("stage 1 monorepo foundation", () => {
  it("contains the required folders and starter files", () => {
    for (const path of requiredPaths) {
      assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
    }
  });

  it("configures npm workspaces for apps and packages", () => {
    const pkg = readJson("package.json");

    assert.equal(pkg.private, true);
    assert.deepEqual(pkg.workspaces, ["apps/*", "packages/*"]);
    assert.equal(pkg.scripts.test, "node --test tests/*.test.mjs");
    assert.equal(pkg.scripts["test:stage1"], "node --test tests/stage-1.structure.test.mjs");
  });

  it("names workspace packages consistently", () => {
    assert.equal(readJson("apps/backend/package.json").name, "@sykkelix/backend");
    assert.equal(readJson("apps/frontend/package.json").name, "@sykkelix/frontend");
    assert.equal(readJson("packages/shared/package.json").name, "@sykkelix/shared");
  });
});
