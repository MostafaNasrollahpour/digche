"use client";

import { CheckCircle2, MapPin, Trash2 } from "lucide-react";
import type { CustomerAddress } from "../types/customer-address.types";

type CustomerAddressCardProps = {
  address: CustomerAddress;
  isSelected?: boolean;
  isSelecting?: boolean;
  isDeleting?: boolean;
  onSelect: (address: CustomerAddress) => void;
  onDelete: (addressId: number | string) => void;
};

export default function CustomerAddressCard({
  address,
  isSelected = false,
  isSelecting = false,
  isDeleting = false,
  onSelect,
  onDelete,
}: CustomerAddressCardProps) {
  return (
    <article
      className={`rounded-xl border px-5 py-4 transition ${
        isSelected
          ? "border-[#D48B8B] bg- shadow-sm"
          : "border-gray-200 bg-white hover:border-orange-100"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex shrink-0 items-center gap-2">
          {isSelected && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <CheckCircle2 size={14} />
              آدرس فعلی
            </span>
          )}

          <button
            type="button"
            onClick={() => onDelete(address.id)}
            disabled={isDeleting}
            className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="حذف آدرس"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="min-w-0 flex-1 text-right">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h3 className="truncate text-sm font-extrabold text-gray-950">
              {address.title}
            </h3>

            <MapPin size={17} className="shrink-0 text-gray-800" />
          </div>

          <p className="mt-2 text-sm leading-7 text-gray-700">
            {address.addressLine}
          </p>
        </div>
      </div>

      {!isSelected && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => onSelect(address)}
            disabled={isSelecting}
            className="h-9 w-full rounded-full bg-[#EFC5A8] px-5 text-xs font-bold ... sm:w-auto"
          >
            {isSelecting ? "در حال انتخاب..." : "انتخاب به عنوان آدرس فعلی"}
          </button>
        </div>
      )}
    </article>
  );
}