"use client";

import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/features/orders/api/orders.api";

type UseChefOrdersOptions = {
  enabled?: boolean;
};

export function useChefOrders(options?: UseChefOrdersOptions) {
  return useQuery({
    queryKey: ["orders", "chef"],
    queryFn: ordersApi.getChefOrders,
    enabled: options?.enabled ?? true,
  });
}