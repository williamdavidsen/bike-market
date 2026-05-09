import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

test("application setup deployment scripts exist and guard production startup", () => {
  const scriptPaths = [
    "scripts/deployment/check-production-env.sh",
    "scripts/deployment/check-production-compose.sh",
    "scripts/deployment/check-application-smoke.sh",
    "scripts/deployment/run-production-migrations.sh"
  ];

  for (const scriptPath of scriptPaths) {
    assert.equal(existsSync(join(root, scriptPath)), true, `${scriptPath} should exist`);
    assert.match(read(scriptPath), /^#!\/usr\/bin\/env bash/);
    assert.match(read(scriptPath), /set -euo pipefail/);
  }

  assert.match(read("scripts/deployment/check-production-env.sh"), /NODE_ENV must be production/);
  assert.match(read("scripts/deployment/check-production-compose.sh"), /docker compose --env-file/);
  assert.match(read("scripts/deployment/check-application-smoke.sh"), /BACKEND_URL/);
  assert.match(read("scripts/deployment/run-production-migrations.sh"), /db:migrate:deploy/);
  assert.match(read("scripts/deployment/run-production-migrations.sh"), /db:seed/);
});

test("deployment docs place application setup checks before database backup plan", () => {
  const deployment = read("docs/deployment.md");
  const envCheckIndex = deployment.indexOf("check-production-env.sh");
  const composeCheckIndex = deployment.indexOf("check-production-compose.sh");
  const smokeCheckIndex = deployment.indexOf("check-application-smoke.sh");
  const migrationRunnerIndex = deployment.indexOf("run-production-migrations.sh");
  const backupIndex = deployment.indexOf("## 4. Database Backup Plan");

  assert.equal(envCheckIndex > -1 && envCheckIndex < backupIndex, true);
  assert.equal(composeCheckIndex > -1 && composeCheckIndex < backupIndex, true);
  assert.equal(smokeCheckIndex > -1 && smokeCheckIndex < backupIndex, true);
  assert.equal(migrationRunnerIndex > -1 && migrationRunnerIndex < backupIndex, true);
});
