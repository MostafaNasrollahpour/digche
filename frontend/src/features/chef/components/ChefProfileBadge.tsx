// src/features/chef/components/ChefProfileBadge.tsx

"use client";

import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";

const defaultAvatar = "/images/chef-avatar.webp";

export default function ChefProfileBadge() {
  const currentUser = useAuthStore((state) => state.currentUser);

  if (!currentUser || currentUser.role !== "chef") return null;

  const avatarSrc = currentUser.avatar || currentUser.photoUrl || defaultAvatar;
  const isBase64Avatar = avatarSrc.startsWith("data:");

  const displayName =
    currentUser.chefDisplayName ||
    currentUser.name ||
    currentUser.username ||
    "خانم ایکس";

  return (
    <div
      dir="ltr"
      title={displayName}
      className="flex h-[44px] w-[112px] shrink-0 items-center gap-2 overflow-hidden rounded-[4px] border border-gray-200 bg-white px-2 shadow-[0_1px_4px_rgba(0,0,0,0.22)]"
    >
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#F2CDB5]">
        <Image
          src={avatarSrc}
          alt={displayName}
          fill
          className="object-cover"
          unoptimized={isBase64Avatar}
        />
      </div>

      <p
        dir="rtl"
        className="min-w-0 flex-1 truncate text-right text-[10px] font-medium leading-4 text-gray-950"
      >
        {displayName}
      </p>
    </div>
  );
}