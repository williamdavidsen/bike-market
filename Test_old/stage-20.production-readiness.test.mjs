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

test("stage 20 includes backend and frontend production Dockerfiles", () => {
  const backendDockerfile = read("apps/backend/Dockerfile");
  const frontendDockerfile = read("apps/frontend/Dockerfile");
  const nginx = read("apps/frontend/nginx.conf");

  assert.equal(exists("apps/backend/Dockerfile"), true);
  assert.equal(exists("apps/frontend/Dockerfile"), true);
  assert.match(backendDockerfile, /npm run build -w @bikemarket\/backend/);
  assert.match(backendDockerfile, /HEALTHCHECK/);
  assert.match(backendDockerfile, /\/api\/health/);
  assert.match(frontendDockerfile, /nginx/);
  assert.match(frontendDockerfile, /VITE_API_URL/);
  assert.match(nginx, /proxy_pass http:\/\/backend:4000\/api\//);
  assert.match(nginx, /try_files \$uri \$uri\/ \/index\.html/);
});

test("stage 20 defines a production compose stack with PostgreSQL, backend, and frontend", () => {
  const compose = read("docker-compose.prod.yml");

  assert.match(compose, /postgres:/);
  assert.match(compose, /backend:/);
  assert.match(compose, /frontend:/);
  assert.match(compose, /condition: service_healthy/);
  assert.match(compose, /pg_isready/);
  assert.match(compose, /DATABASE_URL/);
  assert.match(compose, /FRONTEND_PORT/);
});

test("stage 20 documents production env, migration, seed, and deployment build commands", () => {
  const rootPkg = JSON.parse(read("package.json"));
  const backendPkg = JSON.parse(read("apps/backend/package.json"));
  const envExample = read(".env.production.example");
  const readme = read("README.md");

  assert.equal(rootPkg.scripts["db:migrate:deploy"], "npm run db:migrate:deploy -w @bikemarket/backend");
  assert.equal(rootPkg.scripts["db:seed"], "npm run db:seed -w @bikemarket/backend");
  assert.equal(backendPkg.scripts["db:migrate:deploy"], "prisma migrate deploy");
  assert.match(envExample, /NODE_ENV=production/);
  assert.match(envExample, /DATABASE_URL=postgresql:\/\/bikemarket:/);
  assert.match(envExample, /JWT_ACCESS_SECRET=replace-with/);
  assert.match(readme, /docker compose --env-file \.env\.production -f docker-compose\.prod\.yml build/);
  assert.match(readme, /db:migrate:deploy/);
  assert.match(readme, /db:seed/);
});

test("stage 20 exposes a production readiness verification command", () => {
  const pkg = JSON.parse(read("package.json"));

  assert.match(pkg.scripts["test:stage20"], /stage-20\.production-readiness\.test\.mjs/);
  assert.match(pkg.scripts["test:stage20"], /npm run build/);
  assert.match(pkg.scripts["test:stage20"], /npm run typecheck/);
});
