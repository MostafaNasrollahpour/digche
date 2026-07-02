"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import type { FoodComment } from "../types/food-comment.types";
import { useCreateFoodComment } from "../hooks/use-create-food-comment";
import {
  formatPersianDate,
  formatPersianTime,
  getValidDate,
} from "@/shared//orders/history/utils/order-history-date";

interface FoodCommentsProps {
  foodId: number | string;
  comments: FoodComment[];
  canComment: boolean;
}

const DEFAULT_AVATAR = "/images/cake.webp";

function getSafeAvatarSrc(src?: string | null) {
  const value = src?.trim();

  if (!value || value === "undefined" || value === "null") {
    return DEFAULT_AVATAR;
  }

  if (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  return `/images/${value}`;
}

function getSafeCommentUserName(comment: FoodComment) {
  const username = comment.username?.trim();
  const userName = comment.userName?.trim();

  return username || userName || "کاربر دیگچه";
}

function formatCommentDateTime(value?: string) {
  const date = getValidDate(value);

  if (!date) return "";

  const persianDate = formatPersianDate(date);
  const persianTime = formatPersianTime(value);

  if (!persianTime) {
    return persianDate;
  }

  return `${persianDate}، ساعت ${persianTime}`;
}

function RatingStars({ rating = 0 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= rating;

        return (
          <Star
            key={starNumber}
            size={18}
            className="text-yellow-400"
            fill={isFilled ? "currentColor" : "none"}
            strokeWidth={1.8}
          />
        );
      })}
    </div>
  );
}

function RatingInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= value;

        return (
          <button
            key={starNumber}
            type="button"
            disabled={disabled}
            onClick={() => onChange(starNumber)}
            className="text-yellow-400 transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={`امتیاز ${starNumber}`}
          >
            <Star
              size={24}
              fill={isFilled ? "currentColor" : "none"}
              strokeWidth={1.8}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function FoodComments({
  foodId,
  comments,
  canComment,
}: FoodCommentsProps) {
  const createComment = useCreateFoodComment();

  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText) {
      setErrorMessage("لطفاً متن نظر را وارد کنید.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setErrorMessage("امتیاز باید بین ۱ تا ۵ باشد.");
      return;
    }

    setErrorMessage("");

    try {
      await createComment.mutateAsync({
        dishId: foodId,
        text: trimmedText,
        rating,
      });

      setText("");
      setRating(5);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "ثبت نظر ناموفق بود."
      );
    }
  };

  return (
    <section dir="rtl" className="space-y-5">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-gray-900">نظر کاربران</h2>

        <p className="mt-1 text-sm text-gray-500">
          تجربه بقیه افراد از این غذا
        </p>
      </div>

      {canComment && (
        <form
          onSubmit={handleSubmitComment}
          className="rounded-3xl bg-white px-5 py-5 shadow-sm md:px-8 md:py-6"
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900">
                امتیاز شما
              </label>

              <RatingInput
                value={rating}
                onChange={setRating}
                disabled={createComment.isPending}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900">
                نظر شما
              </label>

              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                disabled={createComment.isPending}
                rows={4}
                placeholder="تجربه‌ات از این غذا رو بنویس..."
                className="w-full resize-none rounded-2xl border border-transparent bg-[#F2CDB5]/45 px-4 py-3 text-right text-sm leading-7 text-gray-800 outline-none transition placeholder:text-gray-500 focus:border-[#D48B8B] focus:bg-[#F2CDB5]/60 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {errorMessage && (
              <p className="text-sm font-bold text-red-500">{errorMessage}</p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createComment.isPending}
                className="rounded-full bg-[#D48B8B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c97b7b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createComment.isPending ? "در حال ثبت..." : "ثبت نظر"}
              </button>
            </div>
          </div>
        </form>
      )}

      {!canComment && (
        <div className="rounded-3xl bg-white p-5 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            برای ثبت نظر باید با حساب مشتری وارد شوید.
          </p>
        </div>
      )}

      {comments.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            هنوز نظری برای این غذا ثبت نشده است.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => {
            const avatarSrc = getSafeAvatarSrc(comment.userAvatar);
            const displayUserName = getSafeCommentUserName(comment);
            const commentDateTime = formatCommentDateTime(comment.createdAt);

            return (
              <article
                key={comment.id}
                className="rounded-3xl bg-white px-5 py-5 shadow-sm md:px-8 md:py-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#FDF7F2] md:h-16 md:w-16">
                      <Image
                        src={avatarSrc}
                        alt={displayUserName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="pt-1">
                      <h3 className="text-base font-bold text-gray-900 md:text-lg">
                        {displayUserName}
                      </h3>

                      <div className="mt-2">
                        <RatingStars rating={comment.rating} />
                      </div>
                    </div>
                  </div>

                  {commentDateTime && (
                    <span className="pt-2 text-xs text-gray-500 md:text-sm">
                      {commentDateTime}
                    </span>
                  )}
                </div>

                <div className="my-5 border-t border-gray-300" />

                <p className="text-right text-sm leading-8 text-gray-700 md:text-base md:leading-9">
                  {comment.text}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}