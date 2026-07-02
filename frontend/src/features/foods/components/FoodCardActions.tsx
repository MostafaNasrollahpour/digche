// src/features/foods/components/FoodCardActions.tsx

"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import type { Food } from "../types/food.types";
import { useDeleteChefFood } from "@/features/chef/hooks/use-delete-chef-food";
import { useAddCartItem } from "@/features/cart/hooks/use-add-cart-item";
import { useRemoveCartItem } from "@/features/cart/hooks/use-remove-cart-item";
import { useSetCartItemQuantity } from "@/features/cart/hooks/use-set-cart-item-quantity";
import { toPersianDigits } from "@/shared/utils/persian-number";

interface FoodCardActionsProps {
  food: Food;
  canEditFood: boolean;
  canAddToCart: boolean;
  compact?: boolean;
}

export default function FoodCardActions({
  food,
  canEditFood,
  canAddToCart,
  compact = false,
}: FoodCardActionsProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const cartItem = useCartStore((state) =>
    state.items.find((cartItem) => String(cartItem.id) === String(food.id))
  );

  const quantity = cartItem?.quantity ?? 0;

  const addCartItem = useAddCartItem();
  const removeCartItem = useRemoveCartItem();
  const setCartItemQuantity = useSetCartItemQuantity();

  const isCartPending =
    addCartItem.isPending ||
    removeCartItem.isPending ||
    setCartItemQuantity.isPending;

  const deleteFood = useDeleteChefFood();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const stopActionClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const handleAddToCart = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (isCartPending) return;

    try {
      await addCartItem.mutateAsync({
        dishId: food.id,
        quantity: 1,
      });

      addToCart(food);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "افزودن به سبد خرید ناموفق بود."
      );
    }
  };

  const handleIncreaseQuantity = async (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    if (isCartPending) return;

    try {
      await addCartItem.mutateAsync({
        dishId: food.id,
        quantity: 1,
      });

      increaseQuantity(food.id);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "افزایش تعداد ناموفق بود."
      );
    }
  };

  const handleDecreaseQuantity = async (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    if (isCartPending) return;

    const nextQuantity = quantity - 1;

    try {
      if (nextQuantity <= 0) {
        await removeCartItem.mutateAsync(food.id);
        removeFromCart(food.id);
        return;
      }

      await setCartItemQuantity.mutateAsync({
        dishId: food.id,
        quantity: nextQuantity,
      });

      decreaseQuantity(food.id);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "کاهش تعداد ناموفق بود."
      );
    }
  };

  const handleOpenDeleteDialog = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = (event?: MouseEvent<HTMLElement>) => {
    event?.stopPropagation();

    if (deleteFood.isPending) return;

    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDeleteFood = async (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    try {
      await deleteFood.mutateAsync(food.id);

      removeFromCart(food.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "حذف غذا ناموفق بود.");
    }
  };

  const deleteConfirmDialog = isDeleteDialogOpen ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
      onClick={handleCloseDeleteDialog}
    >
      <div
        dir="rtl"
        onClick={stopActionClick}
        className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-right shadow-2xl"
      >
        <div className="flex flex-row">
          <button
            type="button"
            onClick={handleCloseDeleteDialog}
            disabled={deleteFood.isPending}
            className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="بستن"
          >
            <X size={17} />
          </button>

          <h2 className="text-lg font-extrabold text-gray-900">حذف غذا</h2>
        </div>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          مطمئنی می‌خوای «{food.title}» رو حذف کنی؟ این عملیات قابل برگشت نیست.
        </p>

        <div dir="rtl" className="mt-6 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={handleCloseDeleteDialog}
            disabled={deleteFood.isPending}
            className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={handleConfirmDeleteFood}
            disabled={deleteFood.isPending}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleteFood.isPending ? "در حال حذف..." : "بله، حذف کن"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (canEditFood) {
    if (compact) {
      return (
        <>
          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              href={`/chef/foods/${food.id}/edit`}
              onClick={stopActionClick}
              className="rounded-full bg-[#D48B8B] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#c97b7b]"
            >
              ویرایش
            </Link>

            <button
              type="button"
              onClick={handleOpenDeleteDialog}
              disabled={deleteFood.isPending}
              className="rounded-full bg-[#FDF7F2] px-3 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteFood.isPending ? "..." : "حذف"}
            </button>
          </div>

          {deleteConfirmDialog}
        </>
      );
    }

    return (
      <>
        <div className="grid w-full grid-cols-2 gap-2 min-[420px]:w-auto">
          <Link
            href={`/chef/foods/${food.id}/edit`}
            onClick={stopActionClick}
            className="flex items-center justify-center gap-2 rounded-full bg-[#D48B8B] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#c97b7b]"
          >
            ویرایش
          </Link>

          <button
            type="button"
            onClick={handleOpenDeleteDialog}
            disabled={deleteFood.isPending}
            className="flex items-center justify-center gap-2 rounded-full bg-[#FDF7F2] px-4 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={16} />
            {deleteFood.isPending ? "در حال حذف..." : "حذف"}
          </button>
        </div>

        {deleteConfirmDialog}
      </>
    );
  }

  if (canAddToCart) {
    if (quantity === 0) {
      return (
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isCartPending}
          className={
            compact
              ? "rounded-full bg-[#D48B8B] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#c97b7b] disabled:cursor-not-allowed disabled:opacity-60"
              : "flex items-center justify-center gap-2 rounded-full bg-[#D48B8B] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#c97b7b] disabled:cursor-not-allowed disabled:opacity-60 min-[420px]:justify-start"
          }
        >
          {!compact && <ShoppingCart size={16} />}
          {isCartPending ? "..." : "افزودن"}
        </button>
      );
    }

    return (
      <div
        className={
          compact
            ? "flex items-center gap-2 rounded-full border border-gray-200 bg-white px-1 py-1 shadow-sm"
            : "flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-2 py-1 shadow-sm min-[420px]:w-auto"
        }
      >
        <button
          type="button"
          onClick={handleIncreaseQuantity}
          disabled={isCartPending}
          className={
            compact
              ? "flex h-7 w-7 items-center justify-center rounded-full bg-[#D48B8B] text-white transition hover:bg-[#c97b7b] disabled:cursor-not-allowed disabled:opacity-60"
              : "flex h-8 w-8 items-center justify-center rounded-full bg-[#D48B8B] text-white transition hover:bg-[#c97b7b] disabled:cursor-not-allowed disabled:opacity-60"
          }
          aria-label="زیاد کردن تعداد"
        >
          <Plus size={compact ? 14 : 16} />
        </button>

        <span
          className={
            compact
              ? "min-w-5 text-center text-sm font-bold text-gray-800"
              : "min-w-6 text-center font-bold text-gray-800"
          }
        >
          {toPersianDigits(quantity)}
        </span>

        <button
          type="button"
          onClick={handleDecreaseQuantity}
          disabled={isCartPending}
          className={
            compact
              ? "flex h-7 w-7 items-center justify-center rounded-full bg-[#FDF7F2] text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              : "flex h-8 w-8 items-center justify-center rounded-full bg-[#FDF7F2] text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          }
          aria-label="کم کردن تعداد"
        >
          <Minus size={compact ? 14 : 16} />
        </button>
      </div>
    );
  }

  return null;
}