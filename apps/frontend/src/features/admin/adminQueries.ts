import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminBrand,
  createAdminCategory,
  createAdminProduct,
  deleteAdminBrand,
  deleteAdminCategory,
  deleteAdminProduct,
  fetchAdminBrands,
  fetchAdminCategories,
  fetchAdminOrders,
  fetchAdminProducts,
  refundAdminOrder,
  updateAdminBrand,
  updateAdminCategory,
  updateAdminProduct
} from "./adminApi";

export const adminKeys = {
  products: ["admin", "products"] as const,
  categories: ["admin", "categories"] as const,
  brands: ["admin", "brands"] as const,
  orders: ["admin", "orders"] as const
};

function useInvalidateAdmin() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminKeys.products }),
      queryClient.invalidateQueries({ queryKey: adminKeys.categories }),
      queryClient.invalidateQueries({ queryKey: adminKeys.brands }),
      queryClient.invalidateQueries({ queryKey: adminKeys.orders })
    ]);
  };
}

export function useAdminProducts() {
  return useQuery({ queryKey: adminKeys.products, queryFn: fetchAdminProducts });
}

export function useAdminCategories() {
  return useQuery({ queryKey: adminKeys.categories, queryFn: fetchAdminCategories });
}

export function useAdminBrands() {
  return useQuery({ queryKey: adminKeys.brands, queryFn: fetchAdminBrands });
}

export function useAdminOrders() {
  return useQuery({ queryKey: adminKeys.orders, queryFn: fetchAdminOrders });
}

export function useCreateAdminProduct() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: createAdminProduct, onSuccess: invalidate });
}

export function useUpdateAdminProduct() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: updateAdminProduct, onSuccess: invalidate });
}

export function useDeleteAdminProduct() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: deleteAdminProduct, onSuccess: invalidate });
}

export function useCreateAdminCategory() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: createAdminCategory, onSuccess: invalidate });
}

export function useUpdateAdminCategory() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: updateAdminCategory, onSuccess: invalidate });
}

export function useDeleteAdminCategory() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: deleteAdminCategory, onSuccess: invalidate });
}

export function useCreateAdminBrand() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: createAdminBrand, onSuccess: invalidate });
}

export function useUpdateAdminBrand() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: updateAdminBrand, onSuccess: invalidate });
}

export function useDeleteAdminBrand() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: deleteAdminBrand, onSuccess: invalidate });
}

export function useRefundAdminOrder() {
  const invalidate = useInvalidateAdmin();
  return useMutation({ mutationFn: refundAdminOrder, onSuccess: invalidate });
}
