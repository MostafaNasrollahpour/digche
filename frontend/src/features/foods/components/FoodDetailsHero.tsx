// src/features/foods/components/FoodDetailsHero.tsx

"use client";

import Image from "next/image";
import type { MouseEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Star,
  ChefHat,
  PackageCheck,
  Wallet,
  CookingPot,
} from "lucide-react";
import FoodDetailsActions from "./FoodDetailsActions";
import { formatPrice, toPersianDigits } from "@/shared/utils/persian-number";
import { getProvinceCityFromAddress } from "@/shared/location/location-text";

interface FoodDetailsHeroProps {
  food: {
    id: number | string;
    title: string;
    category: string;
    rating: number;
    remaining: string;
    chef: string;
    chefId: number | string;
    location: string;
    price: string;
    unit?: string;
    image: string;
    ingredients?: string;
    description: string;
  };
  canEditFood: boolean;
  canAddToCart: boolean;
  isClickable?: boolean;
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= Math.round(rating);

        return (
          <Star
            key={starNumber}
            size={18}
            className="text-yellow-400"
            fill={isFilled ? "currentColor" : "none"}
            strokeWidth={1.8}
          />
        );
      })}
    </div>
  );
}

function InfoPill({
  icon,
  value,
  label,
  strong = false,
}: {
  icon: ReactNode;
  value: string;
  label?: string;
  strong?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-[1.2rem] bg-[#FFF9F4] px-3 py-2.5 sm:rounded-[1.4rem] sm:px-4 sm:py-3">
      <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1 text-right">
          {label && (
            <p className="mb-0.5 text-[11px] text-gray-400 sm:text-xs">
              {label}
            </p>
          )}

          <p
            className={`truncate ${
              strong
                ? "text-sm font-extrabold text-gray-950 sm:text-lg"
                : "text-xs font-bold text-gray-700 sm:text-sm"
            }`}
          >
            {value}
          </p>
        </div>

        <span className="shrink-0">{icon}</span>
      </div>
    </div>
  );
}

function IngredientsBox({ ingredients }: { ingredients?: string }) {
  const ingredientsList =
    ingredients
      ?.split(/[،,]/)
      .map((ingredient) => ingredient.trim())
      .filter(Boolean) ?? [];

  if (ingredientsList.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 rounded-[1.4rem] bg-[#FFF9F4] px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-extrabold text-gray-900">مواد اولیه</h2>

        <CookingPot size={20} className="shrink-0 text-[#D48B8B]" />
      </div>

      <div className="flex flex-wrap gap-2">
        {ingredientsList.map((ingredient) => (
          <span
            key={ingredient}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm"
          >
            {ingredient}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function FoodDetailsHero({
  food,
  canEditFood,
  canAddToCart,
  isClickable = false,
}: FoodDetailsHeroProps) {
  const router = useRouter();

  const locationText = String(food.location ?? "").trim();
  const { city: foodCity } = getProvinceCityFromAddress(locationText);
  const foodCityLabel = foodCity || "نامشخص";

  const priceText = `${formatPrice(food.price)}${
    food.unit ? ` ${food.unit}` : ""
  }`;

  const goToFoodDetails = () => {
    if (!isClickable) return;
    router.push(`/foods/${food.id}`);
  };

  const stopCardClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const clickableClasses = isClickable
    ? "cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md"
    : "";

  return (
    <section
      dir="rtl"
      onClick={goToFoodDetails}
      className={`overflow-hidden rounded-[2rem] border border-orange-100 bg-white p-4 shadow-sm sm:p-5 ${clickableClasses}`}
    >
      {/* Desktop + Tablet */}
      <div className="hidden min-h-[390px] grid-cols-[minmax(0,1fr)_minmax(280px,43%)] items-stretch gap-5 md:grid lg:gap-6">
        <div className="flex min-w-0 flex-col justify-between text-right">
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-extrabold leading-9 text-gray-950 lg:text-3xl lg:leading-10">
              {food.title}
            </h1>

            <div className="mt-3 flex items-center justify-start gap-3">
              <span className="text-base font-bold text-gray-600">
                {toPersianDigits(food.rating)}
              </span>

              <RatingStars rating={food.rating} />
            </div>

            <p className="mt-4 line-clamp-4 text-sm leading-8 text-gray-600 lg:mt-5 lg:line-clamp-none lg:text-base lg:leading-9">
              {food.description}
            </p>

            <IngredientsBox ingredients={food.ingredients} />

            <div className="mt-6 grid grid-cols-2 gap-3 lg:mt-7 lg:gap-4">
              <InfoPill
                icon={<ChefHat size={21} className="text-[#D48B8B]" />}
                label="آشپز"
                value={food.chef}
              />

              <InfoPill
                icon={<MapPin size={21} className="text-orange-400" />}
                label="شهر"
                value={foodCityLabel}
              />

              <InfoPill
                icon={<PackageCheck size={21} className="text-emerald-500" />}
                label="باقیمانده"
                value={toPersianDigits(food.remaining)}
              />

              <InfoPill
                icon={<Wallet size={21} className="text-gray-400" />}
                label="قیمت"
                value={toPersianDigits(priceText)}
                strong
              />
            </div>
          </div>

          <div
            className="mt-6 border-t border-orange-100 pt-5 lg:mt-8 lg:pt-6"
            onClick={stopCardClick}
          >
            <FoodDetailsActions
              food={food}
              canEditFood={canEditFood}
              canAddToCart={canAddToCart}
            />
          </div>
        </div>

        <div className="relative min-h-[340px] overflow-hidden rounded-[1.7rem] bg-[#FDF7F2] lg:min-h-[390px]">
          <Image
            src={food.image}
            alt={food.title}
            fill
            className="object-cover"
            priority
          />

          <div className="absolute left-4 top-4 rounded-full bg-[#D48B8B] px-5 py-1.5 text-xs font-bold text-white shadow-sm lg:left-5 lg:top-5 lg:px-6 lg:py-2">
            {food.category}
          </div>
        </div>
      </div>

      {/* Mobile only */}
      <div className="md:hidden">
        <div className="text-right">
          <div className="flex flex-row justify-between">
            <h1 className="break-words text-2xl font-extrabold leading-9 text-gray-950">
              {food.title}
            </h1>

            <div className="mt-3 flex items-center justify-start gap-3">
              <span className="text-base font-bold text-gray-600">
                {toPersianDigits(food.rating)}
              </span>

              <RatingStars rating={food.rating} />
            </div>
          </div>

          <p className="mt-0 text-sm leading-8 text-gray-600">
            {food.description}
          </p>

          <IngredientsBox ingredients={food.ingredients} />
        </div>

        <div className="mt-0 space-y-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[#FDF7F2]">
            <Image
              src={food.image}
              alt={food.title}
              fill
              className="object-cover"
              priority
            />

            <div className="absolute left-3 top-3 rounded-full bg-[#D48B8B] px-4 py-1 text-[10px] font-bold text-white shadow-sm">
              {food.category}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <InfoPill
              icon={<ChefHat size={18} className="text-[#D48B8B] sm:size-5" />}
              label="آشپز"
              value={food.chef}
            />

            <InfoPill
              icon={<MapPin size={18} className="text-orange-400 sm:size-5" />}
              label="شهر"
              value={foodCityLabel}
            />

            <InfoPill
              icon={
                <PackageCheck
                  size={18}
                  className="text-emerald-500 sm:size-5"
                />
              }
              label="باقیمانده"
              value={toPersianDigits(food.remaining)}
            />

            <InfoPill
              icon={<Wallet size={18} className="text-gray-400 sm:size-5" />}
              label="قیمت"
              value={toPersianDigits(priceText)}
              strong
            />
          </div>
        </div>

        <div
          className="mt-6 border-t border-orange-100 pt-5"
          onClick={stopCardClick}
        >
          <FoodDetailsActions
            food={food}
            canEditFood={canEditFood}
            canAddToCart={canAddToCart}
          />
        </div>
      </div>
    </section>
  );
}