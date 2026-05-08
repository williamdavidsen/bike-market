import { useQuery } from "@tanstack/react-query";
import type { ProductListQuery } from "../../types/api";
import { fetchBrands, fetchCategories, fetchCategory, fetchProductBySlug, fetchProducts } from "./catalogApi";

export const productKeys = {
  all: ["products"] as const,
  list: (query: ProductListQuery) => [...productKeys.all, "list", query] as const,
  detail: (slug: string) => [...productKeys.all, "detail", slug] as const,
  categories: ["categories"] as const,
  category: (slug: string) => [...productKeys.categories, slug] as const,
  brands: ["brands"] as const
};

export function useProducts(query: ProductListQuery) {
  return useQuery({
    queryKey: productKeys.list(query),
    queryFn: () => fetchProducts(query)
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    enabled: Boolean(slug),
    queryKey: productKeys.detail(slug ?? ""),
    queryFn: () => fetchProductBySlug(slug ?? "")
  });
}

export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: fetchCategories
  });
}

export function useCategory(slug: string | undefined) {
  return useQuery({
    enabled: Boolean(slug),
    queryKey: productKeys.category(slug ?? ""),
    queryFn: () => fetchCategory(slug ?? "")
  });
}

export function useBrands() {
  return useQuery({
    queryKey: productKeys.brands,
    queryFn: fetchBrands
  });
}
