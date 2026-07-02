"use client";

import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/features/orders/api/orders.api";

export function useChefOrdersHistory() {
  return useQuery({
    queryKey: ["orders", "chef"],
    queryFn: ordersApi.getChefOrders,
  });
}