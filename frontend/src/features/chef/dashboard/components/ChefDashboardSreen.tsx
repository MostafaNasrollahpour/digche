"use client";

import Image from "next/image";
import { ClipboardList, DollarSign, Star, Utensils } from "lucide-react";
import { useMemo } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useOrderStore } from "@/store/order-store";
import { useChefFoods } from "@/features/chef/hooks/use-chef-foods";
import { useChefDashboard } from "../hooks/use-chef-dashboard";
import DashboardStatCard from "./DashboardStatCard";
import ChefProfileBadge from "../../components/ChefProfileBadge";

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function parsePrice(value?: string) {
  if (!value) return 0;

  const normalizedValue = normalizeDigits(value).replace(/[^\d]/g, "");

  return Number(normalizedValue) || 0;
}

function getValidDate(value?: string) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function isSameMonth(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth()
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 1,
  }).format(value);
}

export default function ChefDashboardScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const orders = useOrderStore((state) => state.orders);
  const { data: foods = [] } = useChefFoods();

  const {
    data: backendDashboard,
    isLoading,
    isError,
  } = useChefDashboard();

  const localDashboardData = useMemo(() => {
    if (!currentUser || currentUser.role !== "chef") {
      return {
        todayOrdersCount: 0,
        monthlyIncome: 0,
        activeFoodsCount: 0,
      };
    }

    const userId = String(currentUser.id);
    const publicId = String(currentUser.publicId ?? currentUser.id);
    const now = new Date();

    const chefOrders = orders.filter(
      (order) =>
        String(order.chefId) === userId || String(order.chefId) === publicId
    );

    const todayOrdersCount = chefOrders.filter((order) => {
      const orderDate = getValidDate(order.orderedAt);

      if (!orderDate) return false;

      return isSameDay(orderDate, now) && order.status !== "cancelled";
    }).length;

    const monthlyIncome = chefOrders
      .filter((order) => {
        const orderDate = getValidDate(order.orderedAt);

        if (!orderDate) return false;

        return isSameMonth(orderDate, now) && order.status === "delivered";
      })
      .reduce((total, order) => {
        return total + parsePrice(order.price) * order.quantity;
      }, 0);

    const activeFoodsCount = foods.filter(
      (food) =>
        String(food.chefId) === userId || String(food.chefId) === publicId
    ).length;

    return {
      todayOrdersCount,
      monthlyIncome,
      activeFoodsCount,
    };
  }, [currentUser, foods, orders]);

  if (!currentUser || currentUser.role !== "chef") {
    return (
      <section className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">دسترسی غیرمجاز</h1>

          <p className="mt-2 text-sm text-gray-500">
            فقط آشپزها می‌توانند داشبورد را ببینند.
          </p>
        </div>
      </section>
    );
  }

  const avatarSrc =
    backendDashboard?.chefAvatar || currentUser.avatar || "/images/chef.webp";

  const isBase64Avatar = avatarSrc.startsWith("data:");

  const displayName =
    backendDashboard?.chefName ||
    currentUser.name ||
    currentUser.chefDisplayName ||
    currentUser.username ||
    "آشپز دیگچه";

  const monthlyIncome =
    backendDashboard?.stats.monthlyIncome ?? localDashboardData.monthlyIncome;

  const todayOrdersCount =
    backendDashboard?.stats.todayOrdersCount ??
    localDashboardData.todayOrdersCount;

  const customerRating = backendDashboard?.stats.customerRating ?? 4.8;

  const activeFoodsCount =
    backendDashboard?.stats.activeFoodsCount ??
    localDashboardData.activeFoodsCount;

  return (
    <section dir="rtl" className="relative h-full overflow-y-auto lg:overflow-hidden">
      <div className="h-full px-7 py-6 lg:px-9">
        <div className="flex items-start justify-between gap-5">
          <div className="text-right">
            <h1 className="text-[22px] font-extrabold leading-8 text-gray-950">
              👋 خوش اومدی!
            </h1>


            {isLoading && (
              <p className="mt-2 text-[10px] font-medium text-gray-400">
                در حال دریافت اطلاعات داشبورد...
              </p>
            )}

          </div>

          <ChefProfileBadge/>
          {/* <div
            dir="ltr"
            className="flex h-9 w-[118px] shrink-0 items-center justify-end gap-2 rounded-[3px] bg-[#F2E6DB] px-2 shadow-sm"
          >
            <span
              dir="rtl"
              className="truncate text-[10px] font-medium text-gray-900"
              title={displayName}
            >
              {displayName}
            </span>

            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[#F2CDB5]">
              <Image
                src={avatarSrc}
                alt={displayName}
                fill
                className="object-cover"
                unoptimized={isBase64Avatar}
              />
            </div>
          </div> */}
        </div>

        <div className="mt-14 flex justify-center">
          <div className="grid w-full max-w-[520px] lg:grid-cols-2 sm:grid-cols-1 gap-y-5 sm:gap-5">
            <DashboardStatCard
              title="درآمد این ماه"
              value={formatNumber(monthlyIncome)}
              subtitle="تومان"
              icon={DollarSign}
              cardClassName="bg-[#DDF8D7]"
              iconClassName="bg-[#69B978] text-gray-950"
            />

            <DashboardStatCard
              title="سفارش‌های امروز"
              value={formatNumber(todayOrdersCount)}
              subtitle="سفارش جدید"
              icon={ClipboardList}
              cardClassName="bg-[#F2C6A7]"
              iconClassName="bg-[#D87843] text-gray-950"
            />

            <DashboardStatCard
              title="امتیاز مشتریان"
              value={formatNumber(customerRating)}
              subtitle="از ۵ امتیاز"
              icon={Star}
              cardClassName="bg-[#F6FF8D]"
              iconClassName="bg-[#DDE34F] text-gray-950"
            />

            <DashboardStatCard
              title="غذاهای فعال"
              value={formatNumber(activeFoodsCount)}
              subtitle="غذای فعال در فروش"
              icon={Utensils}
              cardClassName="bg-[#E7C3F3]"
              iconClassName="bg-[#B23BD2] text-gray-950"
            />
          </div>
        </div>
      </div>
    </section>
  );
}