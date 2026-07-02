// src/features/foods/components/FoodCard.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Star, MapPin } from "lucide-react";
import FoodCardActions from "./FoodCardActions";
import type { Food } from "../types/food.types";
import { formatPrice, toPersianDigits } from "@/shared/utils/persian-number";
import { getProvinceCityFromAddress } from "@/shared/location/location-text";

interface FoodCardProps {
  item: Food;
  variant?: "customer" | "chef";
  display?: "scroll" | "grid" | "compact";
  canEditFood?: boolean;
  canAddToCart?: boolean;
  isClickable?: boolean;
  showChefMeta?: boolean;
}

export default function FoodCard({
  item,
  variant = "customer",
  display = "grid",
  canEditFood,
  canAddToCart,
  isClickable = false,
  showChefMeta,
}: FoodCardProps) {
  const router = useRouter();

  const resolvedCanEditFood = canEditFood ?? variant === "chef";
  const resolvedCanAddToCart = canAddToCart ?? variant === "customer";

  const isScroll = display === "scroll";
  const isCompact = display === "compact";

  const shouldShowChefMeta = showChefMeta ?? variant === "customer";

  const hasChef = Boolean(String(item.chef ?? "").trim());

  const locationText = String(item.location ?? "").trim();
  const { province: foodProvince, city: foodCity } =
    getProvinceCityFromAddress(locationText);

  const foodLocationLabel = foodCity || foodProvince || locationText;
  const hasLocation = Boolean(foodLocationLabel);

  const foodDetailsHref = `/foods/${item.id}`;

  const cardClass = isScroll
    ? "w-[286px] min-w-[286px] max-w-[300px] snap-start sm:w-[300px] sm:min-w-[300px]"
    : "w-full min-w-0";

  const imageClass = isCompact
    ? "relative aspect-square w-28 shrink-0 overflow-hidden sm:w-32"
    : isScroll
      ? "relative h-[218px] w-full overflow-hidden sm:h-[226px]"
      : "relative aspect-[4/3] w-full overflow-hidden";

  const clickableClasses = isClickable
    ? "cursor-pointer hover:-translate-y-0.5"
    : "";

  const goToFoodDetails = () => {
    if (!isClickable) return;

    router.push(foodDetailsHref);
  };

  const stopCardClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  if (isCompact) {
    return (
      <article
        dir="rtl"
        onClick={goToFoodDetails}
        className={`flex w-full gap-3 overflow-hidden rounded-3xl border border-gray-100 bg-white p-2 shadow-sm transition hover:shadow-md ${clickableClasses}`}
      >
        <Link
          href={foodDetailsHref}
          onClick={isClickable ? stopCardClick : undefined}
          className={imageClass}
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="rounded-[1.5rem] object-cover"
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-between py-1 text-right">
          <div>
            <div className="flex items-start justify-between gap-2">
              <Link
                href={foodDetailsHref}
                onClick={isClickable ? stopCardClick : undefined}
                className="min-w-0"
              >
                <h3 className="truncate text-base font-bold text-gray-800">
                  {item.title}
                </h3>
              </Link>

              <div className="flex shrink-0 items-center gap-1 text-yellow-500">
                <span className="text-xs font-bold text-gray-700">
                  {toPersianDigits(item.rating)}
                </span>
                <Star size={13} fill="currentColor" />
              </div>
            </div>

            <p className="mt-1 truncate text-xs text-gray-500">
              {toPersianDigits(item.remaining)}
            </p>

            {shouldShowChefMeta && hasLocation && (
              <p className="mt-1 flex items-center justify-end gap-1 text-xs text-gray-500">
                <span className="truncate">{foodLocationLabel}</span>
                <MapPin size={13} className="shrink-0 text-orange-400" />
              </p>
            )}
          </div>

          <div
            onClick={stopCardClick}
            className="mt-2 flex items-center justify-between gap-2 border-t border-gray-200 pt-2"
          >
            <span className="truncate text-sm font-bold text-gray-900">
              {formatPrice(item.price)}
              {item.unit && (
                <span className="mr-1 text-xs font-normal text-gray-500">
                  {item.unit}
                </span>
              )}
            </span>

            <FoodCardActions
              food={item}
              canEditFood={resolvedCanEditFood}
              canAddToCart={resolvedCanAddToCart}
              compact
            />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      dir="rtl"
      onClick={goToFoodDetails}
      className={`${cardClass} flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md ${clickableClasses}`}
    >
      <Link
        href={foodDetailsHref}
        onClick={isClickable ? stopCardClick : undefined}
        className="block"
      >
        <div className={imageClass}>
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="rounded-[2.5rem] object-cover p-2"
          />

          <div className="absolute left-6 top-4 rounded-full bg-[#D48B8B] px-5 py-1 text-xs text-white opacity-90 sm:px-6">
            {item.category}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 text-right sm:p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <Link
            href={foodDetailsHref}
            onClick={isClickable ? stopCardClick : undefined}
            className="min-w-0 flex-1"
          >
            <h3 className="truncate text-lg font-bold text-gray-800 sm:text-xl">
              {item.title}
            </h3>
          </Link>

          <div className="flex shrink-0 items-center gap-1 text-yellow-500">
            <span className="text-sm font-bold text-gray-700">
              {toPersianDigits(item.rating)}
            </span>
            <Star size={14} fill="currentColor" />
          </div>
        </div>

        <div className="mb-5 space-y-1 text-sm text-gray-600 sm:mb-6">
          <p className="truncate">{toPersianDigits(item.remaining)}</p>

          {shouldShowChefMeta && hasChef && (
            <p className="truncate">{item.chef}</p>
          )}

          {shouldShowChefMeta && hasLocation && (
            <p className="flex items-center justify-end gap-1">
              <span className="truncate">{foodLocationLabel}</span>
              <MapPin size={14} className="shrink-0 text-orange-400" />
            </p>
          )}
        </div>

        <div
          onClick={stopCardClick}
          className="mt-auto flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between"
        >
          <FoodCardActions
            food={item}
            canEditFood={resolvedCanEditFood}
            canAddToCart={resolvedCanAddToCart}
          />

          <span
            dir="rtl"
            className="text-left text-lg font-bold text-gray-900 min-[420px]:text-right"
          >
            {formatPrice(item.price)}

            {item.unit && (
              <span className="mr-1 text-sm font-normal text-gray-500">
                {item.unit}
              </span>
            )}
          </span>
        </div>
      </div>
    </article>
  );
}