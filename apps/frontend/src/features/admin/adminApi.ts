import { api } from "../../lib/api";
import type {
  Brand,
  BrandInput,
  Category,
  CategoryInput,
  Order,
  PaginatedResult,
  Product,
  ProductInput,
  ProductUpdateInput
} from "../../types/api";

export async function fetchAdminProducts(): Promise<Product[]> {
  const result = await api.get<PaginatedResult<Product>>("/products?limit=100");

  return result.items;
}

export async function createAdminProduct(input: ProductInput): Promise<Product> {
  const response = await api.post<{ product: Product }>("/admin/products", input);

  return response.product;
}

export async function updateAdminProduct(input: { id: string; data: ProductUpdateInput }): Promise<Product> {
  const response = await api.patch<{ product: Product }>(`/admin/products/${input.id}`, input.data);

  return response.product;
}

export async function deleteAdminProduct(id: string): Promise<void> {
  await api.delete<Record<string, never>>(`/admin/products/${id}`);
}

export async function fetchAdminCategories(): Promise<Category[]> {
  const response = await api.get<{ categories: Category[] }>("/categories");

  return response.categories;
}

export async function createAdminCategory(input: CategoryInput): Promise<Category> {
  const response = await api.post<{ category: Category }>("/admin/categories", input);

  return response.category;
}

export async function updateAdminCategory(input: { id: string; data: Partial<CategoryInput> }): Promise<Category> {
  const response = await api.patch<{ category: Category }>(`/admin/categories/${input.id}`, input.data);

  return response.category;
}

export async function deleteAdminCategory(id: string): Promise<void> {
  await api.delete<Record<string, never>>(`/admin/categories/${id}`);
}

export async function fetchAdminBrands(): Promise<Brand[]> {
  const response = await api.get<{ brands: Brand[] }>("/brands");

  return response.brands;
}

export async function createAdminBrand(input: BrandInput): Promise<Brand> {
  const response = await api.post<{ brand: Brand }>("/admin/brands", input);

  return response.brand;
}

export async function updateAdminBrand(input: { id: string; data: Partial<BrandInput> }): Promise<Brand> {
  const response = await api.patch<{ brand: Brand }>(`/admin/brands/${input.id}`, input.data);

  return response.brand;
}

export async function deleteAdminBrand(id: string): Promise<void> {
  await api.delete<Record<string, never>>(`/admin/brands/${id}`);
}

export async function fetchAdminOrders(): Promise<Order[]> {
  const response = await api.get<{ orders: Order[] }>("/orders");

  return response.orders;
}

export async function refundAdminOrder(orderId: string): Promise<void> {
  await api.post<Record<string, never>>(`/admin/orders/${orderId}/refund`);
}
