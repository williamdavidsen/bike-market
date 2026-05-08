import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

test("deployment pre-application scripts cover server, domain, and combined checks", () => {
  const serverCheckPath = "scripts/deployment/check-server-baseline.sh";
  const domainCheckPath = "scripts/deployment/check-domain-ssl.sh";
  const preAppCheckPath = "scripts/deployment/check-pre-app-setup.sh";

  assert.equal(existsSync(join(root, serverCheckPath)), true);
  assert.equal(existsSync(join(root, domainCheckPath)), true);
  assert.equal(existsSync(join(root, preAppCheckPath)), true);

  const serverCheck = read(serverCheckPath);
  const domainCheck = read(domainCheckPath);
  const preAppCheck = read(preAppCheckPath);

  assert.match(serverCheck, /^#!\/usr\/bin\/env bash/);
  assert.match(domainCheck, /^#!\/usr\/bin\/env bash/);
  assert.match(preAppCheck, /^#!\/usr\/bin\/env bash/);
  assert.match(serverCheck, /Ubuntu 24\.04 LTS/);
  assert.match(serverCheck, /Docker Compose plugin/);
  assert.match(serverCheck, /UFW allows/);
  assert.match(domainCheck, /EXPECTED_PUBLIC_IP/);
  assert.match(domainCheck, /https:\/\/\$\{domain\}\//);
  assert.match(preAppCheck, /check-server-baseline\.sh/);
  assert.match(preAppCheck, /check-domain-ssl\.sh/);
});

test("deployment docs expose the pre-application gate before application setup", () => {
  const deployment = read("docs/deployment.md");
  const gateIndex = deployment.indexOf("check-pre-app-setup.sh");
  const appSetupIndex = deployment.indexOf("## 3. Application Setup");

  assert.notEqual(gateIndex, -1);
  assert.notEqual(appSetupIndex, -1);
  assert.equal(gateIndex < appSetupIndex, true);
});
