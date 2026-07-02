"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, MapPin } from "lucide-react";
import { iranLocations } from "./data/iran-locations";
import type { ProvinceCityValue } from "@/shared/location/types/location.types";

export type { ProvinceCityValue };


type ProvinceCityDropdownProps = {
  value: ProvinceCityValue;
  onChange: (value: ProvinceCityValue) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export default function ProvinceCityDropdown({
  value,
  onChange,
  placeholder = "انتخاب استان و شهر",
  disabled = false,
  className = "",
}: ProvinceCityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeProvince, setActiveProvince] = useState<string>("");
  const [activeProvinceTop, setActiveProvinceTop] = useState(8);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const provinceListRef = useRef<HTMLDivElement>(null);

  const selectedLocation =
    value.province && value.city
      ? `${value.province}، ${value.city}`
      : placeholder;

  const activeProvinceData =
    iranLocations.find((province) => province.name === activeProvince) ??
    iranLocations[0];

  useEffect(() => {
    if (!isOpen) return;

    const syncTimer = window.setTimeout(() => {
      if (value.province) {
        setActiveProvince(value.province);
        setActiveProvinceTop(8);
        return;
      }

      setActiveProvince(iranLocations[0]?.name ?? "");
      setActiveProvinceTop(8);
    }, 0);

    return () => window.clearTimeout(syncTimer);
  }, [isOpen, value.province]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProvinceActivate = (
    provinceName: string,
    element?: HTMLButtonElement | null
  ) => {
    setActiveProvince(provinceName);

    if (!element || !provinceListRef.current) return;

    setActiveProvinceTop(
      element.offsetTop - provinceListRef.current.scrollTop
    );
  };

  const handleCitySelect = (province: string, city: string) => {
    onChange({
      province,
      city,
    });

    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      dir="rtl"
      className={`relative w-full ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-transparent bg-[#F2CDB5]/55 px-4 text-right text-sm text-gray-800 outline-none transition hover:bg-[#F2CDB5]/70 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="flex min-w-0 items-center gap-2">
          <MapPin size={18} className="shrink-0 text-orange-500" />

          <span className="truncate font-medium text-gray-700">
            {selectedLocation}
          </span>
        </div>

        <ChevronDown
          size={18}
          className={`shrink-0 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute right-0 top-full z-50 mt-2">
          <div className="relative">
            <div className="w-48 rounded-2xl border border-gray-100 bg-white shadow-xl">
              <div
                ref={provinceListRef}
                className="max-h-80 overflow-y-auto py-2"
              >
                {iranLocations.map((province) => {
                  const isActive = activeProvinceData?.name === province.name;

                  return (
                    <button
                      key={province.name}
                      type="button"
                      onMouseEnter={(event) =>
                        handleProvinceActivate(
                          province.name,
                          event.currentTarget
                        )
                      }
                      onClick={(event) =>
                        handleProvinceActivate(
                          province.name,
                          event.currentTarget
                        )
                      }
                      className={`flex w-full items-center justify-between px-4 py-3 text-right transition-colors ${
                        isActive
                          ? "bg-orange-50 text-orange-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {province.name}
                      </span>

                      <ChevronLeft size={14} className="opacity-50" />
                    </button>
                  );
                })}
              </div>
            </div>

            {activeProvinceData && (
              <div
                className="absolute right-full z-[60] mr-1 w-37 rounded-2xl border border-gray-100 bg-white shadow-xl"
                style={{ top: activeProvinceTop }}
              >
                <div className="max-h-80 overflow-y-auto py-2">
                  {activeProvinceData.cities.map((city) => {
                    const isSelected =
                      value.province === activeProvinceData.name &&
                      value.city === city;

                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() =>
                          handleCitySelect(activeProvinceData.name, city)
                        }
                        className={`block w-full px-5 py-3 text-right text-sm transition-colors ${
                          isSelected
                            ? "bg-orange-50 font-bold text-orange-600"
                            : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                        }`}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
