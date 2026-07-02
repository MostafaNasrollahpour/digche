"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useCustomerAddresses } from "../hooks/use-customer-addresses";

export default function SelectedCustomerAddressBanner() {
  const currentUser = useAuthStore((state) => state.currentUser);

  const { data: addresses = [] } = useCustomerAddresses({
    enabled: currentUser?.role === "customer",
  });

  if (!currentUser || currentUser.role !== "customer") {
    return null;
  }

  const selectedAddress =
    addresses.find((address) => address.isDefault) ?? addresses[0];

  return (
    <div className="mb-5 rounded-2xl border border-orange-100 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/customer/addresses"
          className="w-full shrink-0 rounded-full bg-[#EFC5A8] px-5 py-2 text-center text-xs font-bold text-gray-900 transition hover:bg-[#e9b892] sm:w-auto"        >
          تغییر آدرس
        </Link>

        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <p className="text-xs font-bold text-[#D16565]">موقعیت فعلی شما</p>
            <MapPin size={16} className="text-orange-400" />
          </div>

          {selectedAddress ? (
            <>
              <h2 className="mt-1 text-sm font-extrabold text-gray-950">
                {selectedAddress.title}
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-600">
                {selectedAddress.addressLine}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              هنوز آدرسی انتخاب نشده است.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}