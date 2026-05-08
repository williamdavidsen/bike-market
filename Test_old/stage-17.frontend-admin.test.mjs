import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

test("stage 17 admin routes are protected and use an admin layout", () => {
  const router = read("apps/frontend/src/app/router.tsx");
  const adminRoute = read("apps/frontend/src/components/layout/AdminRoute.tsx");
  const layout = read("apps/frontend/src/components/admin/AdminLayout.tsx");

  assert.match(router, /AdminRoute/);
  assert.match(router, /AdminLayout/);
  assert.match(router, /admin/);
  assert.match(router, /products/);
  assert.match(router, /orders/);
  assert.match(router, /categories/);
  assert.match(adminRoute, /user\.role !== "ADMIN"/);
  assert.match(layout, /Dashboard/);
  assert.match(layout, /Produkter/);
  assert.match(layout, /Ordre/);
});

test("stage 17 admin API layer exposes product, category, brand, and order management", () => {
  const api = read("apps/frontend/src/features/admin/adminApi.ts");
  const queries = read("apps/frontend/src/features/admin/adminQueries.ts");

  for (const endpoint of ["/admin/products", "/admin/categories", "/admin/brands", "/admin/orders/"]) {
    assert.match(api, new RegExp(endpoint.replaceAll("/", "\\/")), `admin api should use ${endpoint}`);
  }

  for (const hook of [
    "useAdminProducts",
    "useCreateAdminProduct",
    "useUpdateAdminProduct",
    "useDeleteAdminProduct",
    "useAdminOrders",
    "useRefundAdminOrder"
  ]) {
    assert.match(queries, new RegExp(hook), `admin queries should expose ${hook}`);
  }
});

test("stage 17 admin dashboard and product management cover expected store-owner tasks", () => {
  const dashboard = read("apps/frontend/src/pages/AdminDashboardPage.tsx");
  const products = read("apps/frontend/src/pages/AdminProductsPage.tsx");

  for (const card of ["Total orders", "Total revenue", "Low stock products", "Pending orders"]) {
    assert.match(dashboard, new RegExp(card), `dashboard should include ${card}`);
  }

  for (const term of [
    "Product list",
    "Product create/edit form",
    "Inventory management",
    "Legg til produkt",
    "Rediger",
    "Slett",
    "inventoryQuantity",
    "updateProduct.mutate"
  ]) {
    assert.match(products, new RegExp(term), `AdminProducts should include ${term}`);
  }
});

test("stage 17 admin category, brand, and order pages are present", () => {
  const categories = read("apps/frontend/src/pages/AdminCategoriesPage.tsx");
  const orders = read("apps/frontend/src/pages/AdminOrdersPage.tsx");

  assert.match(categories, /AdminCategories/);
  assert.match(categories, /Brand management/);
  assert.match(categories, /createCategory\.mutate/);
  assert.match(categories, /createBrand\.mutate/);
  assert.match(orders, /Order list/);
  assert.match(orders, /Order detail/);
  assert.match(orders, /Order status update/);
  assert.match(orders, /Marker REFUNDED/);
});
