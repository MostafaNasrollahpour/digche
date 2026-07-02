"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useCreateChefFood } from "../../hooks/use-create-chef-food";
import { uploadDishImage } from "@/features/media/api/media-upload.api";
import ChefFoodForm, { type ChefFoodFormValues } from "./ChefFoodForm";

const defaultImage = "/images/food-placeholder.webp";

const emptyFoodFormValues: ChefFoodFormValues = {
  title: "",
  category: "",
  remaining: "",
  price: "",
  ingredients: "",
  description: "",
  image: "",
};

export default function AddFoodForm() {
  const router = useRouter();

  const currentUser = useAuthStore((state) => state.currentUser);
  const createFood = useCreateChefFood();

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser || currentUser.role !== "chef") {
    return (
      <section className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">دسترسی غیرمجاز</h1>

          <p className="mt-2 text-sm text-gray-500">
            فقط آشپزها می‌توانند غذا اضافه کنند.
          </p>
        </div>
      </section>
    );
  }

  const normalizeRemaining = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return "";

    return trimmedValue.includes("باقیمانده")
      ? trimmedValue
      : `${trimmedValue} باقیمانده`;
  };

  const handleCreateFood = async (
    values: ChefFoodFormValues,
    imageFile: File | null
  ) => {
    const chefLocation = currentUser.location?.trim() ?? "";

    // if (!chefLocation) {
    //   alert("لطفاً ابتدا موقعیت فعالیت خود را از بخش تنظیمات آشپز انتخاب کنید.");
    //   return;
    // }

    setIsSubmitting(true);

    try {
      const uploadedImageUrl = imageFile
        ? await uploadDishImage(imageFile, "draft")
        : values.image || defaultImage;

      await createFood.mutateAsync({
        title: values.title.trim(),
        category: values.category,
        remaining: normalizeRemaining(values.remaining),
        price: values.price.trim(),
        unit: "تومان",
        image: uploadedImageUrl,
        ingredients: values.ingredients.trim(),
        description: values.description.trim(),
        location: chefLocation,
        isAvailable: true,
      });

      router.push("/chef/foods");
    } catch (error) {
      alert(error instanceof Error ? error.message : "ثبت غذا ناموفق بود.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ChefFoodForm
      heading="امروز چه غذای خوشمزه‌ای درست میکنی؟"
      submitLabel="ثبت"
      submittingLabel="در حال ثبت..."
      initialValues={emptyFoodFormValues}
      isSubmitting={isSubmitting}
      onSubmit={handleCreateFood}
    />
  );
}