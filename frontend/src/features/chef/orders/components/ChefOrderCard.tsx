
// src/features/chef/orders/components/ChefOrderCard.tsx

"use client";

import { useEffect, useState } from "react";
import { toPersianDigits } from "@/shared/utils/persian-number";
import type { ChefOrder, OrderStatus } from "@/store/order-store";
import { useUpdateOrderStatus } from "../hooks/use-update-order-status";

type ChefOrderCardProps = {
  order: ChefOrder;
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "در انتظار تایید",
  preparing: "درحال آماده سازی",
  ready: "آماده تحویل",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

const statusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: "pending", label: "در انتظار تایید" },
  { value: "preparing", label: "درحال آماده سازی" },
  { value: "ready", label: "آماده تحویل" },
  { value: "delivered", label: "تحویل شده" },
  { value: "cancelled", label: "لغو شده" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function formatPersianDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function formatPersianTime(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatOrderDateTime(value: string) {
  return `${formatPersianDate(value)} - ساعت ${formatPersianTime(value)}`;
}

export default function ChefOrderCard({ order }: ChefOrderCardProps) {
  const updateOrderStatusMutation = useUpdateOrderStatus();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    order.status,
  );

  useEffect(() => {
    setSelectedStatus(order.status);
  }, [order.status]);

  const orderedDateTime = formatOrderDateTime(order.orderedAt);
  const isUpdating = updateOrderStatusMutation.isPending;

  const handleStatusChange = (status: OrderStatus) => {
    const previousStatus = selectedStatus;

    setSelectedStatus(status);

    updateOrderStatusMutation.mutate(
      {
        orderId: order.id,
        status,
      },
      {
        onError: () => {
          setSelectedStatus(previousStatus);
        },
      },
    );
  };

  return (
    <>
      {/* Desktop row */}
      <article className="hidden min-h-[92px] items-center rounded-2xl bg-[#FDF7F2] px-6 shadow-[0_4px_8px_rgba(0,0,0,0.16)] md:grid md:grid-cols-[1.35fr_1fr_1fr_90px] md:gap-4">
        <div className="flex items-center justify-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#F2CDB5] text-lg font-extrabold text-gray-900">
            {getInitials(order.customerName)}
          </div>

          <div className="min-w-0 text-right">
            <p className="truncate text-lg font-bold text-gray-950">
              {order.customerName}
            </p>

            <p className="mt-1 text-sm font-bold text-gray-500">
              {orderedDateTime}
            </p>
          </div>
        </div>

        <p className="truncate text-center text-lg font-bold text-gray-950">
          {order.foodTitle}
        </p>

        <div className="flex flex-col items-center justify-center gap-1">
          <select
            value={selectedStatus}
            disabled={isUpdating}
            onChange={(event) =>
              handleStatusChange(event.target.value as OrderStatus)
            }
            className="rounded-xl border border-transparent bg-transparent px-3 py-2 text-center text-lg font-bold text-gray-950 outline-none transition hover:bg-white focus:border-[#D48B8B] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          {isUpdating && (
            <span className="text-xs font-bold text-orange-500">
              در حال ذخیره...
            </span>
          )}

          {updateOrderStatusMutation.isError && (
            <span className="text-xs font-bold text-red-500">ذخیره نشد</span>
          )}
        </div>

        <p className="text-center text-xl font-bold text-gray-950">
          {toPersianDigits(order.quantity)}
        </p>
      </article>

      {/* Mobile card */}
      <article className="rounded-2xl bg-[#FDF7F2] p-4 shadow-sm md:hidden">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F2CDB5] text-base font-extrabold text-gray-900">
            {getInitials(order.customerName)}
          </div>

          <div className="min-w-0 text-right">
            <p className="truncate text-base font-bold text-gray-950">
              {order.customerName}
            </p>

            <p className="mt-1 text-xs font-bold text-gray-500">
              {orderedDateTime}
            </p>
          </div>
        </div>

        <div className="grid gap-3 text-sm">
          <div className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2">
            <span className="text-gray-500">غذا</span>
            <span className="font-bold text-gray-950">{order.foodTitle}</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2">
            <span className="text-gray-500">تعداد</span>
            <span className="font-bold text-gray-950">
              {toPersianDigits(order.quantity)}
            </span>
          </div>

          <div className="rounded-xl bg-white/60 px-3 py-2">
            <span className="mb-2 block text-gray-500">وضعیت</span>

            <select
              value={selectedStatus}
              disabled={isUpdating}
              onChange={(event) =>
                handleStatusChange(event.target.value as OrderStatus)
              }
              className="h-10 w-full rounded-xl border border-orange-100 bg-white px-3 text-sm font-bold text-gray-900 outline-none focus:border-[#D48B8B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {isUpdating && (
              <p className="mt-2 text-xs font-bold text-orange-500">
                در حال ذخیره وضعیت...
              </p>
            )}

            {updateOrderStatusMutation.isError && (
              <p className="mt-2 text-xs font-bold text-red-500">
                تغییر وضعیت ذخیره نشد. دوباره تلاش کنید.
              </p>
            )}
          </div>
        </div>

        <p className="mt-3 text-left text-xs text-gray-400">
          {statusLabels[selectedStatus]}
        </p>
      </article>
    </>
  );
}