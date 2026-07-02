"use client";

import Image from "next/image";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Headphones,
  Mail,
  Menu,
  Phone,
  Send,
} from "lucide-react";
import {
  createSupportTicket,
  getMySupportTickets,
  type SupportTicket,
} from "../api/support-tickets.api";
import { useAuthStore, type UserRole } from "@/store/auth-store";

type SupportTicketScreenProps = {
  role: UserRole;
};

const faqItems = [
  {
    question: "چطور می‌توانم وضعیت سفارش را پیگیری کنم؟",
    answer:
      "از بخش تاریخچه سفارشات می‌توانی آخرین وضعیت سفارش، زمان ثبت و جزئیات آن را ببینی. اگر وضعیت سفارش برای مدت طولانی تغییر نکرد، شماره سفارش را داخل تیکت بنویس تا دقیق‌تر بررسی شود.",
  },
  {
    question: "چطور اطلاعات حساب کاربری را تغییر بدهم؟",
    answer:
      "از منوی تنظیمات حساب کاربری می‌توانی اطلاعات پروفایل، نام، تصویر و بعضی جزئیات حساب را ویرایش کنی. برای تغییر شماره موبایل باید مراحل تایید شماره جدید را کامل انجام بدهی.",
  },
  {
    question: "اگر پرداخت ناموفق بود چه کار کنم؟",
    answer:
      "اول وضعیت حساب بانکی‌ات را بررسی کن؛ معمولاً مبلغ پرداخت ناموفق به صورت خودکار برمی‌گردد. اگر مبلغ کم شده ولی سفارش ثبت نشده، زمان پرداخت و جزئیات سفارش را برای پشتیبانی بفرست.",
  },
  {
    question: "چطور با پشتیبانی درباره سفارش صحبت کنم؟",
    answer:
      "در فرم بالای همین صفحه، موضوع را کوتاه و واضح بنویس و در شرح مشکل، جزئیات سفارش، زمان اتفاق و هر اطلاعات مهم دیگری را وارد کن تا تیم پشتیبانی سریع‌تر راهنمایی‌ات کند.",
  },
  {
    question: "چه زمانی پاسخ تیکت را دریافت می‌کنم؟",
    answer:
      "تیکت‌ها معمولاً در ساعات پاسخگویی بررسی می‌شوند. اگر تیکتت پاسخ گرفته باشد، در بخش تیکت‌های من زیر همان تیکت، پاسخ پشتیبانی نمایش داده می‌شود.",
  },
];

