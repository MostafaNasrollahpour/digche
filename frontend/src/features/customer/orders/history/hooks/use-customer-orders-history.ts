"use client";

import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/features/orders/api/orders.api";

export function useCustomerOrdersHistory() {
  return useQuery({
    queryKey: ["orders", "customer"],
    queryFn: ordersApi.getCustomerOrders,
  });
}