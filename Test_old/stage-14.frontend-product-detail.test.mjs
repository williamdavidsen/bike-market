import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

test("stage 14 fetches product detail by slug from the backend catalog API", () => {
  const catalogApi = read("apps/frontend/src/features/products/catalogApi.ts");
  const queries = read("apps/frontend/src/features/products/productQueries.ts");
  const page = read("apps/frontend/src/pages/ProductDetailPage.tsx");

  assert.match(catalogApi, /fetchProductBySlug/);
  assert.match(catalogApi, /\/products\/\$\{slug\}/);
  assert.match(queries, /useProduct/);
  assert.match(page, /useParams/);
  assert.match(page, /useProduct\(slug\)/);
});

test("stage 14 product detail includes gallery, price, campaign, rating, stock, delivery, and technical sections", () => {
  const page = read("apps/frontend/src/pages/ProductDetailPage.tsx");

  for (const term of [
    "selectedImageId",
    "Produktbeskrivelse",
    "Tekniske detaljer",
    "formatNok",
    "salePriceNok",
    "Rating placeholder",
    "StockBadge",
    "Sendes hjem",
    "Hent i butikk"
  ]) {
    assert.match(page, new RegExp(term), `Product detail should include ${term}`);
  }
});

test("stage 14 supports variant, size, and color selection with a clear missing-variant warning", () => {
  const page = read("apps/frontend/src/pages/ProductDetailPage.tsx");

  for (const term of ["Variant", "Størrelse", "Farge", "selectedVariantId", "chooseByOption", "Velg variant"]) {
    assert.match(page, new RegExp(term), `Product detail should support ${term}`);
  }
});

test("stage 14 disables add-to-cart when stock or variant selection is invalid and posts cart item when valid", () => {
  const page = read("apps/frontend/src/pages/ProductDetailPage.tsx");
  const cartApi = read("apps/frontend/src/features/cart/cartApi.ts");
  const cartQueries = read("apps/frontend/src/features/cart/cartQueries.ts");

  assert.match(page, /canAddToCart/);
  assert.match(page, /disabled=\{!canAddToCart\}/);
  assert.match(page, /isVariantAvailable/);
  assert.match(page, /useAddCartItem/);
  assert.match(page, /variantId: selectedVariant\.id/);
  assert.match(cartApi, /\/cart\/items/);
  assert.match(cartQueries, /invalidateQueries/);
});
