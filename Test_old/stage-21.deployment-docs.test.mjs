import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

test("stage 21 documents a clean VPS deployment plan", () => {
  const deployment = read("docs/deployment.md");

  assert.equal(existsSync(join(root, "docs/deployment.md")), true);
  assert.match(deployment, /Ubuntu 24\.04 LTS/);
  assert.match(deployment, /Docker Engine/);
  assert.match(deployment, /ufw allow 80\/tcp/);
  assert.match(deployment, /git clone https:\/\/github\.com\/williamdavidsen\/bike-market\.git/);
  assert.match(deployment, /docker compose --env-file \.env\.production -f docker-compose\.prod\.yml up -d/);
});

test("stage 21 covers domain, SSL, environment variables, and smoke checks", () => {
  const deployment = read("docs/deployment.md");

  assert.match(deployment, /A bikemarket\.no -> VPS public IPv4/);
  assert.match(deployment, /Let's Encrypt/);
  assert.match(deployment, /Required environment variables/);
  for (const envName of [
    "FRONTEND_URL",
    "DATABASE_URL",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "VIPPS_CLIENT_ID",
    "KLARNA_USERNAME"
  ]) {
    assert.match(deployment, new RegExp(envName));
  }
  assert.match(deployment, /curl -fsS https:\/\/bikemarket\.no\/api\/health/);
});

test("stage 21 covers backup, logs, updates, and rollback", () => {
  const deployment = read("docs/deployment.md");

  assert.match(deployment, /Database Backup Plan/);
  assert.match(deployment, /pg_dump/);
  assert.match(deployment, /Restore drill/);
  assert.match(deployment, /Logs And Operations/);
  assert.match(deployment, /Deploy an update/);
  assert.match(deployment, /Rollback logic/);
  assert.match(deployment, /last known good commit/);
});

test("stage 21 links deployment docs from README and exposes a verification command", () => {
  const readme = read("README.md");
  const pkg = JSON.parse(read("package.json"));

  assert.match(readme, /docs\/deployment\.md/);
  assert.match(pkg.scripts["test:stage21"], /stage-21\.deployment-docs\.test\.mjs/);
});
