import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

describe("stage 6 authentication system", () => {
  it("contains auth routes, service, middleware, and crypto helpers", () => {
    const requiredPaths = [
      "apps/backend/src/routes/auth.routes.ts",
      "apps/backend/src/services/auth.service.ts",
      "apps/backend/src/middlewares/auth.middleware.ts",
      "apps/backend/src/utils/password.ts",
      "apps/backend/src/utils/token.ts",
      "apps/backend/tests/auth.test.ts"
    ];

    for (const path of requiredPaths) {
      assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
    }
  });

  it("configures bcrypt and JWT dependencies", () => {
    const pkg = readJson("apps/backend/package.json");

    assert.equal(pkg.dependencies.bcrypt.startsWith("^"), true);
    assert.equal(pkg.dependencies.jsonwebtoken.startsWith("^"), true);
    assert.equal(pkg.devDependencies["@types/bcrypt"].startsWith("^"), true);
    assert.equal(pkg.devDependencies["@types/jsonwebtoken"].startsWith("^"), true);
  });

  it("documents auth secrets and exposes auth endpoints", () => {
    const envExample = readFileSync(join(root, "apps/backend/.env.example"), "utf8");
    const routes = readFileSync(join(root, "apps/backend/src/routes/auth.routes.ts"), "utf8");

    assert.match(envExample, /JWT_ACCESS_SECRET=/);
    assert.match(envExample, /JWT_REFRESH_SECRET=/);

    for (const endpoint of ["register", "login", "refresh", "logout", "me"]) {
      assert.match(routes, new RegExp(`/${endpoint}`));
    }
  });
});
