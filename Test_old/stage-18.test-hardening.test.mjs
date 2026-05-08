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

test("stage 18 backend critical systems are covered by behavior tests", () => {
  const requiredBackendTests = [
    "apps/backend/tests/auth.test.ts",
    "apps/backend/tests/catalog.test.ts",
    "apps/backend/tests/cart.test.ts",
    "apps/backend/tests/checkout.test.ts",
    "apps/backend/tests/payment.test.ts"
  ];

  for (const path of requiredBackendTests) {
    assert.equal(exists(path), true, `${path} should exist`);
  }

  const auth = read("apps/backend/tests/auth.test.ts");
  const catalog = read("apps/backend/tests/catalog.test.ts");
  const cart = read("apps/backend/tests/cart.test.ts");
  const checkout = read("apps/backend/tests/checkout.test.ts");
  const payment = read("apps/backend/tests/payment.test.ts");

  assert.match(auth, /registers a user and stores a hashed password/);
  assert.match(auth, /logs in and returns access and refresh tokens/);
  assert.match(catalog, /allows admins to create products/);
  assert.match(catalog, /allows admins to update and delete products/);
  assert.match(cart, /adds an item to the current user's cart/);
  assert.match(cart, /blocks quantities above available stock/);
  assert.match(checkout, /ignores frontend totals/);
  assert.match(checkout, /increases reserved stock/);
  assert.match(payment, /successful payment webhook/);
  assert.match(payment, /duplicate webhook/);
});

test("stage 18 frontend critical flows have concrete UI coverage points", () => {
  const productCard = read("apps/frontend/src/components/product/ProductCard.tsx");
  const cartDrawer = read("apps/frontend/src/components/layout/CartDrawer.tsx");
  const loginPage = read("apps/frontend/src/pages/LoginPage.tsx");
  const checkoutPage = read("apps/frontend/src/pages/CheckoutPage.tsx");

  assert.match(productCard, /Legg i handlekurv/);
  assert.match(productCard, /disabled=\{available <= 0\}/);
  assert.match(cartDrawer, /role="dialog"/);
  assert.match(cartDrawer, /Lukk handlekurv/);
  assert.match(loginPage, /type="email"/);
  assert.match(loginPage, /type="password"/);
  assert.match(loginPage, /login\(\{ email, password \}\)/);
  assert.match(checkoutPage, /Fyll inn navn, adresse, postnummer og by/);
  assert.match(checkoutPage, /completeMockPayment\.mutateAsync/);
});

test("stage 18 e2e happy path is represented and CI-ready commands are exposed", () => {
  const pkg = JSON.parse(read("package.json"));
  const checkoutPage = read("apps/frontend/src/pages/CheckoutPage.tsx");
  const productListPage = read("apps/frontend/src/pages/ProductListPage.tsx");
  const productDetailPage = read("apps/frontend/src/pages/ProductDetailPage.tsx");
  const paymentSuccessPage = read("apps/frontend/src/pages/PaymentSuccessPage.tsx");

  assert.equal(pkg.scripts["test:stage18"].includes("npm test -w @sykkelix/backend"), true);
  assert.equal(pkg.scripts["test:stage18"].includes("npm run build -w @sykkelix/frontend"), true);
  assert.match(productListPage, /ProductCatalogView/);
  assert.match(productDetailPage, /addCartItem\.mutateAsync/);
  assert.match(checkoutPage, /useStartCheckout/);
  assert.match(checkoutPage, /MOCK/);
  assert.match(paymentSuccessPage, /Takk for bestillingen|Betaling fullført/i);
});
