import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addCartItem, clearCart, fetchCart, removeCartItem, updateCartItem } from "./cartApi";

export const cartKeys = {
  all: ["cart"] as const,
  current: ["cart", "current"] as const
};

export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCartItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: cartKeys.all });
    }
  });
}

export function useCart() {
  return useQuery({
    queryKey: cartKeys.current,
    queryFn: fetchCart
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCartItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: cartKeys.all });
    }
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCartItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: cartKeys.all });
    }
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: cartKeys.all });
    }
  });
}
