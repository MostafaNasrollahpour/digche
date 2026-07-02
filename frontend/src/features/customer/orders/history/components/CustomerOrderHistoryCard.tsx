"use client";

import Image from "next/image";
import type { OrderHistoryStatus } from "@/shared/orders/history/types/order-history.types";
import { formatPersianTime } from "@/shared/orders/history/utils/order-history-date";
import type { CustomerOrderHistoryItem } from "../types/customer-order-history.types";
import { toPersianDigits } from "@/shared/utils/persian-number";

type CustomerOrderHistoryCardProps = {
  order: CustomerOrderHistoryItem;
};

const statusLabels: Record<OrderHistoryStatus, string> = {
  pending: "در انتظار تایید",
  preparing: "در حال آماده سازی",
  ready: "آماده تحویل",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

const statusClasses: Record<OrderHistoryStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  preparing: "bg-emerald-50 text-emerald-700",
  ready: "bg-blue-50 text-blue-700",
  delivered: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-50 text-red-600",
};

function resolveImageSrc(src?: string) {
  const value = src?.trim();

  if (!value || value === "undefined" || value === "null") {
    return "/images/cake.webp";
  }

  if (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  return `/images/${value}`;
}

export default function CustomerOrderHistoryCard({
  order,
}: CustomerOrderHistoryCardProps) {
  const imageSrc = resolveImageSrc(order.foodImage);
  const orderTime = formatPersianTime(order.orderedAt);

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-[#FDF7F2]">
        <Image
          src={imageSrc}
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
          آشپز: {order.chefName || "آشپز دیگچه"}
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