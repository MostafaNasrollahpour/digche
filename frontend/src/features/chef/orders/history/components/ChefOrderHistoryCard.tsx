// src/features/chef/orders/components/ChefOrderHistoryCard.tsx

"use client";

import Image from "next/image";
import { ChefOrder, OrderStatus } from "@/store/order-store";
import { toPersianDigits } from "@/shared/utils/persian-number";

type ChefOrderHistoryCardProps = {
  order: ChefOrder;
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "در انتظار تایید",
  preparing: "در حال آماده سازی",
  ready: "آماده تحویل",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

const statusClasses: Record<OrderStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  preparing: "bg-emerald-50 text-emerald-700",
  ready: "bg-blue-50 text-blue-700",
  delivered: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-50 text-red-600",
};

function getValidDate(value?: string) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatPersianTime(value?: string) {
  const date = getValidDate(value);

  if (!date) return "زمان نامشخص";

  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function ChefOrderHistoryCard({
  order,
}: ChefOrderHistoryCardProps) {
  const orderTime = formatPersianTime(order.orderedAt);

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-[#FDF7F2]">
        <Image
          src={order.foodImage}
          alt={order.foodTitle}
          fill
          className="object-cover"
        />
      </div>

      <div className="space-y-2 p-3 text-right">
        <h3 className="truncate text-sm font-extrabold text-gray-950">
          {order.foodTitle}
        </h3>

        <p className="truncate text-xs font-medium text-gray-500">
          مشتری: {order.customerName}
        </p>

        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-bold text-gray-700">
            تعداد: {toPersianDigits(order.quantity)}
          </span>

          <span className="font-medium text-gray-500">{orderTime}</span>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-center text-[11px] font-bold ${
            statusClasses[order.status]
          }`}
        >
          {statusLabels[order.status]}
        </div>
      </div>
    </article>
  );
}