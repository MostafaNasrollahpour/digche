"use client";

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";

export default function HomeFooter() {
  const currentUser = useAuthStore((state) => state.currentUser);

  const isChef = currentUser?.role === "chef";

  return (
    <footer className="border-t px-4 sm:px-6 border-gray-200 bg-white pb-8 pt-16" dir="rtl">
      <div className="container mx-auto px-4 lg:px-12">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* ستون اول: درباره ما و لوگو */}
          <div className="mt-[-25px] space-y-6">
            <div className="flex items-end gap-0">
              <Image src="/icons/Logo.svg" alt="لوگو" width={80} height={80} />

              <span className="text-sm font-bold text-gray-800">
                طعم اصیل خانگی
              </span>
            </div>

            <p className="text-justify text-sm leading-7 text-gray-500">
              تجربه لذت‌بخش سفارش آنلاین غذا با بهترین کیفیت و سریع‌ترین زمان
              ممکن. ما در کنار شما هستیم تا طعم‌های بی‌نظیر را به خانه‌هایتان
              بیاوریم.
            </p>
          </div>

          {/* ستون دوم: دسترسی سریع */}
          <div>
            <h3 className="mb-6 text-lg font-bold text-gray-800">
              دسترسی سریع
            </h3>

            {isChef ? (
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-gray-500 transition-colors hover:text-[#C46E3F]"
                  >
                    صفحه اصلی
                  </Link>
                </li>

                <li>
                  <Link
                    href="/locals"
                    className="text-sm text-gray-500 transition-colors hover:text-[#C46E3F]"
                  >
                    منوی غذاها
                  </Link>
                </li>

                <li>
                  <Link
                    href="/chef/messages"
                    className="text-sm text-gray-500 transition-colors hover:text-[#C46E3F]"
                  >
                    پیام‌ها
                  </Link>
                </li>

                <li>
                  <Link
                    href="/chef/support"
                    className="text-sm text-gray-500 transition-colors hover:text-[#C46E3F]"
                  >
                    پشتیبانی
                  </Link>
                </li>
              </ul>
            ) : (
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-gray-500 transition-colors hover:text-[#C46E3F]"
                  >
                    صفحه اصلی
                  </Link>
                </li>

                <li>
                  <Link
                    href="/locals"
                    className="text-sm text-gray-500 transition-colors hover:text-[#C46E3F]"
                  >
                    منوی غذاها
                  </Link>
                </li>

                <li>
                  <Link
                    href="/customer/messages"
                    className="text-sm text-gray-500 transition-colors hover:text-[#C46E3F]"
                  >
                    پیام‌ها
                  </Link>
                </li>

                <li>
                  <Link
                    href="/customer/support"
                    className="text-sm text-gray-500 transition-colors hover:text-[#C46E3F]"
                  >
                    پشتیبانی
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* ستون سوم: تماس با ما */}
          <div>
            <h3 className="mb-6 text-lg font-bold text-gray-800">
              تماس با ما
            </h3>

            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-gray-500">
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  <Phone size={16} className="text-[#C46E3F]" />
                </div>

                <span>۰۲۱-۱۲۳۴۵۶۷۸</span>
              </li>

              <li className="flex items-center gap-3 text-sm text-gray-500">
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  <Mail size={16} className="text-[#C46E3F]" />
                </div>

                <span>info@digche.com</span>
              </li>

              <li className="flex items-start gap-3 text-sm text-gray-500">
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  <MapPin size={16} className="text-[#C46E3F]" />
                </div>

                <span className="leading-6">
                  بابل، خیابان شریعتی، دانشگاه نوشیروانی
                </span>
              </li>
            </ul>
          </div>

          {/* ستون چهارم: نمادهای الکترونیک */}
          <div className="flex flex-col items-center">
            <h3 className="mb-6 w-full text-right text-lg font-bold text-gray-800">
              نمادهای اعتماد
            </h3>

            <div className="h-24 w-24 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <Image
                className="h-18 w-20 object-cover"
                src="/icons/Enamad.svg"
                alt="نماد اعتماد دیگچه"
                width={250}
                height={250}
              />
            </div>
          </div>
        </div>

        {/* کپی‌رایت نهایی */}
        <div className="border-t border-gray-200 pt-8 text-center">
          <p className="text-xs text-gray-400">
            تمامی حقوق برای تیم دیگچه محفوظ است.© {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}