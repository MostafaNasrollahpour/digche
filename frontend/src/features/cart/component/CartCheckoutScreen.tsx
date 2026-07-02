"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, ShoppingBag } from "lucide-react";
import { useMemo } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useClearCart } from "@/features/cart/hooks/use-clear-cart";
import { useCreateOrder } from "@/features/orders/hooks/use-create-order";
import {
  getAddressDetailsFromAddress,
  getProvinceCityFromAddress,
} from "@/shared/location/location-text";
import { toPersianDigits } from "@/shared/utils/persian-number";

const toEnglishDigits = (value: string) => {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
};

const getNumericPrice = (price: string) => {
  const englishPrice = toEnglishDigits(price);
  const numericPrice = englishPrice.replace(/[^\d]/g, "");

  return Number(numericPrice) || 0;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fa-IR").format(price);
};

function getUserFullName(
  user: ReturnType<typeof useAuthStore.getState>["currentUser"]
) {
  if (!user) return "مشتری دیگچه";

  return (
    user.name?.trim() ||
    [user.firstName?.trim(), user.lastName?.trim()]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    user.username?.trim() ||
    "مشتری دیگچه"
  );
}

function getAddressView(address?: string | null) {
  const addressText = address?.trim() ?? "";
  const provinceCity = getProvinceCityFromAddress(addressText);
  const details = getAddressDetailsFromAddress(addressText);

  return {
    hasAddress: Boolean(addressText),
    province: provinceCity.province,
    city: provinceCity.city,
    details,
    fullAddress: addressText,
  };
}

export default function CartCheckoutScreen() {
  const router = useRouter();

  const currentUser = useAuthStore((state) => state.currentUser);

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const createOrder = useCreateOrder();
  const clearRemoteCart = useClearCart();

  const address = currentUser?.address ?? currentUser?.location ?? "";
  const addressView = getAddressView(address);

  const receiverName = getUserFullName(currentUser);
  const receiverPhone = currentUser?.phone ?? "شماره تماس ثبت نشده";

  const isSubmitting = createOrder.isPending || clearRemoteCart.isPending;

  const summary = useMemo(() => {
    const totalQuantity = items.reduce((total, item) => {
      return total + item.quantity;
    }, 0);

    const totalPrice = items.reduce((total, item) => {
      const itemPrice = getNumericPrice(item.price);

      return total + itemPrice * item.quantity;
    }, 0);

    return {
      totalQuantity,
      totalPrice,
    };
  }, [items]);

  const handleSubmitOrder = async () => {
    if (items.length === 0 || isSubmitting) return;

    if (!addressView.hasAddress) {
      alert("برای ثبت سفارش باید ابتدا آدرس تحویل را ثبت کنید.");
      return;
    }

    try {
      await createOrder.mutateAsync({
        deliveryAddress: addressView.fullAddress,
      });
      
      try {
        await clearRemoteCart.mutateAsync(undefined);
      } catch {
        console.warn("سفارش ثبت شد، اما خالی کردن سبد خرید ناموفق بود.");
      }

      clearCart();

      alert("سفارش شما با موفقیت ثبت شد.");
      router.push("/customer/orders/history");
    } catch (error) {
      alert(error instanceof Error ? error.message : "ثبت سفارش ناموفق بود.");
    }
  };

  if (items.length === 0) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#FFF1E8] px-4 py-10">
        <section className="mx-auto max-w-5xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-900">
            سبد خرید شما خالی است
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            برای ادامه ثبت سفارش، ابتدا غذایی به سبد خرید اضافه کنید.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-[#D48B8B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c97b7b]"
          >
            برگشت به صفحه اصلی
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#FFF1E8] px-4 py-10">
      <section className="mx-auto max-w-5xl rounded-3xl bg-white px-5 py-8 shadow-sm md:px-8">
        <div className="rounded-xl border border-gray-800 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[#D16565]" />

                <p className="text-sm font-bold text-gray-950">تحویل به:</p>
              </div>

              {addressView.hasAddress ? (
                <>
                  <p className="mt-2 text-sm text-gray-800">
                    {addressView.province && addressView.city
                      ? `${addressView.province}، ${addressView.city}`
                      : addressView.fullAddress}
                  </p>

                  {addressView.details && (
                    <p className="mt-1 text-sm text-gray-800">
                      {toPersianDigits(addressView.details)}
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-2 text-sm font-bold text-red-500">
                  آدرسی برای تحویل ثبت نشده است.
                </p>
              )}

              <p className="mt-2 text-sm text-gray-800">
                تحویل گیرنده: {receiverName}
              </p>

              <p className="mt-1 text-sm text-gray-800">
                شماره تماس: {receiverPhone}
              </p>
            </div>

            <Link
              href="/customer/addresses?returnTo=/cart/checkout&lockCity=true"
              className="shrink-0 text-sm font-bold text-[#D16565] transition hover:text-[#b94f4f]"
            >
              تغییر آدرس
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-[#FFF9F4] p-5">
          <h2 className="text-base font-extrabold text-gray-900">
            خلاصه سفارش
          </h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">تعداد محصولات</span>

              <span className="font-bold text-gray-900">
                {toPersianDigits(summary.totalQuantity)} عدد
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">مبلغ قابل پرداخت</span>

              <span className="font-extrabold text-gray-900">
                {formatPrice(summary.totalPrice)} تومان
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleSubmitOrder}
            disabled={
              items.length === 0 || isSubmitting || !addressView.hasAddress
            }
            className="flex w-full max-w-sm items-center justify-center gap-2 rounded-md bg-green-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingBag size={18} />

            {isSubmitting ? "در حال ثبت..." : "ثبت سفارش و پرداخت"}
          </button>
        </div>
      </section>
    </main>
  );
}