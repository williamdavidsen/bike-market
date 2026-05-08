import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

test("ProductCard exposes price, stock, image fallback, and add-to-cart states", () => {
  const productCard = read("apps/frontend/src/components/product/ProductCard.tsx");

  assert.match(productCard, /formatNok/);
  assert.match(productCard, /StockBadge/);
  assert.match(productCard, /Bike/);
  assert.match(productCard, /Legg i handlekurv/);
  assert.match(productCard, /disabled=\{available <= 0\}/);
});

test("CartDrawer supports open, close, loading, empty, error, and checkout states", () => {
  const cartDrawer = read("apps/frontend/src/components/layout/CartDrawer.tsx");

  assert.match(cartDrawer, /isCartOpen/);
  assert.match(cartDrawer, /role="dialog"/);
  assert.match(cartDrawer, /isLoading/);
  assert.match(cartDrawer, /isError/);
  assert.match(cartDrawer, /Handlekurven er tom/);
  assert.match(cartDrawer, /CartSummary/);
});

test("Login form has validation and auth integration", () => {
  const loginPage = read("apps/frontend/src/pages/LoginPage.tsx");

  assert.match(loginPage, /type="email"/);
  assert.match(loginPage, /type="password"/);
  assert.match(loginPage, /Skriv inn e-post og passord/);
  assert.match(loginPage, /setAuth/);
});

test("AdminRoute and CookieBanner protect sensitive UI flows", () => {
  assert.match(read("apps/frontend/src/components/layout/AdminRoute.tsx"), /user\.role !== "ADMIN"/);
  assert.match(read("apps/frontend/src/components/common/CookieBanner.tsx"), /localStorage/);
  assert.match(read("apps/frontend/src/components/common/CookieBanner.tsx"), /Godta/);
});
