"use client";

import { useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import type { ChefOrder, OrderStatus } from "@/store/order-store";
import OrderHistoryScreen from "@/shared/orders/history/components/OrderHistoryScreen";
import {
  formatPersianDate,
  formatPersianTime,
  getValidDate,
  groupOrdersByDate,
} from "@/shared/orders/history/utils/order-history-date";
import ChefOrderHistoryCard from "./ChefOrderHistoryCard";
import { useChefOrdersHistory } from "../../hooks/use-chef-orders-history";

const statusLabels: Record<OrderStatus, string> = {
  pending: "در انتظار تایید",
  preparing: "درحال آماده سازی",
  ready: "آماده تحویل",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

function getSearchableOrderText(order: ChefOrder) {
  const date = getValidDate(order.orderedAt);

  const persianDate = date ? formatPersianDate(date) : "";
  const persianTime = formatPersianTime(order.orderedAt);
  const statusLabel = statusLabels[order.status];

  return [
    order.customerName,
    order.foodTitle,
    order.customerPhone,
    order.quantity.toString(),
    statusLabel,
    persianDate,
    persianTime,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function ChefOrdersHistoryScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const isChef = currentUser?.role === "chef";

  const [searchTerm, setSearchTerm] = useState("");

  const ordersQuery = useChefOrdersHistory({
    enabled: Boolean(isChef),
  });

  const orders = ordersQuery.data ?? [];
  const today = formatPersianDate(new Date());

  const groupedOrders = useMemo(() => {
    if (!isChef) return [];

    const normalizedSearch = searchTerm.trim().toLowerCase();

    const chefOrders = orders.filter((order) => {
      if (!normalizedSearch) return true;

      return getSearchableOrderText(order).includes(normalizedSearch);
    });

    return groupOrdersByDate(chefOrders);
  }, [orders, isChef, searchTerm]);

  if (!isChef) {
    return (
      <section className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">دسترسی غیرمجاز</h1>

        <p className="mt-2 text-sm text-gray-500">
          فقط آشپزها می‌توانند تاریخچه سفارش‌ها را ببینند.
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

        <p className="mt-2 text-sm text-gray-500">لطفاً چند لحظه صبر کنید.</p>
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
    <OrderHistoryScreen<ChefOrder>
      title="تاریخچه سفارش ها"
      dateLabel={today}
      iconSrc="/icons/orders.svg"
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      groups={groupedOrders}
      renderCard={(order) => <ChefOrderHistoryCard order={order} />}
      searchPlaceholder="جست و جو در سفارش ها..."
      emptyTitle="سفارشی برای نمایش وجود ندارد"
      emptyDescription="هنوز سفارشی ثبت نشده یا نتیجه‌ای برای جست‌وجوی شما پیدا نشد."
      gridClassName="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
    />
  );
}