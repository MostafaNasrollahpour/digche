"use client";

import { useMutation } from "@tanstack/react-query";
import { ordersApi } from "@/features/orders/api/orders.api";
import type { OrderStatus } from "@/store/order-store";

type UpdateOrderStatusInput = {
  orderId: number | string;
  status: OrderStatus;
};

export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: ({ orderId, status }: UpdateOrderStatusInput) =>
      ordersApi.updateOrderStatus(orderId, status),
  });
}