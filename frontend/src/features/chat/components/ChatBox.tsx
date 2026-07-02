
"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCheck,
  ChevronDown,
  Clock3,
  MessageSquareText,
  RotateCcw,
  SendHorizonal,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useChat } from "../hooks/useChat";
import type {
  ChatConversation,
  ChatMessage,
  ChatParticipant,
  ChatSearchUser,
  ChatUiMessage,
  StartChatConversationInput,
} from "../types/chat.types";

type ChatBoxProps = {
  mode: "customer" | "chef";
  initialConversationId?: string | null;
  startConversation?: StartChatConversationInput | null;
  initialParticipantSearchText?: string | null;
};

function formatTime(value?: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getCurrentActorId(
  currentUser: ReturnType<typeof useAuthStore.getState>["currentUser"],
) {
  if (!currentUser) return "";
  return currentUser.publicId || String(currentUser.id);
}

function getOtherParticipant(
  conversation: ChatConversation,
  currentActorId: string,
): ChatParticipant | null {
  return (
    conversation.participants.find(
      (participant) =>
        participant.participantId !== currentActorId ||
        participant.participantType !== "user",
    ) ||
    conversation.participants[0] ||
    null
  );
}

function getConversationTitle(
  conversation: ChatConversation,
  currentActorId: string,
) {
  const participant = getOtherParticipant(conversation, currentActorId);

  return (
    conversation.title ||
    participant?.displayName ||
    participant?.phone ||
    "گفتگوی بدون نام"
  );
}

function getConversationAvatar(
  conversation: ChatConversation,
  currentActorId: string,
) {
  const participant = getOtherParticipant(conversation, currentActorId);
  return participant?.photoUrl || "/images/chef.webp";
}

function getPreview(message?: ChatMessage | null) {
  if (!message?.body) return "هنوز پیامی ثبت نشده است.";
  return message.body.length > 34
    ? `${message.body.slice(0, 34)}...`
    : message.body;
}

function getSearchUserDisplayName(user: ChatSearchUser) {
  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return (
    user.displayName || fullName || user.username || user.phone || "کاربر دیگچه"
  );
}

function MessageStatus({ message }: { message: ChatUiMessage }) {
  if (message.deliveryStatus === "sending") {
    return (
      <Clock3 size={12} className="text-gray-400" aria-label="در حال ارسال" />
    );
  }

  if (message.deliveryStatus === "failed") {
    return (
      <RotateCcw size={12} className="text-red-500" aria-label="ارسال نشد" />
    );
  }

  if (message.deliveryStatus === "seen") {
    return (
      <CheckCheck size={14} className="text-green-600" aria-label="دیده شد" />
    );
  }

  if (message.deliveryStatus === "sent") {
    return <Check size={14} className="text-gray-500" aria-label="ارسال شد" />;
  }

  return null;
}

export function ChatBox({
  mode,
  initialConversationId = null,
  startConversation = null,
  initialParticipantSearchText = null,
}: ChatBoxProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [messageText, setMessageText] = useState("");
  const [isAwayFromBottom, setIsAwayFromBottom] = useState(false);
  const [isNearTop, setIsNearTop] = useState(false);
  const [participantSearchText, setParticipantSearchText] = useState("");
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const searchDebounceTimer = useRef<number | null>(null);

  const currentActorId = getCurrentActorId(currentUser);
  const currentActor = useMemo(
    () =>
      currentActorId ? { id: currentActorId, type: "user" as const } : null,
    [currentActorId],
  );

  const {
    conversations,
    selectedConversation,
    selectedConversationId,
    selectedMessages,
    isLoading,
    isMessagesLoading,
    isOlderMessagesLoading,
    isSending,
    errorMessage,
    socketStatus,
    typingText,
    startDirectConversation,
    selectConversation,
    loadOlderMessages,
    sendTyping,
    sendMessage,
    isMine,
    searchedUsers,
    isSearchingUsers,
    userSearchError,
    searchUsersByUsername,
    clearUserSearch,
  } = useChat({
    accessToken,
    currentActor,
    initialConversationId,
    startConversation,
  });

  useEffect(() => {
    const normalizedUsername = String(
      initialParticipantSearchText ?? "",
    ).trim();

    if (!normalizedUsername) {
      return;
    }

    setParticipantSearchText(normalizedUsername);
    void searchUsersByUsername(normalizedUsername);
  }, [initialParticipantSearchText, searchUsersByUsername]);

  const selectedTitle = selectedConversation
    ? getConversationTitle(selectedConversation, currentActorId)
    : "پیام‌ها";

  const selectedAvatar = selectedConversation
    ? getConversationAvatar(selectedConversation, currentActorId)
    : "/images/chef.webp";

  const selectedParticipant = selectedConversation
    ? getOtherParticipant(selectedConversation, currentActorId)
    : null;

  const selectedPresenceLabel = selectedConversation
    ? selectedParticipant?.isOnline
      ? "آنلاین"
      : "آفلاین"
    : "";

  const selectedPresenceClass = typingText
    ? "text-[#E8793E]"
    : selectedParticipant?.isOnline
      ? "text-green-600"
      : "text-gray-500";

  const selectedStatusLabel = typingText
    ? "در حال نوشتن..."
    : selectedPresenceLabel;

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    messagesEndRef.current?.scrollIntoView({
      behavior,
      block: "end",
    });
    setIsAwayFromBottom(false);
  }

  function handleMessagesScroll(event: React.UIEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;

    setIsAwayFromBottom(distanceFromBottom > 140);
    setIsNearTop(element.scrollTop < 80);
  }

  useEffect(() => {
    window.setTimeout(() => scrollToBottom("auto"), 0);
  }, [selectedConversationId]);

  useEffect(() => {
    if (!isAwayFromBottom) {
      window.setTimeout(() => scrollToBottom("smooth"), 0);
    }
  }, [selectedMessages.length, isAwayFromBottom]);

  useEffect(() => {
    if (isNearTop && selectedConversationId && !isOlderMessagesLoading) {
      void loadOlderMessages();
    }
  }, [
    isNearTop,
    isOlderMessagesLoading,
    loadOlderMessages,
    selectedConversationId,
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const sentMessage = await sendMessage(messageText);

    if (sentMessage) {
      setMessageText("");
      window.setTimeout(() => scrollToBottom("smooth"), 0);
    }
  }

  function handleSearchUserChange(value: string) {
    setParticipantSearchText(value);

    if (searchDebounceTimer.current) {
      window.clearTimeout(searchDebounceTimer.current);
    }

    const normalizedValue = value.trim();

    if (normalizedValue.length < 2) {
      clearUserSearch();
      return;
    }

    searchDebounceTimer.current = window.setTimeout(() => {
      void searchUsersByUsername(normalizedValue);
    }, 350);
  }

  async function handleStartConversationWithUser(user: ChatSearchUser) {
    setIsStartingConversation(true);

    try {
      const conversation = await startDirectConversation({
        participantId: user.id,
        participantType: "user",
        participantDisplayName: getSearchUserDisplayName(user),
        type: "direct",
      });

      if (conversation) {
        setParticipantSearchText("");
        clearUserSearch();
        window.setTimeout(() => scrollToBottom("auto"), 0);
      }
    } finally {
      setIsStartingConversation(false);
    }
  }

  if (!accessToken || !currentUser) {
    return (
      <section
        dir="rtl"
        className="flex min-h-[520px] w-full max-w-5xl items-center justify-center rounded-xl border border-orange-100 bg-white p-8 text-center shadow-sm"
      >
        <div>
          <MessageSquareText
            className="mx-auto mb-4 text-[#E8793E]"
            size={42}
          />
          <h2 className="text-lg font-bold text-gray-900">
            برای دیدن پیام‌ها وارد شوید.
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section
      dir="ltr"
      className="grid h-[calc(100vh-8rem)] min-h-[620px] w-full max-w-5xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md md:grid-cols-[285px_minmax(0,1fr)]"
    >
      <aside
        dir="rtl"
        className="flex min-h-0 flex-col border-r border-gray-200 bg-white"
      >
        <div className="flex h-[76px] items-center justify-between border-b border-gray-200 px-5">
          <h2 className="text-2xl font-bold text-gray-950">گفتگو ها</h2>
        </div>

        <div className="border-b border-gray-200 bg-white px-4 py-3">
          <label className="mb-2 block text-xs font-bold text-gray-600">
            جستجوی کاربر با نام کاربری
          </label>

          <input
            dir="ltr"
            value={participantSearchText}
            onChange={(event) => handleSearchUserChange(event.target.value)}
            placeholder="username"
            className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-left text-xs text-gray-700 outline-none transition focus:border-[#FF6B1A] placeholder:text-gray-400"
          />

          {isSearchingUsers ? (
            <p className="mt-2 text-xs text-gray-500">در حال جستجو...</p>
          ) : null}

          {userSearchError ? (
            <p className="mt-2 rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-600">
              {userSearchError}
            </p>
          ) : null}

          {participantSearchText.trim().length >= 2 &&
          !isSearchingUsers &&
          searchedUsers.length === 0 &&
          !userSearchError ? (
            <p className="mt-2 text-xs text-gray-500">کاربری پیدا نشد.</p>
          ) : null}

          {searchedUsers.length > 0 ? (
            <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white">
              {searchedUsers.map((user) => {
                const title = getSearchUserDisplayName(user);

                return (
                  <button
                    key={user.id}
                    type="button"
                    disabled={isStartingConversation}
                    onClick={() => void handleStartConversationWithUser(user)}
                    className="flex w-full items-center gap-3 border-b border-gray-100 px-3 py-2 text-right transition last:border-b-0 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <img
                      src={user.photoUrl || "/images/chef.webp"}
                      alt={title}
                      className="h-9 w-9 rounded-full border border-gray-200 object-cover"
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-gray-950">
                        {title}
                      </span>
                      <span
                        dir="ltr"
                        className="mt-0.5 block truncate text-left text-[11px] text-gray-500"
                      >
                        @{user.username || user.id}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading && conversations.length === 0 ? (
            <div className="p-5 text-center text-sm text-gray-500">
              در حال دریافت گفتگوها...
            </div>
          ) : null}

          {!isLoading && conversations.length === 0 ? (
            <div className="p-6 text-center text-sm leading-7 text-gray-500">
              هنوز گفتگویی برای نمایش وجود ندارد.
            </div>
          ) : null}

          {conversations.map((conversation) => {
            const isSelected = conversation.id === selectedConversationId;
            const title = getConversationTitle(conversation, currentActorId);
            const avatar = getConversationAvatar(conversation, currentActorId);

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => void selectConversation(conversation.id)}
                className={[
                  "grid w-full grid-cols-[54px_minmax(0,1fr)_46px] items-center gap-3 border-b border-gray-200 px-4 py-3 text-right transition",
                  isSelected ? "bg-[#FADAB8]" : "bg-white hover:bg-orange-50",
                ].join(" ")}
              >
                <img
                  src={avatar}
                  alt={title}
                  className="h-12 w-12 rounded-full border border-gray-800 object-cover"
                />

                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-gray-950">
                    {title}
                  </span>
                  <span className="mt-1 block truncate text-xs text-gray-500">
                    {getPreview(conversation.lastMessage)}
                  </span>
                </span>

                <span className="flex flex-col items-end gap-2 text-xs text-gray-500">
                  <span>{formatTime(conversation.lastMessageAt)}</span>

                  {conversation.unreadCount ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF6B1A] px-1.5 text-[11px] font-bold text-white">
                      {conversation.unreadCount}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <main
        dir="rtl"
        className="relative flex min-h-0 flex-col bg-[#FFF9F4]"
        style={{
          backgroundImage: "url('/images/chat-background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <header
          dir="ltr"
          className="flex h-[76px] shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white/95 px-5"
        >
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {socketStatus === "open" ? (
              <>
                <Wifi size={16} className="text-green-600" />
                زنده
              </>
            ) : (
              <>
                <WifiOff size={16} className="text-orange-500" />
                در حال اتصال
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div dir="rtl" className="text-right">
              <h1 className="text-xl font-bold text-gray-950">
                {selectedTitle}
              </h1>
              <p className={`mt-1 text-xs font-bold ${selectedPresenceClass}`}>
                {selectedStatusLabel}
              </p>
            </div>

            <img
              src={selectedAvatar}
              alt={selectedTitle}
              className="h-14 w-14 rounded-full border border-gray-200 object-cover"
            />
          </div>
        </header>

        <div
          dir="ltr"
          onScroll={handleMessagesScroll}
          className="min-h-0 flex-1 overflow-y-auto px-5 py-6"
        >
          {isMessagesLoading ? (
            <div className="rounded-xl bg-white/80 p-4 text-center text-sm text-gray-500">
              در حال دریافت پیام‌ها...
            </div>
          ) : null}

          {!selectedConversation ? (
            <div className="flex h-full items-center justify-center text-center">
              <div className="rounded-2xl bg-white/85 px-6 py-5 shadow-sm">
                <MessageSquareText
                  className="mx-auto mb-3 text-[#E8793E]"
                  size={34}
                />
                <p className="text-sm font-bold text-gray-700">
                  یک گفتگو را انتخاب کنید.
                </p>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-5">
            {selectedMessages.map((message) => {
              const mine = isMine(message);

              return (
                <div
                  key={
                    message.id || message.clientMessageId || message.createdAt
                  }
                  className={mine ? "flex justify-end" : "flex justify-start"}
                >
                  <div className="flex max-w-[74%] items-end gap-2">
                    {!mine && selectedConversation ? (
                      <img
                        src={selectedAvatar}
                        alt={selectedTitle}
                        className="h-10 w-10 shrink-0 rounded-full border border-gray-200 object-cover"
                      />
                    ) : null}

                    <div dir="rtl" className="min-w-0">
                      <div
                        className={[
                          "rounded-lg border border-gray-900 px-5 py-3 text-sm leading-7 text-gray-950 shadow-sm",
                          mine ? "bg-[#F1F7A1]" : "bg-white",
                          message.deliveryStatus === "failed"
                            ? "border-red-400"
                            : "",
                          message.deliveryStatus === "sending"
                            ? "opacity-75"
                            : "",
                        ].join(" ")}
                      >
                        {message.body}
                      </div>

                      <div
                        className={[
                          "mt-1 flex items-center gap-2 text-[11px] text-gray-500",
                          mine
                            ? "justify-end text-left"
                            : "justify-start text-right",
                        ].join(" ")}
                      >
                        <span>{formatTime(message.createdAt)}</span>
                        {mine ? <MessageStatus message={message} /> : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div ref={messagesEndRef} />

          {selectedConversation &&
          selectedMessages.length === 0 &&
          !isMessagesLoading ? (
            <div className="flex h-full items-center justify-center text-center">
              <div className="rounded-2xl bg-white/85 px-6 py-5 text-sm text-gray-500 shadow-sm">
                هنوز پیامی در این گفتگو ثبت نشده است.
              </div>
            </div>
          ) : null}
        </div>

        {isAwayFromBottom ? (
          <button
            type="button"
            onClick={() => scrollToBottom("smooth")}
            className="absolute bottom-24 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-orange-200 bg-white text-[#E8793E] shadow-md transition hover:bg-orange-50"
            aria-label="رفتن به آخرین پیام"
          >
            <ChevronDown size={22} />
          </button>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="shrink-0 border-t border-gray-200 bg-white/90 px-8 py-4"
        >
          {errorMessage ? (
            <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {errorMessage}
            </p>
          ) : null}

          <div
            dir="ltr"
            className="flex items-center gap-3 rounded-2xl border border-gray-400 bg-white px-3 py-2"
          >
            <button
              type="submit"
              disabled={
                !selectedConversation || isSending || !messageText.trim()
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF6B1A] text-white transition hover:bg-[#e65f16] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="ارسال پیام"
            >
              <SendHorizonal size={19} />
            </button>

            <input
              dir="rtl"
              value={messageText}
              onChange={(event) => {
                setMessageText(event.target.value);
                sendTyping();
              }}
              disabled={!selectedConversation || isSending}
              placeholder="پیام خود را بنویسید..."
              className="h-9 min-w-0 flex-1 bg-transparent px-2 text-right text-sm outline-none placeholder:text-gray-500"
            />
          </div>
        </form>
      </main>
    </section>
  );
}