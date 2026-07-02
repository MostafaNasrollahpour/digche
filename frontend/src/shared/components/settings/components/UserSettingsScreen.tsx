// src/shared/settings/components/UserSettingsScreen.tsx

"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, Info, Pencil } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import ProfileField from "@/shared/components/ProfileField";
import ProvinceCityDropdown, {
  type ProvinceCityValue,
} from "@/shared/location/ProvinceCityDropdown";
import {
  isValidIranMobileNumber,
  sanitizePhoneNumber,
} from "@/shared/validation/phone-number";
import PhoneVerificationGlassBox, {
  type PhoneVerificationResultStatus,
  type PhoneVerificationStep,
} from "@/shared/ui/PhoneVerificationGlassBox";
import { uploadProfilePhoto } from "@/features/media/api/media-upload.api";
import {
  getAuthErrorMessage,
  requestPublicPhoneChangeOtp,
  updatePublicAddress,
  updatePublicFirstName,
  updatePublicLastName,
  updatePublicPhotoUrl,
  updatePublicUsername,
  verifyPublicPhoneChange,
  type PublicProfileUpdateResponse,
} from "@/features/auth/services/auth-api";

type SettingsRole = "chef" | "customer";

type UserSettingsScreenProps = {
  role: SettingsRole;
  title: string;
  unauthorizedMessage: string;
  defaultAvatar: string;
  successMessage?: string;
  infoMessage?: string;
};

type SettingsFormState = {
  name: string;
  lastName: string;
  username: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  chefDisplayName: string;
};

const defaultSuccessMessage = "تغییرات با موفقیت ذخیره شد.";

const defaultInfoMessage =
  "لطفا اطلاعاتتون رو به صورت کامل وارد کنید تا بهتر دیده بشین و از تمام امکانات دیگچه استفاده کنین.";

function toLocalIranMobileNumber(value?: string | null) {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.startsWith("0098") && digits.length === 14) {
    return `0${digits.slice(4)}`;
  }

  if (digits.startsWith("98") && digits.length === 12) {
    return `0${digits.slice(2)}`;
  }

  if (digits.startsWith("9") && digits.length === 10) {
    return `0${digits}`;
  }

  return digits;
}

function getSettingsFormFromUser(
  user: ReturnType<typeof useAuthStore.getState>["currentUser"],
  defaultAvatar: string
): SettingsFormState {
  return {
    name: user?.firstName ?? user?.name ?? "",
    lastName: user?.lastName ?? "",
    username: user?.username ?? "",
    phone: toLocalIranMobileNumber(user?.phone),
    location: user?.location ?? "",
    bio: user?.bio ?? "",
    avatar: user?.avatar ?? defaultAvatar,
    chefDisplayName: user?.username ?? user?.chefDisplayName ?? user?.name ?? "",  };
}

function getProvinceCityFromLocation(
  location?: string | null
): ProvinceCityValue {
  if (!location) {
    return {
      province: "",
      city: "",
    };
  }

  const parts = location
    .split("،")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    province: parts[0] ?? "",
    city: parts[1] ?? "",
  };
}

function buildLocationText(value: ProvinceCityValue) {
  if (!value.province || !value.city) return "";

  return `${value.province}، ${value.city}`;
}

