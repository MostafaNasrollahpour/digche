import { apiRequest } from "@/shared/api/api-client";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/shared/api/api-types";
import type { ChefOrder } from "@/store/order-store";
import { mapOrderDtosToChefOrders } from "../mappers/order.mapper";

type CoreResult<T> = {
  isSuccess?: boolean;
  errorMessage?: string | null;
  data?: T;
};

type CreateOrderPayload = {
  items?: Array<{
    dishId: number | string;
    quantity: number;
  }>;
  deliveryAddress?: string;
};

function unwrapData<T>(response: T | ApiResponse<T> | CoreResult<T>): T {
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResponse<T> | CoreResult<T>).data as T;
  }

  return response as T;
}

export const ordersApi = {
  async createOrder(payload?: CreateOrderPayload) {
    return apiRequest<unknown>(endpoints.orders.create, {
      method: "POST",
      auth: true,
      ...(payload ? { body: payload } : {}),
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
};