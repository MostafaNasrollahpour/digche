"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, ReceiptText } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
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

export default function CartSummary() {
  const router = useRouter();

  const items = useCartStore((state) => state.items);

  const summaryRef = useRef<HTMLElement | null>(null);
  const [summaryHeight, setSummaryHeight] = useState(0);

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

  useEffect(() => {
    if (!summaryRef.current) return;

    const updateHeight = () => {
      if (!summaryRef.current) return;

      setSummaryHeight(summaryRef.current.offsetHeight);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(summaryRef.current);

    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const handleContinue = () => {
    if (items.length === 0) return;

    router.push("/cart/checkout");
  };

  return (
    <>
      <div
        aria-hidden="true"
        className="lg:hidden"
        style={{
          height: summaryHeight ? summaryHeight + 32 : 0,
        }}
      />

      <aside
        ref={summaryRef}
        dir="rtl"
        className="fixed bottom-4 left-4 right-4 z-50 h-fit rounded-3xl border border-orange-100 bg-white p-5 shadow-[0_-8px_30px_rgba(0,0,0,0.10)] lg:sticky lg:top-6 lg:left-auto lg:right-auto lg:bottom-auto lg:z-auto lg:w-full lg:shadow-sm"
      >
        <div className="mb-5 flex items-center gap-2 border-b border-orange-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDF7F2] text-[#D48B8B]">
            <ReceiptText size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">خلاصه سفارش</h2>
            <p className="text-sm text-gray-500">جزئیات سبد خرید شما</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">تعداد محصولات</span>
            <span className="font-bold text-gray-800">
              {toPersianDigits(summary.totalQuantity)} عدد
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">مجموع قیمت محصولات</span>
            <span className="font-bold text-gray-800">
              {formatPrice(summary.totalPrice)} تومان
            </span>
          </div>

          <div className="border-t border-dashed border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">مبلغ قابل پرداخت</span>

              <span className="text-xl font-extrabold text-gray-900">
                {formatPrice(summary.totalPrice)}
                <span className="mr-1 text-sm font-normal text-gray-500">
                  تومان
                </span>
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={items.length === 0}
            onClick={handleContinue}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#D48B8B] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c97b7b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBag size={18} />
            ثبت و ادامه
          </button>
        </div>
      </aside>
    </>
  );
}