import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

describe("stage 3 docker and postgres foundation", () => {
  it("contains Docker Compose and backend database files", () => {
    const requiredPaths = [
      "docker-compose.yml",
      "apps/backend/src/db/postgres.ts",
      "apps/backend/src/db/check.ts"
    ];

    for (const path of requiredPaths) {
      assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
    }
  });

  it("documents PostgreSQL environment values", () => {
    const rootEnv = readFileSync(join(root, ".env.example"), "utf8");
    const backendEnv = readFileSync(join(root, "apps/backend/.env.example"), "utf8");

    for (const content of [rootEnv, backendEnv]) {
      assert.match(content, /POSTGRES_USER=bikemarket/);
      assert.match(content, /POSTGRES_PASSWORD=bikemarket_password/);
      assert.match(content, /POSTGRES_DB=bikemarket/);
      assert.match(content, /POSTGRES_PORT=5432/);
      assert.match(content, /DATABASE_URL=postgresql:\/\/bikemarket:bikemarket_password@localhost:5432\/bikemarket/);
    }
  });

  it("adds a backend database connection check script", () => {
    const pkg = readJson("apps/backend/package.json");

    assert.equal(pkg.scripts["db:check"], "tsx src/db/check.ts");
    assert.equal(pkg.dependencies.pg.startsWith("^"), true);
    assert.equal(pkg.devDependencies["@types/pg"].startsWith("^"), true);
  });
});
