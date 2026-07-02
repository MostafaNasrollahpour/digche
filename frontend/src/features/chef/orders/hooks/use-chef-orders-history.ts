"use client";

import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/features/orders/api/orders.api";

type UseChefOrdersHistoryOptions = {
  enabled?: boolean;
};

export function useChefOrdersHistory(options?: UseChefOrdersHistoryOptions) {
  return useQuery({
    queryKey: ["orders", "chef"],
    queryFn: ordersApi.getChefOrders,
    enabled: options?.enabled ?? true,
  });
}