"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import SearchInput from "@/shared/components/SearchInput";
import type { OrderHistoryGroupData } from "../types/order-history.types";
import OrderHistoryGroup from "./OrderHistoryGroup";

type OrderHistoryScreenProps<TOrder extends { id: number | string }> = {
  title: string;
  dateLabel: string;
  iconSrc?: string;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  groups: OrderHistoryGroupData<TOrder>[];
  renderCard: (order: TOrder) => ReactNode;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  gridClassName?: string;
};

export default function OrderHistoryScreen<
  TOrder extends { id: number | string },
>({
  title,
  dateLabel,
  iconSrc = "/icons/orders.svg",
  searchTerm,
  onSearchTermChange,
  groups,
  renderCard,
  searchPlaceholder = "جست و جو در سفارش ها...",
  emptyTitle = "سفارشی برای نمایش وجود ندارد",
  emptyDescription = "هنوز سفارشی ثبت نشده یا نتیجه‌ای برای جست‌وجوی شما پیدا نشد.",
  gridClassName = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
}: OrderHistoryScreenProps<TOrder>) {
  return (
    <section dir="rtl" className="relative h-full overflow-hidden">
      <div className="flex h-full flex-col px-5 py-7 sm:px-8 lg:px-10">
        <div
          dir="ltr"
          className=" grid shrink-0 gap-6 lg:grid-cols-[1fr_420px_1fr] lg:items-start"
        >
          <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
            <SearchInput
              value={searchTerm}
              onChange={onSearchTermChange}
              placeholder={searchPlaceholder}
              className="max-w-105"
            />
          </div>

          <div className="order-1 text-center lg:order-3 lg:text-right">
            <div className="flex flex-col items-center justify-center gap-3 lg:items-end">
              <div className="flex flex-row items-center gap-2">
                <h1 className="text-[18px] font-extrabold text-gray-950">
                  {title}
                </h1>

                <div className="relative h-12 w-12">
                  <Image
                    src={iconSrc}
                    alt={title}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <p dir="rtl" className="text-sm text-gray-500">
                {dateLabel}
              </p>
            </div>
          </div>

          <div className="hidden lg:block" />
        </div>

        <div className="mx-auto flex min-h-0 w-full max-w-245 flex-1 flex-col">
          {groups.length === 0 ? (
            <div className="rounded-3xl border border-orange-100 bg-[#FFF9F4] p-10 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                {emptyTitle}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {emptyDescription}
              </p>
            </div>
          ) : (
            <div className="min-h-0 flex-1 pt-7 space-y-4 overflow-y-auto pb-2 pl-2">
              {groups.map((group) => (
                <OrderHistoryGroup
                  key={group.key}
                  title={group.label}
                  orders={group.orders}
                  renderCard={renderCard}
                  gridClassName={gridClassName}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}