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

test("archives the previous stage tests and keeps the new QA suite layered", () => {
  assert.equal(exists("Test_old/stage-1.structure.test.mjs"), true);
  assert.equal(exists("Test_old/stage-21.deployment-docs.test.mjs"), true);

  for (const layer of ["static", "unit", "api", "component", "e2e", "security"]) {
    assert.equal(exists(`tests/${layer}`), true, `tests/${layer} should exist`);
  }
});

test("root scripts map to the QA strategy layers", () => {
  const pkg = JSON.parse(read("package.json"));

  assert.equal(pkg.scripts.test, "node --test tests/**/*.test.mjs");
  for (const script of [
    "test:static",
    "test:unit",
    "test:api",
    "test:component",
    "test:e2e",
    "test:security",
    "test:qa",
    "test:legacy"
  ]) {
    assert.equal(typeof pkg.scripts[script], "string", `${script} should be defined`);
  }
});

test("production and local environment examples avoid committed real secrets", () => {
  for (const path of [".env.example", ".env.production.example", "apps/backend/.env.example"]) {
    const content = read(path);

    assert.doesNotMatch(content, /sk_live_[A-Za-z0-9]+/);
    assert.doesNotMatch(content, /pk_live_[A-Za-z0-9]+/);
    assert.doesNotMatch(content, /-----BEGIN (RSA|OPENSSH|EC|PRIVATE) KEY-----/);
    assert.doesNotMatch(content, /prod(uction)?[-_ ]?(secret|password|credential)/i);
  }
});

test("production config keeps healthchecks and deployment docs discoverable", () => {
  assert.match(read("docker-compose.prod.yml"), /healthcheck:/);
  assert.match(read("apps/backend/Dockerfile"), /\/api\/health/);
  assert.match(read("apps/frontend/Dockerfile"), /HEALTHCHECK/);
  assert.match(read("README.md"), /docs\/deployment\.md/);
  assert.match(read("docs/qa-test-strategy.md"), /Test Pyramid/);
});
