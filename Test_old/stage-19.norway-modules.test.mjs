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

test("stage 19 formats Norwegian prices and exposes MVA helpers", () => {
  const formatters = read("apps/frontend/src/lib/formatters.ts");
  const productDetail = read("apps/frontend/src/pages/ProductDetailPage.tsx");
  const terms = read("apps/frontend/src/pages/TermsPage.tsx");

  assert.match(formatters, /currency: "NOK"/);
  assert.match(formatters, /nb-NO/);
  assert.match(formatters, /calculateMvaFromGross/);
  assert.match(formatters, /formatMvaIncluded/);
  assert.match(productDetail, /MVA/);
  assert.match(terms, /norske kroner/);
  assert.match(terms, /25 prosent MVA/);
});

test("stage 19 adds GDPR cookie banner and legal routes", () => {
  const router = read("apps/frontend/src/app/router.tsx");
  const appLayout = read("apps/frontend/src/components/layout/AppLayout.tsx");
  const cookieBanner = read("apps/frontend/src/components/common/CookieBanner.tsx");
  const privacy = read("apps/frontend/src/pages/PrivacyPolicyPage.tsx");
  const terms = read("apps/frontend/src/pages/TermsPage.tsx");

  assert.equal(exists("apps/frontend/src/components/common/CookieBanner.tsx"), true);
  assert.match(appLayout, /CookieBanner/);
  assert.match(cookieBanner, /localStorage/);
  assert.match(cookieBanner, /Godta/);
  assert.match(cookieBanner, /Avvis/);
  assert.match(cookieBanner, /Tilpass/);
  assert.match(router, /personvern/);
  assert.match(router, /vilkar/);
  assert.match(privacy, /GDPR/);
  assert.match(privacy, /Personvernerklæring/);
  assert.match(terms, /Vilkår og betingelser/);
});

test("stage 19 prepares Norway-specific payment and shipping adapters", () => {
  const vipps = read("apps/backend/src/payments/providers/vipps-payment.provider.ts");
  const klarna = read("apps/backend/src/payments/providers/klarna-payment.provider.ts");
  const shippingProvider = read("apps/backend/src/shipping/shipping-provider.ts");
  const bringPosten = read("apps/backend/src/shipping/providers/bring-posten-shipping.provider.ts");

  assert.match(vipps, /VippsPaymentProvider/);
  assert.match(klarna, /KlarnaPaymentProvider/);
  assert.match(klarna, /PAYMENT_PROVIDER_NOT_READY/);
  assert.match(shippingProvider, /ShippingProvider/);
  assert.match(shippingProvider, /BRING_POSTEN/);
  assert.match(bringPosten, /BringPostenShippingProvider/);
  assert.match(bringPosten, /SHIPPING_PROVIDER_NOT_READY/);
});

test("stage 19 exposes a dedicated verification command", () => {
  const pkg = JSON.parse(read("package.json"));

  assert.match(pkg.scripts["test:stage19"], /stage-19\.norway-modules\.test\.mjs/);
  assert.match(pkg.scripts["test:stage19"], /build -w @bikemarket\/frontend/);
  assert.match(pkg.scripts["test:stage19"], /typecheck -w @bikemarket\/backend/);
});
