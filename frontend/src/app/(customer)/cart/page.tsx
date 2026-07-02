"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Plus, Minus, Trash2, MapPin, ChefHat } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import CartSummary from "@/features/cart/component/CartSummary";
import PageHeader from "@/shared/components/SharedHeader";
import { useCart } from "@/features/cart/hooks/use-cart";
import { useAddCartItem } from "@/features/cart/hooks/use-add-cart-item";
import { useRemoveCartItem } from "@/features/cart/hooks/use-remove-cart-item";
import { useSetCartItemQuantity } from "@/features/cart/hooks/use-set-cart-item-quantity";
import { formatPrice, toPersianDigits } from "@/shared/utils/persian-number";

export default function CartPage() {
  const currentUser = useAuthStore((state) => state.currentUser);

  const items = useCartStore((state) => state.items);
  const setCartItems = useCartStore((state) => state.setCartItems);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const cartQuery = useCart(currentUser?.role === "customer");
  const addCartItem = useAddCartItem();
  const removeCartItem = useRemoveCartItem();
  const setCartItemQuantity = useSetCartItemQuantity();

  const isMutating =
    addCartItem.isPending ||
    removeCartItem.isPending ||
    setCartItemQuantity.isPending;

  useEffect(() => {
    if (!cartQuery.data) return;

    setCartItems(cartQuery.data);
  }, [cartQuery.data, setCartItems]);

  const handleIncreaseQuantity = async (itemId: number | string) => {
    try {
      await addCartItem.mutateAsync({
        dishId: itemId,
        quantity: 1,
      });

      increaseQuantity(itemId);
    } catch (error) {
      alert(error instanceof Error ? error.message : "افزایش تعداد ناموفق بود.");
    }
  };

  const handleDecreaseQuantity = async (itemId: number | string) => {
    const item = items.find((cartItem) => String(cartItem.id) === String(itemId));

    if (!item) return;

    const nextQuantity = item.quantity - 1;

    try {
      if (nextQuantity <= 0) {
        await removeCartItem.mutateAsync(itemId);
        removeFromCart(itemId);
        return;
      }

      await setCartItemQuantity.mutateAsync({
        dishId: itemId,
        quantity: nextQuantity,
      });

      decreaseQuantity(itemId);
    } catch (error) {
      alert(error instanceof Error ? error.message : "کاهش تعداد ناموفق بود.");
    }
  };

  const handleRemoveItem = async (itemId: number | string) => {
    try {
      await removeCartItem.mutateAsync(itemId);
      removeFromCart(itemId);
    } catch (error) {
      alert(error instanceof Error ? error.message : "حذف غذا از سبد ناموفق بود.");
    }
  };

  if (!currentUser || currentUser.role !== "customer") {
    return (
      <main dir="rtl" className="min-h-screen bg-[#FFF9F4] px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <PageHeader title="سبد خرید" />

          <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
            <h2 className="mb-3 text-2xl font-bold text-gray-800">
              دسترسی غیرمجاز
            </h2>

            <p className="text-gray-500">
              فقط مشتری‌ها می‌توانند سبد خرید داشته باشند.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (cartQuery.isLoading) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#FFF9F4] px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <PageHeader title="سبد خرید" />

          <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
            <h2 className="mb-3 text-2xl font-bold text-gray-800">
              در حال دریافت سبد خرید...
            </h2>
          </div>
        </div>
      </main>
    );
  }

  if (cartQuery.isError) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#FFF9F4] px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <PageHeader title="سبد خرید" />

          <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
            <h2 className="mb-3 text-2xl font-bold text-gray-800">
              دریافت سبد خرید ناموفق بود
            </h2>

            <p className="text-red-500">
              وضعیت بک‌اند یا توکن کاربر را بررسی کن.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#FFF9F4] px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <PageHeader title="سبد خرید" />

          <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
            <h2 className="mb-3 text-2xl font-bold text-gray-800">
              سبد خرید شما خالی است
            </h2>

            <p className="text-gray-500">
              هنوز غذایی به سبد خرید اضافه نکرده‌اید.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#FFF9F4] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <PageHeader title="سبد خرید" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="mt-1 mr-6 text-sm text-gray-500">
            {toPersianDigits(items.length)} غذا در سبد خرید شماست
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex items-center gap-3 rounded-3xl border border-orange-100 bg-white p-3 shadow-sm transition hover:shadow-md sm:gap-4 sm:p-4"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-28">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1 text-right">
                  <h2 className="truncate text-base font-bold text-gray-900 sm:text-lg">
                    {item.title}
                  </h2>

                  <div className="mt-2 flex flex-col gap-1 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:text-sm">
                    {item.chef && (
                      <span className="flex items-center gap-1">
                        <ChefHat
                          size={14}
                          className="shrink-0 text-[#D48B8B]"
                        />
                        <span className="truncate">{item.chef}</span>
                      </span>
                    )}

                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin
                          size={14}
                          className="shrink-0 text-orange-400"
                        />
                        <span className="truncate">{item.location}</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex w-fit items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm sm:gap-2">
                    <button
                      type="button"
                      onClick={() => handleIncreaseQuantity(item.id)}
                      disabled={isMutating}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D48B8B] text-white transition hover:bg-[#c97b7b] disabled:cursor-not-allowed disabled:opacity-60 sm:h-8 sm:w-8"
                      aria-label="زیاد کردن تعداد"
                    >
                      <Plus size={15} />
                    </button>

                    <span className="min-w-6 text-center text-xs font-bold text-gray-800 sm:min-w-8 sm:text-sm">
                      {toPersianDigits(item.quantity)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDecreaseQuantity(item.id)}
                      disabled={isMutating}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FDF7F2] text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 sm:h-8 sm:w-8"
                      aria-label="کم کردن تعداد"
                    >
                      <Minus size={15} />
                    </button>
                  </div>
                </div>

                <div dir="rtl" className="flex min-w-18 shrink-0 flex-col items-end gap-4 self-stretch border-r border-orange-100 pr-3 sm:min-w-32 sm:gap-5 sm:pr-4">
                  <div className="text-right">
                    <p className="text-[11px] text-gray-400 sm:text-xs">
                      قیمت
                    </p>

                    <p className="text-sm font-bold text-gray-900 sm:text-lg">
                        {formatPrice(item.price)}

                      {item.unit && (
                        <span className="ml-1 text-xs font-normal text-gray-500 sm:text-sm">
                          {" "}{item.unit}
                        </span>
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isMutating}
                    className="mt-auto flex items-center gap-1 rounded-full text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 sm:py-2 sm:text-sm"
                  >
                    <Trash2 size={15} />
                    <span className="hidden sm:inline">حذف</span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          <CartSummary />
        </div>
      </div>
    </main>
  );
}