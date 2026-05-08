import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

test("stage 12 adds product catalog components and query integration", () => {
  const files = [
    "apps/frontend/src/features/products/ProductCatalogView.tsx",
    "apps/frontend/src/features/products/catalogApi.ts",
    "apps/frontend/src/features/products/productQueries.ts",
    "apps/frontend/src/components/product/ProductCard.tsx",
    "apps/frontend/src/components/product/ProductGrid.tsx",
    "apps/frontend/src/components/product/ProductFilters.tsx",
    "apps/frontend/src/components/product/ProductToolbar.tsx",
    "apps/frontend/src/components/product/PaginationControls.tsx",
    "apps/frontend/src/components/product/MobileFilterDrawer.tsx",
    "apps/frontend/src/components/product/StockBadge.tsx",
    "apps/frontend/src/components/common/Breadcrumb.tsx"
  ];

  for (const file of files) {
    assert.ok(read(file).length > 200, `${file} should be implemented`);
  }
});

test("stage 12 keeps filters, sorting, and pagination in URL query params", () => {
  const catalogView = read("apps/frontend/src/features/products/ProductCatalogView.tsx");

  for (const term of ["useSearchParams", "category", "brand", "minPrice", "maxPrice", "inStock", "campaign", "sort", "page"]) {
    assert.match(catalogView, new RegExp(term), `catalog view should handle ${term}`);
  }

  assert.match(catalogView, /setSearchParams/);
});

test("stage 12 connects to backend catalog endpoints", () => {
  const catalogApi = read("apps/frontend/src/features/products/catalogApi.ts");

  assert.match(catalogApi, /\/products/);
  assert.match(catalogApi, /\/categories/);
  assert.match(catalogApi, /\/brands/);
  assert.match(catalogApi, /PaginatedResult<Product>/);
});

test("stage 12 product list and category pages use shared catalog behavior", () => {
  const productList = read("apps/frontend/src/pages/ProductListPage.tsx");
  const category = read("apps/frontend/src/pages/CategoryPage.tsx");

  assert.match(productList, /ProductCatalogView/);
  assert.match(category, /ProductCatalogView/);
  assert.match(category, /forcedCategory/);
  assert.match(category, /breadcrumbItems/);
  assert.doesNotMatch(productList, /PlaceholderPage/);
});

test("stage 12 product cards cover price, stock, image, and add-to-cart states", () => {
  const card = read("apps/frontend/src/components/product/ProductCard.tsx");
  const stock = read("apps/frontend/src/components/product/StockBadge.tsx");

  for (const term of ["formatNok", "salePriceNok", "basePriceNok", "loading=\"lazy\"", "Legg i handlekurv", "disabled"]) {
    assert.match(card, new RegExp(term), `ProductCard should include ${term}`);
  }

  for (const term of ["På lager", "Få igjen", "Utsolgt"]) {
    assert.match(stock, new RegExp(term), `StockBadge should include ${term}`);
  }
});
