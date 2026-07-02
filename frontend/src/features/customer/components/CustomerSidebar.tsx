"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  MapPin,
  History,
  MessageSquareText,
  Settings,
  Headphones,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";

const menuItems = [
  {
    title: "آدرس های من",
    href: "/customer/addresses",
    icon: MapPin,
  },
  {
    title: "تاریخچه سفارشات",
    href: "/customer/orders/history",
    icon: History,
    exact: true,
  },
  {
    title: "پیام ها",
    href: "/customer/messages",
    icon: MessageSquareText,
  },
  {
    title: "تنظیمات حساب کاربری",
    href: "/customer/settings",
    icon: Settings,
  },
  {
    title: "پشتیبانی",
    href: "/customer/support",
    icon: Headphones,
  },
];

export default function CustomerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleOpenLogoutDialog = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleCloseLogoutDialog = () => {
    if (isLoggingOut) return;

    setIsLogoutDialogOpen(false);
  };

  const handleConfirmLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logout();

      setIsOpen(false);
      setIsLogoutDialogOpen(false);

      router.push("/");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "خروج از حساب ناموفق بود.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-gray-800 shadow-sm lg:hidden"
        aria-label="باز کردن منو"
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/35 lg:hidden"
          aria-label="بستن منو"
        />
      )}

      <aside
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-[82%] max-w-[340px] flex-col overflow-hidden rounded-l-[2rem] bg-white px-5 py-5 shadow-xl transition-transform duration-300 lg:bottom-6 lg:right-6 lg:top-6 lg:w-[318px] lg:max-w-none lg:translate-x-0 lg:rounded-[1.6rem] lg:shadow-sm ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-5 flex shrink-0 items-start justify-between">
          <div className="mx-auto flex flex-col items-center">
            <Link href="/" className="relative h-[88px] w-28">
              <Image
                src="/icons/Logo.svg"
                alt="دیگچه"
                fill
                className="object-contain"
                priority
              />
            </Link>

            <p className="-mt-1 text-xs text-gray-800">بازار غذای خانگی</p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF9F4] text-gray-700 md:hidden"
            aria-label="بستن منو"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto pl-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between rounded-full px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#F5D8C6] text-gray-950"
                    : "text-gray-800 hover:bg-[#FFF9F4]"
                }`}
              >
                <span className="truncate">{item.title}</span>
                <Icon size={20} className="shrink-0" />
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleOpenLogoutDialog}
          disabled={isLoggingOut}
          className="mt-4 flex shrink-0 items-center justify-between rounded-full bg-[#D97777] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#cf6969] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{isLoggingOut ? "در حال خروج..." : "خروج از حساب"}</span>
          <LogOut size={20} className="shrink-0" />
        </button>
      </aside>

      {isLogoutDialogOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4"
          onClick={handleCloseLogoutDialog}
        >
          <div
            dir="rtl"
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-right shadow-2xl"
          >
            <button
              type="button"
              onClick={handleCloseLogoutDialog}
              disabled={isLoggingOut}
              className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="بستن"
            >
              <X size={17} />
            </button>

            <div className="flex items-center gap-3">


              <div>
                <h2 className="text-lg font-extrabold text-gray-900">
                  خروج از حساب
                </h2>


              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-gray-600">
              مطمئنی می‌خوای از حسابت خارج شی؟
            </p>

            <div dir="rtl" className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleCloseLogoutDialog}
                disabled={isLoggingOut}
                className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? "در حال خروج..." : "بله، خارج شو"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}