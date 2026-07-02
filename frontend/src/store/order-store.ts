
// src/store/order-store.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createFakeOrders, createFakeCustomerOrders } from "@/data/orders";
export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export type ChefOrder = {
  id: number | string;
  chefId: number | string;
  chefName?: string;
  customerId?: number | string;
  customerName: string;
  customerPhone?: string;
  foodId: number | string;
  foodTitle: string;
  foodImage: string;
  quantity: number;
  price: string;
  unit?: string;
  status: OrderStatus;
  orderedAt: string;
};

type CreateChefOrderPayload = Omit<ChefOrder, "id" | "status" | "orderedAt"> & {
  status?: OrderStatus;
  orderedAt?: string;
};

type OrderStore = {
  orders: ChefOrder[];
  addOrders: (newOrders: CreateChefOrderPayload[]) => void;
  updateOrderStatus: (orderID: number | string, status: OrderStatus) => void;
  clearOrders: () => void;
  seedFakeOrders: (chefId: number | string) => void;
  seedFakeCustomerOrders: (customerId: number | string) => void;
};

const initialOrders: ChefOrder[] = [];

function createOrderId(index: number) {
  return Date.now() + index;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: initialOrders,

      addOrders: (newOrders) => {
        if (newOrders.length === 0) return;

        set((state) => {
          const orderedAt = new Date().toISOString();

          const ordersToAdd: ChefOrder[] = newOrders.map((order, index) => ({
            id: createOrderId(index),
            chefId: order.chefId,
            chefName: order.chefName,
            customerId: order.customerId,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            foodId: order.foodId,
            foodTitle: order.foodTitle,
            foodImage: order.foodImage,
            quantity: order.quantity,
            price: order.price,
            unit: order.unit,
            status: order.status ?? "preparing",
            orderedAt: order.orderedAt ?? orderedAt,
          }));

          return {
            orders: [...ordersToAdd, ...state.orders],
          };
        });
      },

      updateOrderStatus: (orderID, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            String(order.id) === String(orderID) ? { ...order, status } : order,
          ),
        }));
      },

      clearOrders: () => {
        set({ orders: [] });
      },

      seedFakeOrders: (chefId) => {
        set({
          orders: createFakeOrders(Number(chefId)),
        });
      },

      seedFakeCustomerOrders: (customerId) => {
        set({
          orders: createFakeCustomerOrders(Number(customerId)),
        });
      },
    }),
    {
      name: "digche-orders",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        orders: state.orders,
      }),
    },
  ),
);