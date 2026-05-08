import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function readJson(path) {
  return JSON.parse(read(path));
}

describe("stage 11 frontend foundation", () => {
  it("configures Vite React TypeScript and required frontend dependencies", () => {
    const pkg = readJson("apps/frontend/package.json");

    assert.equal(pkg.scripts.dev, "npm run build && vite preview --host 0.0.0.0 --port 1299 --strictPort");
    assert.match(pkg.scripts.build, /vite build/);
    assert.match(pkg.scripts.typecheck, /tsc/);

    for (const dependency of ["react", "react-dom", "react-router-dom", "zustand", "@tanstack/react-query"]) {
      assert.equal(typeof pkg.dependencies[dependency], "string", `${dependency} should be installed`);
    }

    for (const dependency of ["vite", "@vitejs/plugin-react", "typescript", "tailwindcss", "@tailwindcss/vite"]) {
      assert.equal(typeof pkg.devDependencies[dependency], "string", `${dependency} should be installed`);
    }
  });

  it("contains the frontend app shell, providers, router, API client, and stores", () => {
    const requiredPaths = [
      "apps/frontend/index.html",
      "apps/frontend/vite.config.ts",
      "apps/frontend/tsconfig.json",
      "apps/frontend/src/main.tsx",
      "apps/frontend/src/app/providers.tsx",
      "apps/frontend/src/app/router.tsx",
      "apps/frontend/src/lib/api.ts",
      "apps/frontend/src/lib/queryClient.ts",
      "apps/frontend/src/store/authStore.ts",
      "apps/frontend/src/store/uiStore.ts",
      "apps/frontend/src/components/layout/AppLayout.tsx",
      "apps/frontend/src/components/layout/Header.tsx",
      "apps/frontend/src/components/layout/Footer.tsx",
      "apps/frontend/src/components/layout/CartDrawer.tsx",
      "apps/frontend/src/pages/HomePage.tsx",
      "apps/frontend/src/pages/NotFoundPage.tsx"
    ];

    for (const path of requiredPaths) {
      assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
    }
  });

  it("wires the required stage 11 routes", () => {
    const router = read("apps/frontend/src/app/router.tsx");

    for (const route of [
      "produkter",
      "kategori/:slug",
      "produkt/:slug",
      "handlekurv",
      "kasse",
      "logg-inn",
      "registrer",
      "konto",
      "bestillinger",
      "admin",
      "*"
    ]) {
      assert.match(router, new RegExp(route.replace("*", "\\*")));
    }
  });

  it("keeps frontend expectations reflected in foundation copy and API config", () => {
    const envExample = read("apps/frontend/.env.example");
    const api = read("apps/frontend/src/lib/api.ts");
    const constants = read("apps/frontend/src/lib/constants.ts");
    const home = read("apps/frontend/src/pages/HomePage.tsx");
    const styles = read("apps/frontend/src/styles.css");

    assert.match(envExample, /VITE_API_URL=http:\/\/localhost:4000\/api/);
    assert.match(constants, /VITE_API_URL/);
    assert.match(api, /Authorization/);
    assert.match(api, /ApiError/);
    assert.match(home, /Trygg betaling/);
    assert.match(home, /Rask levering/);
    assert.match(home, /Legg i handlekurv|Se produkter/);
    assert.match(styles, /@import "tailwindcss"/);
  });
});
