"use client";

import { FormEvent, useEffect, useState } from "react";
import ProvinceCityDropdown from "@/shared/location/ProvinceCityDropdown";
import { buildFullAddress } from "@/shared/location/location-text";
import type { CustomerAddressPayload } from "../types/customer-address.types";
import { toPersianDigits } from "@/shared/utils/persian-number";

type AddressFormInitialValues = {
  title?: string;
  province?: string;
  city?: string;
  details?: string;
};

type AddressFormProps = {
  onSubmit: (payload: CustomerAddressPayload) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
  initialValues?: AddressFormInitialValues;
  lockCity?: boolean;
};

function normalizeTitle(title?: string) {
  const value = String(title ?? "").trim();

  if (!value || value === "آدرس فعلی") {
    return "خانه";
  }

  return value;
}

export default function AddressForm({
  onSubmit,
  isSubmitting = false,
  onCancel,
  initialValues,
  lockCity = false,
}: AddressFormProps) {
  const [title, setTitle] = useState(normalizeTitle(initialValues?.title));
  const [province, setProvince] = useState(initialValues?.province || "");
  const [city, setCity] = useState(initialValues?.city || "");
  const [details, setDetails] = useState(initialValues?.details || "");

  useEffect(() => {
    const syncTimer = window.setTimeout(() => {
      setTitle(normalizeTitle(initialValues?.title));
      setProvince(initialValues?.province || "");
      setCity(initialValues?.city || "");
      setDetails(initialValues?.details || "");
    }, 0);

    return () => window.clearTimeout(syncTimer);
  }, [
    initialValues?.title,
    initialValues?.province,
    initialValues?.city,
    initialValues?.details,
  ]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const finalTitle = normalizeTitle(title);
    const finalProvince = province.trim();
    const finalCity = city.trim();
    const finalDetails = details.trim();

    if (!finalProvince || !finalCity || !finalDetails) {
      alert("لطفاً استان، شهر و جزئیات آدرس را کامل وارد کنید.");
      return;
    }

    const addressLine = buildFullAddress({
      title: finalTitle,
      province: finalProvince,
      city: finalCity,
      details: finalDetails,
    });

    onSubmit({
      title: finalTitle,
      province: finalProvince,
      city: finalCity,
      details: finalDetails,
      addressLine,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-orange-100 bg-[#FFF9F4] p-4 text-right sm:p-5"    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-gray-800">
            عنوان آدرس
          </span>

          {lockCity ? (
            <div className="flex h-12 w-full items-center rounded-2xl border border-[#EFC5A8] bg-white px-4 text-right text-sm font-extrabold text-gray-900">
              {title || "خانه"}
            </div>
          ) : (
            <input
              value={toPersianDigits(title)}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isSubmitting}
              placeholder="خانه، محل کار..."
              className="h-12 w-full rounded-2xl border border-transparent bg-white px-4 text-right text-sm text-gray-800 outline-none transition focus:border-[#D48B8B] disabled:cursor-not-allowed disabled:opacity-60"
            />
          )}
        </label>

        <div>
          <span className="mb-2 block text-sm font-bold text-gray-800">
            استان و شهر
          </span>

          {lockCity ? (
            <div className="rounded-2xl border border-[#EFC5A8] bg-white px-4 py-3 text-right">
              <p className="text-xs font-bold text-[#D16565]">شهر تحویل</p>

              <p className="mt-1 text-sm font-extrabold text-gray-900">
                {province && city ? `${province}، ${city}` : "شهر انتخاب نشده"}
              </p>

              <p className="mt-1 text-xs leading-6 text-gray-500">
                در مرحله ثبت سفارش، استان و شهر قابل تغییر نیست. فقط جزئیات
                آدرس را اصلاح کن.
              </p>
            </div>
          ) : (
            <ProvinceCityDropdown
              value={{ province, city }}
              onChange={(value) => {
                setProvince(value.province);
                setCity(value.city);
              }}
              placeholder="انتخاب استان و شهر"
            />
          )}
        </div>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-bold text-gray-800">
          جزئیات آدرس
        </span>

        <textarea
          value={toPersianDigits(details)}
          onChange={(event) => setDetails(event.target.value)}
          disabled={isSubmitting}
          rows={4}
          placeholder="خیابان، کوچه، پلاک، واحد..."
          className="w-full resize-none rounded-2xl border border-transparent bg-white px-4 py-3 text-right text-sm leading-7 text-gray-800 outline-none transition focus:border-[#D48B8B] disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            انصراف
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !province || !city}
          className="rounded-2xl bg-[#D48B8B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c97b7b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "در حال ذخیره..." : "ذخیره آدرس"}
        </button>
      </div>
    </form>
  );
}
