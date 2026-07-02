"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../api/orders.api";

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}