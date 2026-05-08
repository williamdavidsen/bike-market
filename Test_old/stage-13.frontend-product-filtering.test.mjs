import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

test("stage 13 product catalog has sticky desktop filters and mobile drawer semantics", () => {
  const catalog = read("apps/frontend/src/features/products/ProductCatalogView.tsx");
  const drawer = read("apps/frontend/src/components/product/MobileFilterDrawer.tsx");

  assert.match(catalog, /lg:sticky/);
  assert.match(catalog, /lg:top-28/);
  assert.match(catalog, /MobileFilterDrawer/);
  assert.match(drawer, /role="dialog"/);
  assert.match(drawer, /aria-modal="true"/);
});

test("stage 13 filters match frontend expectations and update URL query parameters", () => {
  const filters = read("apps/frontend/src/components/product/ProductFilters.tsx");
  const catalog = read("apps/frontend/src/features/products/ProductCatalogView.tsx");

  for (const label of ["Merke", "Min pris", "Maks pris", "Størrelse", "Farge", "På lager", "Kampanje"]) {
    assert.match(filters, new RegExp(label), `${label} should be visible in filters`);
  }

  for (const queryKey of ["brand", "minPrice", "maxPrice", "size", "color", "inStock", "campaign", "page"]) {
    assert.match(catalog, new RegExp(queryKey), `${queryKey} should be handled as URL query`);
  }

  assert.match(catalog, /useSearchParams/);
  assert.match(catalog, /setSearchParams/);
});

test("stage 13 sort dropdown includes required choices without breaking backend sort contract", () => {
  const toolbar = read("apps/frontend/src/components/product/ProductToolbar.tsx");
  const catalogApi = read("apps/frontend/src/features/products/catalogApi.ts");

  for (const sortLabel of ["Nyheter", "Bestselgere", "Pris lav-høy", "Pris høy-lav"]) {
    assert.match(toolbar, new RegExp(sortLabel), `${sortLabel} should be a sort option`);
  }

  assert.match(toolbar, /bestsellers/);
  assert.match(catalogApi, /value === "bestsellers" \? "newest" : value/);
});

test("stage 13 keeps loading, empty, and error states in the product list", () => {
  const catalog = read("apps/frontend/src/features/products/ProductCatalogView.tsx");
  const grid = read("apps/frontend/src/components/product/ProductGrid.tsx");

  assert.match(catalog, /ErrorState/);
  assert.match(catalog, /EmptyState/);
  assert.match(grid, /ProductSkeleton/);
  assert.match(grid, /isLoading/);
});
