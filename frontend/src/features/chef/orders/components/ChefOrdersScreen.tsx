// src/features/chef/orders/components/ChefOrdersScreen.tsx

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";
import SearchInput from "@/shared/components/SearchInput";
import ChefOrderCard from "./ChefOrderCard";
import { useChefOrders } from "../hooks/use-chef-orders";
import {
  formatPersianDate,
  formatPersianTime,
  getValidDate,
  isToday,
} from "@/shared/orders/history/utils/order-history-date";

function formatOrderDateTime(value?: string) {
  if (!value) return "";

  const date = formatPersianDate(value);
  const time = formatPersianTime(value);

  if (!date && !time) return "";
  if (!time) return date;
  if (!date) return time;

  return `${date} - ساعت ${time}`;
}

export default function ChefOrdersScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const isChef = currentUser?.role === "chef";

  const [searchTerm, setSearchTerm] = useState("");

  const ordersQuery = useChefOrders({
    enabled: Boolean(isChef),
  });

  const orders = ordersQuery.data ?? [];
  const today = formatPersianDate(new Date());

  const chefOrders = useMemo(() => {
    if (!isChef) return [];

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return orders
      .filter((order) => {
        const orderDate = getValidDate(order.orderedAt);

        return orderDate ? isToday(orderDate) : false;
      })
      .filter((order) => {
        if (!normalizedSearch) return true;

        const orderDateTime = formatOrderDateTime(order.orderedAt).toLowerCase();

        return (
          order.customerName.toLowerCase().includes(normalizedSearch) ||
          order.foodTitle.toLowerCase().includes(normalizedSearch) ||
          orderDateTime.includes(normalizedSearch)
        );
      });
  }, [orders, isChef, searchTerm]);

  if (!isChef) {
    return (
      <section className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">دسترسی غیرمجاز</h1>

          <p className="mt-2 text-sm text-gray-500">
            فقط آشپزها می‌توانند سفارش‌ها را ببینند.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section dir="rtl" className="relative h-full overflow-hidden">
      <div className="flex h-full flex-col px-5 py-7 sm:px-8 lg:px-10">
        <div
          dir="ltr"
          className="mb-12 grid shrink-0 gap-6 lg:grid-cols-[1fr_420px_1fr] lg:items-start"
        >
          <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="جست و جو در سفارش ها..."
              className="max-w-[420px]"
            />
          </div>

          <div className="order-1 text-center lg:order-3 lg:text-right">
            <div className="flex flex-col items-center justify-center gap-3 lg:items-end">
              <div className="flex flex-row items-center gap-2">
                <h1 className="text-3xl font-extrabold text-gray-950">
                  سفارش ها
                </h1>

                <div className="relative h-12 w-12">
                  <Image
                    src="/icons/orders.svg"
                    alt="سفارش ها"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <p dir="rtl" className="mt-2 text-sm text-gray-500">
                {today}
              </p>
            </div>
          </div>

          <div className="hidden lg:block" />
        </div>

        <div className="mx-auto flex min-h-0 w-full max-w-[880px] flex-1 flex-col overflow-hidden">
          <div className="mb-5 hidden h-14 shrink-0 items-center rounded-xl bg-[#F4D692] px-6 shadow-sm md:grid md:grid-cols-[1.35fr_1fr_1fr_90px] md:gap-4">
            <p className="text-center text-xl font-bold text-gray-950">
              مشتری
            </p>

            <p className="text-center text-xl font-bold text-gray-950">غذا</p>

            <p className="text-center text-xl font-bold text-gray-950">
              وضعیت
            </p>

            <p className="text-center text-xl font-bold text-gray-950">تعداد</p>
          </div>

          {ordersQuery.isLoading ? (
            <div className="rounded-3xl border border-orange-100 bg-[#FFF9F4] p-10 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                در حال دریافت سفارش‌ها...
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                لطفاً چند لحظه صبر کنید.
              </p>
            </div>
          ) : ordersQuery.isError ? (
            <div className="rounded-3xl border border-red-100 bg-white p-10 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                دریافت سفارش‌ها ناموفق بود
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                دوباره تلاش کنید یا وضعیت اتصال به بک‌اند را بررسی کنید.
              </p>
            </div>
          ) : chefOrders.length === 0 ? (
            <div className="rounded-3xl border border-orange-100 bg-[#FFF9F4] p-10 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                سفارشی برای نمایش وجود ندارد
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                هنوز سفارشی برای امروز ثبت نشده یا نتیجه‌ای برای جست‌وجوی شما
                پیدا نشد.
              </p>
            </div>
          ) : (
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-2 pl-2">
              {chefOrders.map((order) => (
                <ChefOrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}