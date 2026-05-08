import { api } from "../../lib/api";
import type {
  Brand,
  Category,
  PaginatedResult,
  Product,
  ProductDetailResponse,
  ProductListQuery
} from "../../types/api";

function cleanQuery(query: ProductListQuery): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, key === "sort" && value === "bestsellers" ? "newest" : value);
    }
  });

  return params;
}

export async function fetchProducts(query: ProductListQuery): Promise<PaginatedResult<Product>> {
  const params = cleanQuery(query);
  const suffix = params.size > 0 ? `?${params.toString()}` : "";

  return api.get<PaginatedResult<Product>>(`/products${suffix}`);
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const response = await api.get<ProductDetailResponse>(`/products/${slug}`);

  return response.product;
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await api.get<{ categories: Category[] }>("/categories");

  return response.categories;
}

export async function fetchCategory(slug: string): Promise<Category> {
  const response = await api.get<{ category: Category }>(`/categories/${slug}`);

  return response.category;
}

export async function fetchBrands(): Promise<Brand[]> {
  const response = await api.get<{ brands: Brand[] }>("/brands");

  return response.brands;
}
