"use client";

import { ShoppingCart, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";

export default function HomeHeader() {
  const currentUser = useAuthStore((state) => state.currentUser);

  const profileHref =
    currentUser?.role === "chef"
      ? "/chef"
      : currentUser?.role === "customer"
        ? "/customer"
        : "/auth";

  return (
    <header className="mx-auto w-[90%] bg-[#FFF9F4] px-6 py-3 md:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Image
              className="h-14 w-16 object-cover sm:h-18 sm:w-20"
              src="/icons/Logo.svg"
              alt="لوگو دیگچه"
              width={250}
              height={250}
            />
          </div>

          <p className="mr-16 mt-[-10px] text-[13px] font-medium text-black">
            طعم اصیل خانگی...!
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href={profileHref}
            className="group text-gray-700 transition-colors hover:text-orange-600"
            aria-label="پروفایل کاربر"
          >
            <User
              size={26}
              strokeWidth={1.5}
              className="text-gray-700 transition-colors group-hover:text-orange-600"
            />
          </Link>

          <div className="h-6 w-px bg-gray-300" />

          <Link
            href="/cart"
            className="text-gray-700 transition-colors hover:text-orange-600"
            aria-label="سبد خرید"
          >
            <ShoppingCart size={26} strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      <div className="mt-2.5 h-px w-full bg-gray-800" />
    </header>
  );
}