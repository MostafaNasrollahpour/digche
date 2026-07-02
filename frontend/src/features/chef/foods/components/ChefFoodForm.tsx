"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import FormField from "./FormField";
import { toPersianDigits } from "@/shared/utils/persian-number";

export type ChefFoodFormValues = {
  title: string;
  category: string;
  remaining: string;
  price: string;
  ingredients: string;
  description: string;
  image: string;
};

type ChefFoodFormProps = {
  heading: string;
  submitLabel: string;
  submittingLabel: string;
  initialValues: ChefFoodFormValues;
  isSubmitting: boolean;
  onSubmit: (values: ChefFoodFormValues, imageFile: File | null) => void | Promise<void>;
  onCancel?: () => void;
  cancelLabel?: string;
};

const categories = [
  "خورشت",
  "دسر",
  "چاشنی",
  "غذاهای محلی",
  "غذای اصلی",
  "پیش غذا",
  "کیک و شیرینی",
];

const inputClassName =
  "h-10 w-full rounded-lg border border-transparent bg-[#F2CDB5]/55 px-3 text-right text-xs text-gray-800 outline-none transition placeholder:text-gray-500 focus:border-[#D48B8B] focus:bg-[#F2CDB5]/70";

const textareaClassName =
  "h-24 w-full resize-none rounded-lg border border-transparent bg-[#F2CDB5]/55 px-3 py-3 text-right text-xs leading-6 text-gray-800 outline-none transition placeholder:text-gray-500 focus:border-[#D48B8B] focus:bg-[#F2CDB5]/70";

export default function ChefFoodForm({
  heading,
  submitLabel,
  submittingLabel,
  initialValues,
  isSubmitting,
  onSubmit,
  onCancel,
  cancelLabel = "انصراف",
}: ChefFoodFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<ChefFoodFormValues>(initialValues);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  useEffect(() => {
    const syncTimer = window.setTimeout(() => {
      setForm({
        title: initialValues.title,
        category: initialValues.category,
        remaining: initialValues.remaining,
        price: initialValues.price,
        ingredients: initialValues.ingredients,
        description: initialValues.description,
        image: initialValues.image,
      });
      setSelectedImageFile(null);
    }, 0);

    return () => window.clearTimeout(syncTimer);
  }, [
    initialValues.title,
    initialValues.category,
    initialValues.remaining,
    initialValues.price,
    initialValues.ingredients,
    initialValues.description,
    initialValues.image,
  ]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedImageFile(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        image: String(reader.result),
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title || !form.category || !form.remaining || !form.price) {
      alert("لطفاً نام غذا، دسته‌بندی، مقدار و قیمت را وارد کنید.");
      return;
    }

    await onSubmit(form, selectedImageFile);
  };

  return (
    <section dir="rtl" className="relative h-full overflow-hidden ">
      <div className="flex h-full flex-col px-8 py-5 lg:px-12">
        <div className="mb-5 shrink-0 text-right">
          <h1 className="py-5 text-xl font-extrabold text-gray-950">
            {heading}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex h-full w-full max-w-[770px] flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto pb-2 pl-2">
            <div className="grid gap-x-18 gap-y-4 lg:grid-cols-2">
              <div className="space-y-4">
                <FormField label="نام غذا">
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="مثلا: قورمه سبزی"
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="دسته بندی">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputClassName}
                  >
                    <option value="">انتخاب کنید</option>

                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="مواد اولیه">
                  <input
                    name="ingredients"
                    value={form.ingredients}
                    onChange={handleChange}
                    placeholder="مثلا: گوشت، رب انار، گردو..."
                    className={inputClassName}
                  />
                </FormField>
              </div>

              <div className="h-full">
                <FormField label="عکس غذا">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group mx-auto flex h-[210px] w-[240px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dotted border-gray-800 bg-[#F2CDB5]/25 text-center transition hover:bg-[#F2CDB5]/40"
                  >
                    {form.image ? (
                      <div className="relative overflow-hidden rounded-lg">
                        <img
                          src={form.image}
                          alt="پیش نمایش غذا"
                          className=" object-cover"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-900">
                          برای آپلود عکس اینجا کلیک کنید
                        </p>

                        <Upload
                          size={26}
                          strokeWidth={1.8}
                          className="text-gray-900 transition group-hover:-translate-y-1"
                        />
                      </>
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </FormField>
              </div>

              <FormField label="مقدار">
                <input
                  name="remaining"
                  value={toPersianDigits(form.remaining)}
                  onChange={handleChange}
                  placeholder="مثلا: ۲"
                  inputMode="numeric"
                  className={inputClassName}
                />
              </FormField>

              <FormField label="قیمت (تومان)">
                <input
                  name="price"
                  value={toPersianDigits(form.price)}
                  onChange={handleChange}
                  placeholder="مثلا: ۳۵۰,۰۰۰"
                  inputMode="numeric"
                  className={inputClassName}
                />
              </FormField>

              <div className="lg:col-span-2">
                <FormField label="توضیحات اضافه">
                  <textarea
                    name="description"
                    value={toPersianDigits(form.description)}
                    onChange={handleChange}
                    rows={3}
                    placeholder="درباره غذا اگر نکته‌ای هست که مشتری باید بداند بنویسید"
                    className={textareaClassName}
                  />
                </FormField>
              </div>
            </div>
          </div>

          <div className="mt-7 flex shrink-0 justify-center gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="h-9 w-32 rounded-lg bg-[#FFF9F4] text-sm font-bold text-gray-700 transition hover:bg-orange-100"
              >
                {cancelLabel}
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 w-60 rounded-lg bg-[#EFC5A8] text-sm font-bold text-gray-900 transition hover:bg-[#e9b892] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
