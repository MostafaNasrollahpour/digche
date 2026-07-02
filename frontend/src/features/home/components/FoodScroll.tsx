"use client";

import { useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import FoodCardClient from "@/features/foods/components/FoodCartClient";
import { useNearbyFoods } from "@/features/foods/hooks/use-nearby-foods";
import { useLocationStore } from "@/store/location-store";
import type { ProvinceCityValue } from "@/shared/location/types/location.types";

function toSearchableText(value?: unknown) {
  if (Array.isArray(value)) {
    return value.join(" ").toLowerCase();
  }

  return String(value ?? "").toLowerCase();
}

function isFoodInSelectedLocation(
  foodLocation?: string | null,
  selectedLocation?: ProvinceCityValue
) {
  if (!selectedLocation?.province || !selectedLocation?.city) {
    return true;
  }

  const normalizedFoodLocation = toSearchableText(foodLocation);

  const normalizedProvince = selectedLocation.province.toLowerCase();
  const normalizedCity = selectedLocation.city.toLowerCase();

  return (
    normalizedFoodLocation.includes(normalizedProvince) ||
    normalizedFoodLocation.includes(normalizedCity)
  );
}

export default function FoodScroll() {
  const selectedLocation = useLocationStore((state) => state.selectedLocation);

  const { data: foods = [], isLoading, isError } = useNearbyFoods();

  const filteredFoods = useMemo(() => {
    return foods.filter((food) =>
      isFoodInSelectedLocation(food.location, selectedLocation)
    );
  }, [foods, selectedLocation]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12" dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-800">اطراف شما</h2>

        <Link
          href="/locals"
          className="flex cursor-pointer items-center font-medium text-orange-600 hover:underline"
        >
          غذاهای بیشتر
          <ChevronLeft size={18} className="mr-1" />
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-gray-700">
            در حال دریافت غذاها...
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-red-500">
            دریافت غذاها ناموفق بود.
          </p>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-gray-700">
            در شهر انتخاب‌شده غذایی پیدا نشد.
          </p>
        </div>
      ) : (
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 sm:gap-6">
          {filteredFoods.map((item) => (
            <FoodCardClient key={item.id} item={item} display="scroll" />
          ))}
        </div>
      )}
    </section>
  );
}