// src/features/chef/foods/components/ChefFoodsScreen.tsx

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import SearchInput from "@/shared/components/SearchInput";
import FoodCard from "@/features/foods/components/FoodCard";
import { useAuthStore } from "@/store/auth-store";
import { useChefFoods } from "../../hooks/use-chef-foods";
import { toPersianDigits } from "@/shared/utils/persian-number";

export default function ChefFoodsScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const { data: foods = [] } = useChefFoods();

  const [searchTerm, setSearchTerm] = useState("");

  const chefFoods = useMemo(() => {
    if (!currentUser || currentUser.role !== "chef") {
      return [];
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return foods
      .filter(
        (food) =>
          String(food.chefId) === String(currentUser.publicId ?? currentUser.id)
      )
      .filter((food) => {
        if (!normalizedSearch) return true;

        return (
          food.title.toLowerCase().includes(normalizedSearch) ||
          food.category.toLowerCase().includes(normalizedSearch)
        );
      });
  }, [foods, currentUser, searchTerm]);

  if (!currentUser || currentUser.role !== "chef") {
    return (
      <section className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">دسترسی غیرمجاز</h1>

          <p className="mt-2 text-sm text-gray-500">
            فقط آشپزها می‌توانند به این صفحه دسترسی داشته باشند.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section dir="rtl" className="relative h-full min-h-0 overflow-hidden">
      <div className="flex h-full min-h-0 flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className="shrink-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-right">
              <h1 className="text-2xl font-extrabold text-gray-950">
                غذاهای من
              </h1>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                فقط غذاهایی نمایش داده می‌شوند که متعلق به حساب شما هستند.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="جست و جو در غذاها..."
                className="w-full sm:w-80"
              />

              <Link
                href="/chef/foods/new"
                className="flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#EFC5A8] px-6 text-sm font-bold text-gray-900 transition hover:bg-[#e9b892] sm:w-auto"
              >
                <Plus size={19} />
                افزودن غذا
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-8 h-px w-full max-w-[94%] bg-[#D9D9D9]" />

          <div className="mt-8 text-right">
            <h2 className="text-xl font-extrabold text-gray-900">
              غذاهای فعال:
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              تعداد غذاهای شما: {toPersianDigits(chefFoods.length)}
            </p>
          </div>
        </div>

<div className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4 pl-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
  {chefFoods.length === 0 ? (
    <div className="rounded-3xl border border-orange-100 bg-[#FFF9F4] p-6 text-center sm:p-10">
      <h3 className="text-xl font-bold text-gray-800">
        غذایی برای نمایش وجود ندارد
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        هنوز غذایی با حساب شما ثبت نشده یا نتیجه‌ای برای جست‌وجوی شما پیدا نشد.
      </p>

      <Link
        href="/chef/foods/new"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#D48B8B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c97b7b]"
      >
        <Plus size={18} />
        افزودن اولین غذا
      </Link>
    </div>
  ) : (
<div className="grid w-full grid-cols-[repeat(auto-fit,minmax(286px,300px))] justify-center gap-x-2 gap-y-5 pb-8 sm:gap-x-3 md:gap-x-4 lg:gap-x-5 xl:gap-x-6 2xl:gap-x-7">     {chefFoods.map((food) => (
        <FoodCard
          key={food.id}
          item={food}
          variant="chef"
          display="scroll"
        />
      ))}
    </div>
  )}

        </div>
      </div>
    </section>
  );
}