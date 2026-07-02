"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit3,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  MessageSquareText,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import type { Food } from "../types/food.types";
import { useDeleteChefFood } from "@/features/chef/hooks/use-delete-chef-food";
import { useAddCartItem } from "@/features/cart/hooks/use-add-cart-item";
import { useRemoveCartItem } from "@/features/cart/hooks/use-remove-cart-item";
import { useSetCartItemQuantity } from "@/features/cart/hooks/use-set-cart-item-quantity";
import { toPersianDigits } from "@/shared/utils/persian-number";

interface FoodDetailsActionsProps {
  food: Food;
  canEditFood: boolean;
  canAddToCart: boolean;
}

function getChefChatHref(food: Food) {
  const params = new URLSearchParams({
    chefId: String(food.chefId),
    chefName: food.chef || "آشپز دیگچه",
    foodId: String(food.id),
    foodTitle: food.title,
  });

  return `/customer/messages?${params.toString()}`;
}

export default function FoodDetailsActions({
  food,
  canEditFood,
  canAddToCart,
}: FoodDetailsActionsProps) {
  const router = useRouter();

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

  const chefChatHref = getChefChatHref(food);
  const canMessageChef = canAddToCart && Boolean(food.chefId);

  const handleAddToCart = async () => {
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

  const handleIncreaseQuantity = async () => {
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

  const handleDecreaseQuantity = async () => {
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

  const handleConfirmDeleteFood = async () => {
    try {
      await deleteFood.mutateAsync(food.id);

      removeFromCart(food.id);
      setIsDeleteDialogOpen(false);

      router.push("/chef/foods");
    } catch (error) {
      alert(error instanceof Error ? error.message : "حذف غذا ناموفق بود.");
    }
  };

  if (canEditFood) {
    return (
      <>
        <div dir="ltr"  className="grid w-full grid-cols-[1fr_1.35fr] gap-3">
                  <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={deleteFood.isPending}
            className="flex h-14 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-red-100 px-4 text-sm font-bold text-red-600 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-40"
          >
            <Trash2 size={18} />
            حذف غذا
          </button>  
          <Link
            href={`/chef/foods/${food.id}/edit`}
            className="flex h-14 flex-1 items-center justify-center gap-3 rounded-full bg-[#111322] px-5 text-sm font-bold text-white transition hover:bg-gray-800 sm:text-base"
          >
            <Edit3 size={21} />
            ویرایش اطلاعات غذا
          </Link>


        </div>

        {isDeleteDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
            <div
              dir="rtl"
              className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-right shadow-2xl"
            >
              <div className="flex flex-row">
                <button
                  type="button"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={deleteFood.isPending}
                  className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="بستن"
                >
                  <X size={17} />
                </button>

                <h2 className="text-lg font-extrabold text-gray-900">
                  حذف غذا
                </h2>
              </div>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                مطمئنی می‌خوای «{food.title}» رو حذف کنی؟ این عملیات قابل برگشت
                نیست.
              </p>

              <div
                dir="rtl"
                className="mt-6 flex items-center justify-center gap-5"
              >
                <button
                  type="button"
                  onClick={() => setIsDeleteDialogOpen(false)}
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
        )}
      </>
    );
  }

  if (canAddToCart) {
    if (quantity === 0) {
      return (
        <div className="grid w-full grid-cols-[1fr_1.35fr] gap-3">
          {canMessageChef && (
            <Link
              href={chefChatHref}
              className="flex h-14 items-center justify-center gap-2 rounded-full bg-[#FDF7F2] px-4 text-sm font-bold text-[#D16565] transition hover:bg-orange-50"
            >
              <MessageSquareText size={19} />
              پیام
            </Link>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isCartPending}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#D48B8B] px-5 text-sm font-bold text-white transition hover:bg-[#c97b7b] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            <ShoppingCart size={20} />
            {isCartPending ? "در حال افزودن..." : "افزودن به سبد خرید"}
          </button>
        </div>
      );
    }

    return (
      <div className="flex w-full items-center justify-center gap-3">
        {canMessageChef && (
          <Link
            href={chefChatHref}
            className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-[#FDF7F2] px-5 text-sm font-bold text-[#D16565] transition hover:bg-orange-50"
          >
            <MessageSquareText size={19} />
            پیام
          </Link>
        )}

        <div className="flex h-14 w-40 max-w-sm items-center justify-between rounded-full border border-gray-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={handleIncreaseQuantity}
            disabled={isCartPending}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D48B8B] text-white transition hover:bg-[#c97b7b] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="زیاد کردن تعداد"
          >
            <Plus size={18} />
          </button>

          <span className="min-w-8 text-center text-lg font-bold text-gray-900">
            {toPersianDigits(quantity)}
          </span>

          <button
            type="button"
            onClick={handleDecreaseQuantity}
            disabled={isCartPending}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF7F2] text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="کم کردن تعداد"
          >
            <Minus size={18} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}