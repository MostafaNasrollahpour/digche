"use client";

import { useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import type { OrderStatus } from "@/store/order-store";
import OrderHistoryScreen from "@/shared/orders/history/components/OrderHistoryScreen";
import {
  formatPersianDate,
  formatPersianTime,
  getValidDate,
  groupOrdersByDate,
} from "@/shared/orders/history/utils/order-history-date";
import CustomerOrderHistoryCard from "./CustomerOrderHistoryCard";
import type { CustomerOrderHistoryItem } from "../types/customer-order-history.types";
import { mapChefOrderToCustomerOrderHistoryItem } from "../mappers/customer-order-history.mapper";
import { useCustomerOrdersHistory } from "../hooks/use-customer-orders-history";

const statusLabels: Record<OrderStatus, string> = {
  pending: "در انتظار تایید",
  preparing: "در صف آماده سازی",
  ready: "آماده تحویل",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

function getSearchableOrderText(order: CustomerOrderHistoryItem) {
  const date = getValidDate(order.orderedAt);

  const persianDate = date ? formatPersianDate(date) : "";
  const persianTime = formatPersianTime(order.orderedAt);
  const statusLabel = statusLabels[order.status];

  return [
    order.foodTitle,
    order.chefName,
    order.quantity.toString(),
    order.price,
    order.unit,
    statusLabel,
    persianDate,
    persianTime,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function CustomerOrdersHistoryScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [searchTerm, setSearchTerm] = useState("");

  const ordersQuery = useCustomerOrdersHistory();
  const orders = ordersQuery.data ?? [];

  const today = formatPersianDate(new Date());

  const groupedOrders = useMemo(() => {
    if (!currentUser || currentUser.role !== "customer") return [];

    const normalizedSearch = searchTerm.trim().toLowerCase();

    const customerOrders = orders
      .map(mapChefOrderToCustomerOrderHistoryItem)
      .filter((order) => {
        if (!normalizedSearch) return true;

        return getSearchableOrderText(order).includes(normalizedSearch);
      });

    return groupOrdersByDate(customerOrders);
  }, [orders, currentUser, searchTerm]);

  if (!currentUser || currentUser.role !== "customer") {
    return (
      <section className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">دسترسی غیرمجاز</h1>

        <p className="mt-2 text-sm text-gray-500">
          فقط مشتری‌ها می‌توانند تاریخچه سفارشات خود را ببینند.
        </p>
      </section>
    );
  }

  if (ordersQuery.isLoading) {
    return (
      <section className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">
          در حال دریافت سفارش‌ها...
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          لطفاً چند لحظه صبر کنید.
        </p>
      </section>
    );
  }

  if (ordersQuery.isError) {
    return (
      <section className="rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">
          دریافت سفارش‌ها ناموفق بود
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          دوباره تلاش کنید یا وضعیت اتصال به بک‌اند را بررسی کنید.
        </p>
      </section>
    );
  }

  return (
    <OrderHistoryScreen<CustomerOrderHistoryItem>
      title="تاریخچه سفارش ها"
      dateLabel={today}
      iconSrc="/icons/orders.svg"
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      groups={groupedOrders}
      renderCard={(order) => <CustomerOrderHistoryCard order={order} />}
      searchPlaceholder="جست و جو در سفارش ها..."
      emptyTitle="سفارشی برای نمایش وجود ندارد"
      emptyDescription="هنوز سفارشی ثبت نشده یا نتیجه‌ای برای جست‌وجوی شما پیدا نشد."
      gridClassName="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
    />
  );
}