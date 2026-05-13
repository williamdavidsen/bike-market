import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

test("database backup scripts cover backup, pruning, cron, checks, and restore", () => {
  const scriptPaths = [
    "scripts/deployment/run-database-backup.sh",
    "scripts/deployment/prune-database-backups.sh",
    "scripts/deployment/install-database-backup-cron.sh",
    "scripts/deployment/check-database-backups.sh",
    "scripts/deployment/restore-database-backup.sh"
  ];

  for (const scriptPath of scriptPaths) {
    assert.equal(existsSync(join(root, scriptPath)), true, `${scriptPath} should exist`);
    assert.match(read(scriptPath), /^#!\/usr\/bin\/env bash/);
    assert.match(read(scriptPath), /set -euo pipefail/);
  }

  assert.match(read("scripts/deployment/run-database-backup.sh"), /pg_dump/);
  assert.match(read("scripts/deployment/run-database-backup.sh"), /prune-database-backups\.sh/);
  assert.match(read("scripts/deployment/prune-database-backups.sh"), /BACKUP_DAILY_RETENTION_DAYS/);
  assert.match(read("scripts/deployment/prune-database-backups.sh"), /BACKUP_WEEKLY_RETENTION_WEEKS/);
  assert.match(read("scripts/deployment/install-database-backup-cron.sh"), /crontab/);
  assert.match(read("scripts/deployment/check-database-backups.sh"), /BACKUP_MAX_AGE_HOURS/);
  assert.match(read("scripts/deployment/restore-database-backup.sh"), /Type RESTORE to continue/);
});

test("deployment docs explain the complete database backup phase", () => {
  const deployment = read("docs/deployment.md");
  const backupIndex = deployment.indexOf("## 4. Database Backup Plan");
  const operationsIndex = deployment.indexOf("## 5. Logs And Operations");

  assert.equal(backupIndex > -1 && backupIndex < operationsIndex, true);
  assert.match(deployment, /run-database-backup\.sh/);
  assert.match(deployment, /install-database-backup-cron\.sh/);
  assert.match(deployment, /prune-database-backups\.sh/);
  assert.match(deployment, /restore-database-backup\.sh/);
  assert.match(deployment, /BACKUP_DIR/);
  assert.match(deployment, /Daily backups for 14 days/);
  assert.match(deployment, /Weekly backups for 8 weeks/);
});

test("root package exposes database backup commands", () => {
  const pkg = JSON.parse(read("package.json"));

  assert.equal(pkg.scripts["deploy:backup"], "bash scripts/deployment/run-database-backup.sh");
  assert.equal(pkg.scripts["deploy:backup:prune"], "bash scripts/deployment/prune-database-backups.sh");
  assert.equal(pkg.scripts["deploy:backup:cron"], "bash scripts/deployment/install-database-backup-cron.sh");
  assert.equal(pkg.scripts["deploy:check:backup"], "bash scripts/deployment/check-database-backups.sh");
});
