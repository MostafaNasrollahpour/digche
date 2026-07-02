
import { apiRequest } from "@/shared/api/api-client";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/shared/api/api-types";
import type { ChefOrder, OrderStatus } from "@/store/order-store";
import { mapOrderDtosToChefOrders } from "@/features/orders/mappers/order.mapper";

type CoreResult<T> = {
  isSuccess?: boolean;
  errorMessage?: string | null;
  data?: T;
};

type CreateOrderPayload = {
  deliveryAddress: string;
};

type OrderStatusCode = "0" | "1" | "2" | "3" | "4";

const orderStatusCodes: Record<OrderStatus, OrderStatusCode> = {
  pending: "0",
  preparing: "1",
  ready: "2",
  delivered: "3",
  cancelled: "4",
};

function getOrderStatusCode(status: OrderStatus): OrderStatusCode {
  return orderStatusCodes[status];
}

function unwrapData<T>(response: T | ApiResponse<T> | CoreResult<T>): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResponse<T> | CoreResult<T>).data as T;
  }

  return response as T;
}

export const ordersApi = {
  async createOrder(payload: CreateOrderPayload) {
    return apiRequest<unknown>(endpoints.orders.create, {
      method: "POST",
      auth: true,
      body: payload,
    });
  },

  async getCustomerOrders(): Promise<ChefOrder[]> {
    const response = await apiRequest<unknown>(endpoints.orders.customer, {
      method: "GET",
      auth: true,
    });

    const data = unwrapData(response);

    return mapOrderDtosToChefOrders(Array.isArray(data) ? data : []);
  },

  async getChefOrders(): Promise<ChefOrder[]> {
    const response = await apiRequest<unknown>(endpoints.orders.chef, {
      method: "GET",
      auth: true,
    });

    const data = unwrapData(response);

    return mapOrderDtosToChefOrders(Array.isArray(data) ? data : []);
  },

  async updateOrderStatus(orderId: number | string, status: OrderStatus) {
    return apiRequest<unknown>(endpoints.orders.updateStatus(orderId), {
      method: "PUT",
      auth: true,
      body: {
        status: getOrderStatusCode(status),
      },
    });
  },
};