export default function UserSettingsScreen({
  role,
  title,
  unauthorizedMessage,
  defaultAvatar,
  successMessage = defaultSuccessMessage,
  infoMessage = defaultInfoMessage,
}: UserSettingsScreenProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUser = useAuthStore((state) => state.currentUser);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setSession = useAuthStore((state) => state.setSession);
  const updateCurrentUser = useAuthStore((state) => state.updateCurrentUser);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [form, setForm] = useState<SettingsFormState>(() =>
    getSettingsFormFromUser(currentUser, defaultAvatar)
  );
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneVerificationStep, setPhoneVerificationStep] =
    useState<PhoneVerificationStep>("phone");
  const [pendingPhone, setPendingPhone] = useState("");
  const [phoneVerificationCode, setPhoneVerificationCode] = useState("");
  const [isPhoneVerificationSubmitting, setIsPhoneVerificationSubmitting] =
    useState(false);
  const [phoneVerificationError, setPhoneVerificationError] = useState("");
  const [phoneVerificationResultStatus, setPhoneVerificationResultStatus] =
    useState<PhoneVerificationResultStatus>("idle");
  const [phoneVerificationResultMessage, setPhoneVerificationResultMessage] =
    useState("");

  useEffect(() => {
    const syncTimer = window.setTimeout(() => {
      setForm(getSettingsFormFromUser(currentUser, defaultAvatar));
    }, 0);

    return () => window.clearTimeout(syncTimer);
  }, [currentUser, defaultAvatar]);

  if (!currentUser || currentUser.role !== role) {
    return (
      <section className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">دسترسی غیرمجاز</h1>

          <p className="mt-2 text-sm text-gray-500">{unauthorizedMessage}</p>
        </div>
      </section>
    );
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setIsSaved(false);

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProvinceCityChange = (value: ProvinceCityValue) => {
    setIsSaved(false);

    setForm((prev) => ({
      ...prev,
      location: buildLocationText(value),
    }));
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedAvatarFile(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setIsSaved(false);
      setErrorMessage("");

      setForm((prev) => ({
        ...prev,
        avatar: String(reader.result),
      }));
    };

    reader.readAsDataURL(file);
  };

  const openPhoneVerification = () => {
    setPendingPhone(form.phone);
    setPhoneVerificationCode("");
    setPhoneVerificationStep("phone");
    setPhoneVerificationError("");
    setPhoneVerificationResultStatus("idle");
    setPhoneVerificationResultMessage("");
    setIsPhoneModalOpen(true);
  };

  const closePhoneVerification = () => {
    if (isPhoneVerificationSubmitting) return;

    setIsPhoneModalOpen(false);
    setPhoneVerificationCode("");
    setPhoneVerificationError("");
    setPhoneVerificationResultStatus("idle");
    setPhoneVerificationResultMessage("");
  };

  const backToPhoneStep = () => {
    if (isPhoneVerificationSubmitting) return;

    setPhoneVerificationStep("phone");
    setPhoneVerificationCode("");
    setPhoneVerificationError("");
    setPhoneVerificationResultStatus("idle");
    setPhoneVerificationResultMessage("");
  };

  const handlePendingPhoneChange = (value: string) => {
    setPendingPhone(sanitizePhoneNumber(value));
    setPhoneVerificationError("");
    setPhoneVerificationResultStatus("idle");
    setPhoneVerificationResultMessage("");
  };

  const requestPhoneVerificationCode = async () => {
    if (!accessToken) {
      setPhoneVerificationError("نشست کاربری پیدا نشد. لطفاً دوباره وارد شوید.");
      return;
    }

    const currentPhone = toLocalIranMobileNumber(currentUser.phone);

    if (!isValidIranMobileNumber(pendingPhone)) {
      setPhoneVerificationError("شماره موبایل معتبر نیست.");
      return;
    }

    if (pendingPhone === currentPhone) {
      setPhoneVerificationError("شماره جدید باید با شماره فعلی متفاوت باشد.");
      return;
    }

    try {
      setIsPhoneVerificationSubmitting(true);
      setPhoneVerificationError("");
      setPhoneVerificationResultStatus("idle");
      setPhoneVerificationResultMessage("");

      await requestPublicPhoneChangeOtp({
        accessToken,
        newPhone: pendingPhone,
      });

      setPhoneVerificationCode("");
      setPhoneVerificationStep("verification");
    } catch (error) {
      setPhoneVerificationError(
        getAuthErrorMessage(error, {
          action: "changePhone",
          role,
        })
      );
    } finally {
      setIsPhoneVerificationSubmitting(false);
    }
  };

  const verifyPhoneVerificationCode = async () => {
    if (!accessToken) {
      setPhoneVerificationError("نشست کاربری پیدا نشد. لطفاً دوباره وارد شوید.");
      return;
    }

    const code = phoneVerificationCode.trim();

    if (!/^\d{4,6}$/.test(code)) {
      setPhoneVerificationError("کد تایید باید بین ۴ تا ۶ رقم باشد.");
      return;
    }

    try {
      setIsPhoneVerificationSubmitting(true);
      setPhoneVerificationError("");
      setPhoneVerificationResultStatus("idle");

      const session = await verifyPublicPhoneChange({
        accessToken,
        newPhone: pendingPhone,
        code,
      });
      const nextPhone = toLocalIranMobileNumber(session.user.phone);

      setSession(session);
      setForm((prev) => ({
        ...prev,
        phone: nextPhone,
      }));
      setIsSaved(true);
      setPhoneVerificationResultStatus("success");
      setPhoneVerificationResultMessage("شماره موبایل با موفقیت تایید و ثبت شد.");
    } catch (error) {
      const message = getAuthErrorMessage(error, {
        action: "changePhone",
        role,
      });

      setPhoneVerificationResultStatus("error");
      setPhoneVerificationResultMessage(message);
      setPhoneVerificationError(message);
    } finally {
      setIsPhoneVerificationSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accessToken) {
      setErrorMessage("نشست کاربری پیدا نشد. لطفاً دوباره وارد شوید.");
      return;
    }

    const nextFirstName = form.name.trim();
    const nextLastName = form.lastName.trim();
    const nextUsername = form.username.trim();
    const nextLocation = form.location.trim();

    if (!nextFirstName) {
      setErrorMessage("نام را وارد کنید.");
      return;
    }

    if (!nextLastName) {
      setErrorMessage("نام خانوادگی را وارد کنید.");
      return;
    }

    if (!nextUsername) {
      setErrorMessage("نام کاربری را وارد کنید.");
      return;
    }

    setIsSaved(false);
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      let workingAccessToken = accessToken;
      let latestSession: PublicProfileUpdateResponse | null = null;

      const applyProfileUpdate = async (
        update: (token: string) => Promise<PublicProfileUpdateResponse>
      ) => {
        const session = await update(workingAccessToken);

        latestSession = session;
        workingAccessToken = session.accessToken;

        return session;
      };

      const uploadedAvatarUrl = selectedAvatarFile
        ? await uploadProfilePhoto(selectedAvatarFile)
        : form.avatar;

      if (nextFirstName !== (currentUser.firstName ?? "")) {
        await applyProfileUpdate((token) =>
          updatePublicFirstName({
            accessToken: token,
            firstName: nextFirstName,
          })
        );
      }

      if (nextLastName !== (currentUser.lastName ?? "")) {
        await applyProfileUpdate((token) =>
          updatePublicLastName({
            accessToken: token,
            lastName: nextLastName,
          })
        );
      }

      if (nextUsername !== (currentUser.username ?? "")) {
        await applyProfileUpdate((token) =>
          updatePublicUsername({
            accessToken: token,
            username: nextUsername,
          })
        );
      }

      if (selectedAvatarFile) {
        await applyProfileUpdate((token) =>
          updatePublicPhotoUrl({
            accessToken: token,
            photoUrl: uploadedAvatarUrl || null,
          })
        );
      }

      if (
        role === "chef" &&
        nextLocation !== (currentUser.address ?? currentUser.location ?? "")
      ) {
        await applyProfileUpdate((token) =>
          updatePublicAddress({
            accessToken: token,
            address: nextLocation || null,
          })
        );
      }

      if (latestSession) {
        setSession(latestSession);
      }

      updateCurrentUser({
        firstName: nextFirstName,
        lastName: nextLastName,
        username: nextUsername,
        name: [nextFirstName, nextLastName].filter(Boolean).join(" ").trim(),
        avatar: uploadedAvatarUrl,
        photoUrl: uploadedAvatarUrl || null,

        // این دو تا فعلاً فقط local هستند مگر اینکه برایشان API جدا داشته باشی
        bio: form.bio.trim(),

        ...(role === "chef"
          ? {
              location: nextLocation,
              address: nextLocation,
              chefDisplayName: nextUsername,
            }
          : {}),
      });

      setForm((prev) => ({
        ...prev,
        name: nextFirstName,
        lastName: nextLastName,
        username: nextUsername,
        avatar: uploadedAvatarUrl,
        location: nextLocation,
      }));

      setSelectedAvatarFile(null);
      setIsSaved(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "ذخیره اطلاعات کاربر ناموفق بود."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarSrc = form.avatar || defaultAvatar;
  const isLocalAvatar = avatarSrc.startsWith("data:") || avatarSrc.startsWith("blob:");

  const avatarAlt =
    form.chefDisplayName || form.name || form.username || "تصویر پروفایل";

  const selectedProvinceCity = getProvinceCityFromLocation(form.location);

  return (
    <section dir="rtl" className="relative h-full overflow-hidden">
      <div className="h-full overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-5">
        <div
          dir="ltr"
          className="mb-3 flex flex-col lg:flex-row lg:items-start lg:justify-between"
        >
          <div className="order-2 text-right lg:order-1 lg:flex-1">
            <h1 dir="rtl" className="font-bold text-gray-950 sm:text-2xl">
              {title}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
          <div className="mb-3 flex justify-start">
            <div className="relative mx-auto">
              <div className="relative mt-1 h-26 w-26 overflow-hidden rounded-full bg-[#F2CDB5]">
                <Image
                  src={avatarSrc}
                  alt={avatarAlt}
                  fill
                  className="object-cover"
                  unoptimized={isLocalAvatar}
                />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#E8793E] text-white shadow-md transition hover:bg-[#d96f37]"
                aria-label="تغییر عکس پروفایل"
              >
                <Camera size={15} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid gap-x-20 gap-y-3 px-8 lg:grid-cols-2 lg:px-20">
            <ProfileField
              label="نام"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="ایکس"
            />

            <ProfileField
              label="نام خانوادگی"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="ایکس"
            />

            <div className="block">
              <span className="mt-4 block text-right text-md font-bold text-gray-900">
                شماره تلفن
              </span>

              <button
                type="button"
                onClick={openPhoneVerification}
                className="relative mt-1 h-10 w-full rounded-xl border border-transparent bg-[#F2CDB5]/55 pr-4 pl-12 text-right text-sm text-gray-800 outline-none transition hover:bg-[#F2CDB5]/70 focus:border-[#D48B8B] focus:bg-[#F2CDB5]/70"
                title="برای تغییر شماره موبایل کلیک کنید."
              >
                <span dir="ltr" className="block text-right">
                  {form.phone || "09123456789"}
                </span>
                <Pencil
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-950"
                />
              </button>
            </div>

            <ProfileField
              label="نام کاربری"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="ایکس"
            />

            <div className="lg:col-span-2">
              {role === "customer" ? (
                <div className="block">
                  <span className="mt-4 block text-right text-md font-bold text-gray-900">
                    موقعیت مکانی
                  </span>

                  <div className="mt-1 flex min-h-10 w-full items-center gap-3 rounded-xl bg-[#F2CDB5]/55 px-4 text-right text-sm text-gray-800">
                    <span className="min-w-0 flex-1 truncate text-right">
                      {form.location || "هنوز موقعیتی انتخاب نشده است"}
                    </span>

                    <Link
                      href="/customer/addresses"
                      className="shrink-0 rounded-full bg-[#EFC5A8] px-4 py-1.5 text-xs font-bold text-gray-900 transition hover:bg-[#e9b892]"
                    >
                      مدیریت آدرس
                    </Link>
                  </div>

                  <p className="mt-2 text-right text-xs text-gray-500">
                    موقعیت مشتری از بخش آدرس‌های من یا انتخاب استان و شهر تعیین
                    می‌شود.
                  </p>
                </div>
              ) : (
                <div className="block">
                  <span className="mt-4 block text-right text-md font-bold text-gray-900">
                    موقعیت مکانی
                  </span>

                  <div className="mt-1">
                    <ProvinceCityDropdown
                      value={selectedProvinceCity}
                      onChange={handleProvinceCityChange}
                      placeholder="انتخاب محل فعالیت آشپز"
                    />
                  </div>

                  <p className="mt-2 text-right text-xs text-gray-500">
                    این موقعیت برای نمایش غذاهای شما در صفحه غذاهای محلی استفاده
                    می‌شود.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-8 h-9 w-36 rounded-lg bg-[#EFC5A8] text-sm font-bold text-gray-900 transition hover:bg-[#e9b892] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </div>

          {isSaved && (
            <p className="mt-3 text-center text-sm font-bold text-emerald-600">
              {successMessage}
            </p>
          )}
          {errorMessage && (
            <p className="mt-3 text-center text-sm font-bold text-red-500">
              {errorMessage}
            </p>
          )}

          <div className="mx-auto mt-8 max-w-4xl rounded-lg border-2 border-dashed border-gray-900/80 bg-[#FFF6B8]/70 px-4 py-3">
            <div className="flex items-center justify-center gap-2 text-center">
              <Info size={17} className="shrink-0 text-gray-900" />

              <p className="text-xs font-medium leading-6 text-gray-900 sm:text-sm">
                {infoMessage}
              </p>
            </div>
          </div>
        </form>
      </div>

      <PhoneVerificationGlassBox
        isOpen={isPhoneModalOpen}
        step={phoneVerificationStep}
        title="ویرایش شماره موبایل"
        description={
          phoneVerificationStep === "phone"
            ? "شماره موبایل جدید را وارد کنید تا کد تایید برایتان ارسال شود."
            : "کد تایید ارسال‌شده به شماره جدید را وارد کنید."
        }
        phone={pendingPhone}
        code={phoneVerificationCode}
        isSubmitting={isPhoneVerificationSubmitting}
        errorMessage={phoneVerificationError}
        resultStatus={phoneVerificationResultStatus}
        resultMessage={phoneVerificationResultMessage}
        resultAutoCloseMs={2200}
        phoneLabel="شماره موبایل جدید"
        codeLabel="کد تایید"
        requestCodeText="دریافت کد تایید"
        verifyCodeText="تایید شماره"
        onPhoneChange={handlePendingPhoneChange}
        onCodeChange={setPhoneVerificationCode}
        onRequestCode={requestPhoneVerificationCode}
        onVerifyCode={verifyPhoneVerificationCode}
        onBackToPhone={backToPhoneStep}
        onClose={closePhoneVerification}
      />
    </section>
  );
}
