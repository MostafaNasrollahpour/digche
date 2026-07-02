"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Edit3, Plus, Trash2, X } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLocationStore } from "@/store/location-store";
import AddressForm from "./AddressForm";
import { useCustomerAddresses } from "../hooks/use-customer-addresses";
import { useCreateCustomerAddress } from "../hooks/use-create-customer-address";
import { useDeleteCustomerAddress } from "../hooks/use-delete-customer-address";
import type {
  CustomerAddress,
  CustomerAddressPayload,
} from "../types/customer-address.types";
import {
  buildFullAddress,
  emptyProvinceCity,
  getAddressBodyFromAddress,
  getAddressDetailsFromAddress,
  getAddressTitleFromAddress,
  getProvinceCityFromAddress,
} from "@/shared/location/location-text";
import { toPersianDigits } from "@/shared/utils/persian-number";

type CustomerAddressesScreenProps = {
  returnTo?: string;
  lockCity?: boolean;
};

type AddressFormMode = "closed" | "create" | "edit";

function getAddressFullLine(address: CustomerAddress) {
  return (
    address.addressLine ||
    buildFullAddress({
      title: address.title,
      province: address.province,
      city: address.city,
      details: address.details,
    })
  );
}

function getAddressDisplayLine(addressText?: string | null) {
  return getAddressBodyFromAddress(addressText) || String(addressText ?? "");
}

function getAddressLocation(address: CustomerAddress) {
  const fullAddress = getAddressFullLine(address);
  const provinceCity = getProvinceCityFromAddress(fullAddress);

  if (!provinceCity.province || !provinceCity.city) {
    return getAddressDisplayLine(fullAddress);
  }

  return `${provinceCity.province}، ${provinceCity.city}`;
}

function getAddressInitialValues(address?: CustomerAddress | null) {
  if (!address) {
    return {
      title: "خانه",
      province: "",
      city: "",
      details: "",
    };
  }

  const fullAddress = getAddressFullLine(address);
  const provinceCity = getProvinceCityFromAddress(fullAddress);
  const titleFromLine = getAddressTitleFromAddress(fullAddress);
  const detailsFromLine = getAddressDetailsFromAddress(fullAddress);

  return {
    title: address.title || titleFromLine || "خانه",
    province: address.province || provinceCity.province,
    city: address.city || provinceCity.city,
    details: address.details || detailsFromLine,
  };
}

function isSafeReturnTo(value: string) {
  return value.startsWith("/") && !value.startsWith("//");
}

