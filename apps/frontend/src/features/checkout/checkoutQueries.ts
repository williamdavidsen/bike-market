import { useMutation } from "@tanstack/react-query";
import { completeMockPayment, startCheckout } from "./checkoutApi";

export function useStartCheckout() {
  return useMutation({
    mutationFn: startCheckout
  });
}

export function useCompleteMockPayment() {
  return useMutation({
    mutationFn: ({ paymentId, orderId }: { paymentId: string; orderId: string }) =>
      completeMockPayment(paymentId, orderId)
  });
}
