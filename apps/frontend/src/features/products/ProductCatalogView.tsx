import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Breadcrumb, type BreadcrumbItem } from "../../components/common/Breadcrumb";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { PageContainer } from "../../components/layout/PageContainer";
import { MobileFilterDrawer } from "../../components/product/MobileFilterDrawer";
import { PaginationControls } from "../../components/product/PaginationControls";
import { ProductFilters } from "../../components/product/ProductFilters";
import { ProductGrid } from "../../components/product/ProductGrid";
import { ProductToolbar, normalizeSort } from "../../components/product/ProductToolbar";
import { Button } from "../../components/ui/Button";
import type { ProductListQuery, ProductSort } from "../../types/api";
import { useBrands, useCategories, useProducts } from "./productQueries";

type ProductCatalogViewProps = {
  heading?: string;
  description?: string;
  forcedCategory?: string;
  breadcrumbItems?: BreadcrumbItem[];
};

const filterKeys: Array<keyof ProductListQuery> = [
  "category",
  "brand",
  "minPrice",
  "maxPrice",
  "size",
  "color",
  "inStock",
  "campaign",
  "sort",
  "page",
  "limit"
];

function queryFromSearch(searchParams: URLSearchParams, forcedCategory?: string): ProductListQuery {
  const query: ProductListQuery = {};

  filterKeys.forEach((key) => {
    const value = searchParams.get(key);
    if (value) {
      query[key] = value as never;
    }
  });

  query.limit = query.limit ?? "12";
  query.sort = normalizeSort(query.sort);

  if (forcedCategory) {
    query.category = forcedCategory;
  }

  return query;
}

export function ProductCatalogView({
  heading = "Produkter",
  description = "Finn riktig sykkel med filtre som holder seg i URL-en nar siden lastes pa nytt.",
  forcedCategory,
  breadcrumbItems
}: ProductCatalogViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const query = useMemo(() => queryFromSearch(searchParams, forcedCategory), [forcedCategory, searchParams]);
  const productsQuery = useProducts(query);
  const categoriesQuery = useCategories();
  const brandsQuery = useBrands();

  const products = productsQuery.data?.items ?? [];
  const pagination = productsQuery.data?.pagination;
  const categories = categoriesQuery.data ?? [];
  const brands = brandsQuery.data ?? [];

  const updateParam = (name: keyof ProductListQuery, value: string) => {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }

    if (name !== "page") {
      next.delete("page");
    }

    if (forcedCategory) {
      next.delete("category");
    }

    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <PageContainer className="py-8">
      {breadcrumbItems ? <Breadcrumb items={breadcrumbItems} /> : null}
      <div className="mb-6">
        <p className="text-sm font-bold text-[var(--brand-green)]">Produktkatalog</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">{heading}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden self-start rounded-lg bg-white p-4 ring-1 ring-slate-200 lg:sticky lg:top-28 lg:block">
          <h2 className="mb-5 text-lg font-black text-slate-950">Filtrer</h2>
          <ProductFilters
            brands={brands}
            categories={categories}
            filters={query}
            onChange={updateParam}
            onClear={clearFilters}
            showCategory={!forcedCategory}
          />
        </aside>

        <main>
          <ProductToolbar
            onOpenFilters={() => setIsFilterOpen(true)}
            onSortChange={(sort: ProductSort) => updateParam("sort", sort)}
            sort={normalizeSort(query.sort)}
            total={pagination?.total ?? 0}
          />

          <div className="mt-5">
            {productsQuery.isError ? (
              <ErrorState description="Produktlisten kunne ikke hentes fra backend. Sjekk at API-et kjorer og prov igjen." />
            ) : !productsQuery.isLoading && products.length === 0 ? (
              <EmptyState
                action={
                  <Link to="/produkter">
                    <Button variant="ghost">Vis alle produkter</Button>
                  </Link>
                }
                description="Juster filter eller nullstill soket for a se flere produkter."
                title="Ingen produkter funnet"
              />
            ) : (
              <ProductGrid isLoading={productsQuery.isLoading} products={products} />
            )}
          </div>

          {pagination ? (
            <PaginationControls onPageChange={(page) => updateParam("page", String(page))} pagination={pagination} />
          ) : null}
        </main>
      </div>

      <MobileFilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <ProductFilters
          brands={brands}
          categories={categories}
          filters={query}
          onChange={updateParam}
          onClear={clearFilters}
          showCategory={!forcedCategory}
        />
      </MobileFilterDrawer>
    </PageContainer>
  );
}