export default function CustomerAddressesScreen({
  returnTo,
  lockCity,
}: CustomerAddressesScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryReturnTo = searchParams.get("returnTo") ?? "";
  const queryLockCity = searchParams.get("lockCity") === "true";

  const effectiveReturnTo = returnTo || queryReturnTo;
  const effectiveLockCity = Boolean(lockCity ?? queryLockCity);

  const currentUser = useAuthStore((state) => state.currentUser);
  const updateCurrentUser = useAuthStore((state) => state.updateCurrentUser);

  const setSelectedLocation = useLocationStore(
    (state) => state.setSelectedLocation
  );

  const [formMode, setFormMode] = useState<AddressFormMode>(
    effectiveLockCity ? "edit" : "closed"
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data: addresses = [],
    isLoading,
    isError,
  } = useCustomerAddresses({
    enabled: currentUser?.role === "customer",
  });

  const saveAddress = useCreateCustomerAddress();
  const deleteAddress = useDeleteCustomerAddress();

  const selectedAddress = useMemo(() => {
    return addresses.find((address) => address.isDefault) ?? addresses[0];
  }, [addresses]);

  const selectedAddressInitialValues = useMemo(() => {
    return getAddressInitialValues(selectedAddress);
  }, [selectedAddress]);

  const fallbackAddressText = currentUser?.address ?? currentUser?.location ?? "";

  const fallbackAddressTitle = getAddressTitleFromAddress(fallbackAddressText);
  const fallbackAddressBody = getAddressBodyFromAddress(fallbackAddressText);
  const fallbackProvinceCity = getProvinceCityFromAddress(fallbackAddressText);
  const fallbackDetails = getAddressDetailsFromAddress(fallbackAddressText);

  const hasCurrentAddress = Boolean(selectedAddress || fallbackAddressText);

  const editInitialValues = selectedAddress
    ? selectedAddressInitialValues
    : {
        title: fallbackAddressTitle || "خانه",
        province: fallbackProvinceCity.province,
        city: fallbackProvinceCity.city,
        details: fallbackDetails,
      };

  const createInitialValues = {
    title: "خانه",
    province: "",
    city: "",
    details: "",
  };

  const formInitialValues =
    formMode === "edit" ? editInitialValues : createInitialValues;

  const goBackAfterAddressChange = () => {
    if (effectiveReturnTo && isSafeReturnTo(effectiveReturnTo)) {
      router.replace(effectiveReturnTo);
      return;
    }

    router.replace("/customer/addresses");
  };

  useEffect(() => {
    if (effectiveLockCity) {
      const syncTimer = window.setTimeout(() => setFormMode("edit"), 0);
      return () => window.clearTimeout(syncTimer);
    }
  }, [effectiveLockCity]);

  useEffect(() => {
    if (!selectedAddress) return;

    const fullAddress = getAddressFullLine(selectedAddress);
    const provinceCity = getProvinceCityFromAddress(fullAddress);

    if (provinceCity.province && provinceCity.city) {
      setSelectedLocation(provinceCity);
    }

    updateCurrentUser({
      address: fullAddress,
      location: fullAddress,
    });
  }, [selectedAddress, setSelectedLocation, updateCurrentUser]);

  if (!currentUser || currentUser.role !== "customer") {
    return (
      <section className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">دسترسی غیرمجاز</h1>

          <p className="mt-2 text-sm text-gray-500">
            فقط مشتری‌ها می‌توانند آدرس‌های خود را مدیریت کنند.
          </p>
        </div>
      </section>
    );
  }

  const handleSaveAddress = async (payload: CustomerAddressPayload) => {
    try {
      const savedAddress = await saveAddress.mutateAsync(payload);

      const completedAddress: CustomerAddress = {
        ...savedAddress,
        id: savedAddress.id || selectedAddress?.id || "current",
        title: savedAddress.title || payload.title || "خانه",
        province: savedAddress.province || payload.province,
        city: savedAddress.city || payload.city,
        details: savedAddress.details || payload.details,
        addressLine:
          savedAddress.addressLine ||
          buildFullAddress({
            title: payload.title,
            province: payload.province,
            city: payload.city,
            details: payload.details,
          }),
        isDefault: true,
      };

      const fullAddress = getAddressFullLine(completedAddress);
      const provinceCity = getProvinceCityFromAddress(fullAddress);

      if (provinceCity.province && provinceCity.city) {
        setSelectedLocation(provinceCity);
      }

      updateCurrentUser({
        address: fullAddress,
        location: fullAddress,
      });

      setFormMode("closed");

      if (effectiveReturnTo) {
        goBackAfterAddressChange();
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "ذخیره آدرس ناموفق بود.");
    }
  };

  const handleDeleteCurrentAddress = async () => {
    if (!hasCurrentAddress || deleteAddress.isPending) return;

    try {
      await deleteAddress.mutateAsync(selectedAddress?.id ?? "current");

      updateCurrentUser({
        address: null,
        location: null,
      });

      setSelectedLocation(emptyProvinceCity);
      setFormMode("closed");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "حذف آدرس ناموفق بود.");
    }
  };

  const handleMainButtonClick = () => {
    if (hasCurrentAddress) {
      setFormMode((prev) => (prev === "edit" ? "closed" : "edit"));
      return;
    }

    setFormMode((prev) => (prev === "create" ? "closed" : "create"));
  };

  return (
    <section dir="rtl" className="relative h-full overflow-hidden">
      <div className="flex h-full flex-col px-5 py-6 sm:px-7 lg:px-8">
        <div className="shrink-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="text-right">
              <h1 className="text-2xl font-extrabold text-gray-950">
                آدرس‌های من
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {effectiveLockCity
                  ? "در مرحله ثبت سفارش، استان و شهر ثابت است و فقط جزئیات آدرس فعلی را ویرایش می‌کنی."
                  : "آدرس تحویل خود را ثبت یا ویرایش کنید."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleMainButtonClick}
              disabled={saveAddress.isPending || deleteAddress.isPending}
              className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#EFC5A8] px-6 text-sm font-bold text-gray-900 transition hover:bg-[#e9b892] sm:w-auto"
>
              {hasCurrentAddress ? <Edit3 size={18} /> : <Plus size={18} />}

              {hasCurrentAddress ? "ویرایش آدرس فعلی" : "افزودن آدرس"}
            </button>
          </div>

          {selectedAddress && (
            <div className="mt-5 rounded-2xl border border-[#EFC5A8] bg-[#FFF9F4] px-5 py-4 text-right">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-[#D16565]">آدرس فعلی</p>

                <button
                  type="button"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={deleteAddress.isPending}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="حذف آدرس"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h2 className="mt-1 text-sm font-extrabold text-gray-950">
                {toPersianDigits(getAddressTitleFromAddress(getAddressFullLine(selectedAddress)))}
              </h2>


              <p className="mt-1 text-sm leading-7 text-gray-700">
                {toPersianDigits(getAddressDisplayLine(getAddressFullLine(selectedAddress)))}
              </p>
            </div>
          )}

          {!selectedAddress && fallbackAddressText && (
            <div className="mt-5 rounded-2xl border border-[#EFC5A8] bg-[#FFF9F4] px-5 py-4 text-right">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-bold text-[#D16565]">آدرس فعلی</p>

                <button
                  type="button"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={deleteAddress.isPending}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="حذف آدرس"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h2 className="mt-1 text-sm font-extrabold text-gray-950">
                {fallbackAddressTitle || "خانه"}
              </h2>


              {fallbackDetails && (
                <p className="mt-1 text-sm leading-7 text-gray-700">
                  {fallbackAddressBody || fallbackDetails}
                </p>
              )}
            </div>
          )}

          {effectiveLockCity && !formInitialValues.province && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-right">
              <p className="text-sm font-bold text-red-600">
                استان و شهر فعلی پیدا نشد.
              </p>

              <p className="mt-1 text-xs leading-6 text-red-500">
                اول باید یک آدرس کامل از مسیر عادی آدرس‌های من ثبت کنی.
              </p>
            </div>
          )}

          {formMode !== "closed" && (
            <div className="mt-5 ">
              <AddressForm
                onSubmit={handleSaveAddress}
                isSubmitting={saveAddress.isPending}
                onCancel={() => setFormMode("closed")}
                lockCity={effectiveLockCity}
                initialValues={formInitialValues}
              />
            </div>
          )}
        </div>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto pb-2 pl-2">
          {isLoading ? (
            <div className="rounded-3xl bg-[#FFF9F4] p-10 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                در حال دریافت آدرس‌ها...
              </h2>
            </div>
          ) : isError ? (
            <div className="rounded-3xl bg-[#FFF9F4] p-10 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                دریافت آدرس‌ها ناموفق بود
              </h2>

              <p className="mt-2 text-sm text-red-500">
                وضعیت بک‌اند یا endpoint آدرس را بررسی کن.
              </p>
            </div>
          ) : addresses.length === 0 && !fallbackAddressText ? (
            <div className="rounded-3xl border border-orange-100 bg-[#FFF9F4] p-10 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                هنوز آدرسی ثبت نکرده‌اید
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                با دکمه افزودن آدرس، اولین آدرس خود را ثبت کنید.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {isDeleteDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
          onClick={() => {
            if (!deleteAddress.isPending) {
              setIsDeleteDialogOpen(false);
            }
          }}
        >
          <div
            dir="rtl"
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-right shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteAddress.isPending}
              className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="بستن"
            >
              <X size={17} />
            </button>

            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">
                  حذف آدرس
                </h2>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-gray-600">
              مطمئنی می‌خوای آدرس فعلی رو حذف کنی؟
            </p>

            <div dir="rtl" className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={deleteAddress.isPending}
                className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={handleDeleteCurrentAddress}
                disabled={deleteAddress.isPending}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteAddress.isPending ? "در حال حذف..." : "بله، حذف کن"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
