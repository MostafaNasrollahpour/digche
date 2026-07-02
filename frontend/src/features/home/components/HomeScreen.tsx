"use client";

import { useEffect } from "react";
import HomeFooter from "./HomeFooter";
import HomeHeader from "./HomeHeader";
import FoodScroll from "./FoodScroll";
import ProvinceCityDropdown, {
  type ProvinceCityValue,
} from "@/shared/location/ProvinceCityDropdown";
import CategorySection from "@/features/categories/components/CategorySection";
import { useAuthStore } from "@/store/auth-store";
import { useLocationStore } from "@/store/location-store";
import { getProvinceCityFromAddress } from "@/shared/location/location-text";

export default function HomeScreen() {
  const currentUser = useAuthStore((state) => state.currentUser);

  const selectedLocation = useLocationStore((state) => state.selectedLocation);
  const setSelectedLocation = useLocationStore(
    (state) => state.setSelectedLocation
  );

  useEffect(() => {
    const userAddress = currentUser?.address ?? currentUser?.location;

    if (!userAddress) return;

    const locationFromUser = getProvinceCityFromAddress(userAddress);

    if (!locationFromUser.province || !locationFromUser.city) return;

    setSelectedLocation(locationFromUser);
  }, [currentUser?.address, currentUser?.location, setSelectedLocation]);

  const handleLocationChange = (value: ProvinceCityValue) => {
    setSelectedLocation(value);
  };

  return (
    <div className="bg-[#FFF9F4]">
      <HomeHeader />

      <div className="flex flex-col items-center gap-8 py-5">
        <ProvinceCityDropdown
          value={selectedLocation}
          onChange={handleLocationChange}
          placeholder="انتخاب شهر برای نمایش غذاها"
          className="max-w-xs"
        />

        <p className="-mt-5 px-7 text-center text-xs leading-6 text-gray-500">
          این انتخاب فقط برای نمایش غذاهاست. آدرس تحویل از بخش آدرس‌های من تغییر می‌کند.
        </p>
      </div>

      <div className="mx-auto mt-2.5 h-px w-[90%] bg-[#D9D9D9]" />

      <CategorySection />

      <div className="mx-auto mt-2.5 h-px w-[90%] bg-[#D9D9D9]" />

      <FoodScroll />

      <HomeFooter />
    </div>
  );
}