export default function SupportTicketScreen({ role }: SupportTicketScreenProps) {
  const currentUser = useAuthStore((state) => state.currentUser);

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [ticketsErrorMessage, setTicketsErrorMessage] = useState("");

  const profile = useMemo(() => {
    const fallbackName = role === "chef" ? "آشپز دیگچه" : "کاربر دیگچه";

    return {
      name: currentUser?.name || fallbackName,
      avatar:
        currentUser?.photoUrl ||
        currentUser?.avatar ||
        (role === "chef" ? "/images/chef.webp" : "/images/customer-avatar.webp"),
      label: role === "chef" ? "آشپز" : "مشتری",
    };
  }, [currentUser, role]);

  const loadMyTickets = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (!options.silent) {
        setIsLoadingTickets(true);
      }

      setTicketsErrorMessage("");

      try {
        const response = await getMySupportTickets();
        setTickets(response.tickets ?? []);
      } catch (error) {
        setTicketsErrorMessage(
          error instanceof Error
            ? error.message
            : "دریافت تیکت‌های شما ناموفق بود."
        );
      } finally {
        if (!options.silent) {
          setIsLoadingTickets(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => {
      void loadMyTickets();
    }, 0);

    const intervalId = window.setInterval(() => {
      void loadMyTickets({ silent: true });
    }, 3000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void loadMyTickets({ silent: true });
      }
    };

    window.addEventListener("focus", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(initialLoadTimer);
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadMyTickets]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedSubject = subject.trim();
    const normalizedDescription = description.trim();

    setSuccessMessage("");
    setErrorMessage("");

    if (!normalizedSubject) {
      setErrorMessage("لطفاً موضوع تیکت را وارد کنید.");
      return;
    }

    if (!normalizedDescription) {
      setErrorMessage("لطفاً شرح مشکل را وارد کنید.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createSupportTicket({
        subject: normalizedSubject,
        description: normalizedDescription,
      });

      setSubject("");
      setDescription("");
      setSuccessMessage("تیکت شما با موفقیت ثبت شد. تیم پشتیبانی به‌زودی بررسی می‌کند.");

      setTickets((currentTickets) => [response.ticket, ...currentTickets]);
      setOpenTicketId(response.ticket.id ?? null);
      void loadMyTickets({ silent: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "ثبت تیکت ناموفق بود. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="h-full overflow-y-auto bg-white px-4 py-5 text-right sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-3 lg:order-1">
            <Headphones className="h-9 w-9 shrink-0 text-[#F97316]" />
            <h1 className="text-2xl font-extrabold text-gray-950 sm:text-3xl">
              ما اینجاییم تا بهت کمک کنیم.
            </h1>
          </div>

          <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm lg:order-2 lg:self-start">
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-[#FFF1E8]">
              <Image
                src={profile.avatar}
                alt={profile.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">{profile.label}</p>
              <h2 className="text-base font-bold text-gray-900">{profile.name}</h2>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[1.4rem] bg-[#FFF1E8] px-4 py-5 sm:px-7 sm:py-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-sm font-medium text-gray-900">موضوع</span>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                maxLength={150}
                placeholder="مثلاً مشکل در سفارش"
                className="h-12 w-full rounded-xl border border-transparent bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#F97316] focus:ring-4 focus:ring-orange-100"
              />
            </label>

            <div className="hidden md:block" />
          </div>

          <label className="mt-6 block space-y-2">
            <span className="block text-sm font-medium text-gray-900">شرح مشکل</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={2000}
              rows={6}
              placeholder="مشکل یا درخواستت را کامل توضیح بده..."
              className="min-h-36 w-full resize-none rounded-xl border border-transparent bg-white px-4 py-3 text-sm leading-7 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#F97316] focus:ring-4 focus:ring-orange-100"
            />
          </label>

          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-[#F97316] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={18} />
              <span>{isSubmitting ? "در حال ارسال..." : "ارسال تیکت"}</span>
            </button>
          </div>
        </form>

        <MyTicketsSection
          tickets={tickets}
          openTicketId={openTicketId}
          isLoading={isLoadingTickets}
          errorMessage={ticketsErrorMessage}
          onToggleTicket={(ticketId) =>
            setOpenTicketId((currentId) => (currentId === ticketId ? null : ticketId))
          }

        />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.4rem] bg-[#FFF1E8] p-5 sm:p-6">
            <h2 className="border-b border-gray-300 pb-3 text-center text-xl font-extrabold text-gray-950">
              سوالات متداول
            </h2>

            <div className="mt-3 divide-y divide-gray-300">
              {faqItems.map((item, index) => {
                const isOpen = openFaqIndex === index;

                return (
                  <div key={item.question}>
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-3 py-3 text-right text-sm font-medium text-gray-900"
                      aria-expanded={isOpen}
                    >
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-gray-500 transition ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                      <span>{item.question}</span>
                    </button>

                    {isOpen && (
                      <p className="pb-4 pr-8 text-sm leading-7 text-gray-500">
                        {item.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.4rem] bg-[#FFF1E8] p-5 sm:p-6">
            <h2 className="border-b border-gray-300 pb-3 text-center text-xl font-extrabold text-gray-950">
              راه‌های ارتباطی
            </h2>

            <div className="mt-4 space-y-4">
              <ContactItem icon={<Phone size={21} />} title="شماره تماس" value="01132323233" />
              <ContactItem icon={<Mail size={21} />} title="ایمیل" value="support@gmail.com" />
              <ContactItem icon={<Clock size={21} />} title="ساعت پاسخگویی" value="همه روزه از ۹ صبح تا ۹ شب" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type MyTicketsSectionProps = {
  tickets: SupportTicket[];
  openTicketId: string | null;
  isLoading: boolean;
  errorMessage: string;
  onToggleTicket: (ticketId: string) => void;

};

function MyTicketsSection({
  tickets,
  openTicketId,
  isLoading,
  errorMessage,
  onToggleTicket,
}: MyTicketsSectionProps) {
  return (
    <div className="rounded-[1.4rem] bg-[#FFF1E8] p-5 sm:p-6">
      <div className="flex items-center justify-start border-b border-gray-300 pb-3">
        <h2 className="text-xl font-extrabold text-gray-950">تیکت‌های من</h2>
      </div>

      {isLoading && (
        <p className="py-6 text-center text-sm text-gray-500">در حال دریافت تیکت‌ها...</p>
      )}

      {!isLoading && errorMessage && (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>{errorMessage}</span>

        </div>
      )}

      {!isLoading && !errorMessage && tickets.length === 0 && (
        <p className="py-6 text-center text-sm text-gray-500">
          هنوز تیکتی ثبت نکردی.
        </p>
      )}

      {!isLoading && !errorMessage && tickets.length > 0 && (
        <div className="mt-4 space-y-3">
          {tickets.map((ticket, index) => {
            const ticketId = ticket.id ?? `ticket-${index}`;
            const isOpen = openTicketId === ticketId;
            const hasReply = Boolean(ticket.adminReplyText);

            return (
              <article key={ticketId} className="overflow-hidden rounded-2xl bg-white">
                <button
                  type="button"
                  onClick={() => onToggleTicket(ticketId)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-right transition hover:bg-orange-50"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF1E8] text-gray-700">
                      <Menu size={20} />
                    </div>

                    <p className="text-xs text-gray-500">
                      {formatTicketDate(ticket.createdAt)}
                    </p>
                  </div>

                  <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <TicketStatusBadge ticket={ticket} />
                        <h3 className="truncate text-sm font-extrabold text-gray-950">
                          {ticket.subject}
                        </h3>
                      </div>
                    </div>

                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-gray-500 transition ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="space-y-4 border-t border-gray-100 px-4 py-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">متن تیکت</h4>
                      <p className="mt-2 whitespace-pre-line rounded-xl bg-[#FFF9F4] px-4 py-3 text-sm leading-7 text-gray-700">
                        {ticket.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-gray-900">پاسخ پشتیبانی</h4>

                      {hasReply ? (
                        <div className="mt-2 rounded-xl bg-green-50 px-4 py-3">
                          <p className="whitespace-pre-line text-sm leading-7 text-green-800">
                            {ticket.adminReplyText}
                          </p>

                          {ticket.repliedAt && (
                            <p className="mt-2 text-xs text-green-600">
                              پاسخ داده شده در {formatTicketDate(ticket.repliedAt)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="mt-2 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
                          هنوز پاسخی برای این تیکت ثبت نشده است.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TicketStatusBadge({ ticket }: { ticket: SupportTicket }) {
  const hasReply = Boolean(ticket.adminReplyText);

  if (hasReply) {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
        پاسخ داده شده
      </span>
    );
  }

  if (ticket.status === "reviewed") {
    return (
      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
        بررسی شده
      </span>
    );
  }

  return (
    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
      در انتظار بررسی
    </span>
  );
}

type ContactItemProps = {
  icon: ReactNode;
  title: string;
  value: string;
};

function ContactItem({ icon, title, value }: ContactItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-300 pb-4 last:border-b-0 last:pb-0">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-400 text-gray-500">
        {icon}
      </div>

      <div>
        <h3 className="text-base font-bold text-gray-950">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{value}</p>
      </div>
    </div>
  );
}

function formatTicketDate(value?: string | null) {
  if (!value) {
    return "تاریخ نامشخص";
  }

  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return "تاریخ نامشخص";
  }
}
