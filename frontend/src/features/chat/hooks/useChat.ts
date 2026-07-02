"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildChatWebSocketUrl,
  getChatMessages,
  listChatConversations,
  markChatConversationRead,
  sendChatMessage as sendChatMessageHttp,
  startChatConversation,
  searchChatUsersByUsername,
} from "../services/chat-api";
import type {
  ChatActor,
  ChatConversation,
  ChatMessage,
  ChatSearchUser,
  ChatSocketStatus,
  ChatUiMessage,
  StartChatConversationInput,
} from "../types/chat.types";

type UseChatOptions = {
  accessToken: string | null;
  currentActor: ChatActor | null;
  initialConversationId?: string | null;
  startConversation?: StartChatConversationInput | null;
};

type SocketPayload =
  | { type: "connection.ready" }
  | { type: "conversation.subscribed"; conversationId: string }
  | { type: "message.created"; message: ChatMessage }
  | {
      type: "message.read";
      conversationId: string;
      reader?: { id: string; type: string };
      readState?: unknown;
    }
  | {
      type: "typing";
      conversationId: string;
      actor?: { id: string; type: string; displayName?: string | null };
      isTyping?: boolean;
    }
  | { type: "error"; error?: { code?: string; message?: string } };

const REALTIME_RECONNECT_DELAYS = [800, 1600, 3200, 6000, 10000];
const OPTIMISTIC_TIMEOUT_MS = 9000;
const FALLBACK_POLL_MS = 2500;
const TYPING_CLEAR_MS = 2200;

function sortMessages(messages: ChatUiMessage[]) {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

function messageKey(message: ChatUiMessage) {
  return message.clientMessageId || message.id;
}

function mergeMessages(current: ChatUiMessage[], incoming: ChatUiMessage[]) {
  const map = new Map<string, ChatUiMessage>();

  current.forEach((message) => {
    map.set(messageKey(message), message);
  });

  incoming.forEach((message) => {
    const key = messageKey(message);
    const existing = map.get(key);

    map.set(key, {
      ...existing,
      ...message,
      deliveryStatus:
        message.deliveryStatus ||
        existing?.deliveryStatus ||
        (message.isOptimistic ? "sending" : "sent"),
      isOptimistic: message.isOptimistic ?? existing?.isOptimistic ?? false,
    });
  });

  return sortMessages([...map.values()]);
}

function upsertConversation(list: ChatConversation[], conversation: ChatConversation) {
  const exists = list.some((item) => item.id === conversation.id);
  const next = exists
    ? list.map((item) => (item.id === conversation.id ? { ...item, ...conversation } : item))
    : [conversation, ...list];

  return [...next].sort((a, b) => {
    const left = a.lastMessageAt || a.updatedAt || a.createdAt;
    const right = b.lastMessageAt || b.updatedAt || b.createdAt;
    return new Date(right).getTime() - new Date(left).getTime();
  });
}

function createClientMessageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useChat({
  accessToken,
  currentActor,
  initialConversationId = null,
  startConversation: startConversationInput = null,
}: UseChatOptions) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    initialConversationId
  );
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, ChatUiMessage[]>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isOlderMessagesLoading, setIsOlderMessagesLoading] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState<Record<string, boolean>>({});
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [socketStatus, setSocketStatus] = useState<ChatSocketStatus>("idle");
  const [typingText, setTypingText] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<ChatSearchUser[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [userSearchError, setUserSearchError] = useState("");
  const [typingConversationIds, setTypingConversationIds] = useState<Record<string, boolean>>({});

  const bootedAccessTokenRef = useRef<string | null>(null);
  const bootedStartConversationRef = useRef(false);
  const selectedConversationIdRef = useRef<string | null>(selectedConversationId);
  const socketRef = useRef<WebSocket | null>(null);
  const connectSocketRef = useRef<(() => void) | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const intentionalSocketCloseRef = useRef(false);
  const subscribedConversationIdsRef = useRef<Set<string>>(new Set());
  const typingTimerRef = useRef<number | null>(null);
  const outgoingTypingTimerRef = useRef<number | null>(null);
  const optimisticTimersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedConversationId) ?? null;

  const selectedMessages = selectedConversationId
    ? messagesByConversation[selectedConversationId] ?? []
    : [];

  const clearOptimisticTimer = useCallback((clientMessageId?: string | null) => {
    if (!clientMessageId) return;

    const timer = optimisticTimersRef.current[clientMessageId];

    if (timer) {
      window.clearTimeout(timer);
      delete optimisticTimersRef.current[clientMessageId];
    }
  }, []);

  const refreshConversations = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (!accessToken) return [];

      if (!options.silent) {
        setIsLoading(true);
        setErrorMessage("");
      }

      try {
        const response = await listChatConversations(accessToken);
        setConversations(response.conversations);
        return response.conversations;
      } catch (error) {
        if (!options.silent) {
          setErrorMessage(
            error instanceof Error ? error.message : "خطای دریافت گفتگوها رخ داد."
          );
        }

        return [];
      } finally {
        if (!options.silent) {
          setIsLoading(false);
        }
      }
    },
    [accessToken]
  );

  const markConversationReadLocal = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    );
  }, []);

  const notifyConversationRead = useCallback(
    (conversationId: string, lastReadMessageId: string | null = null) => {
      const socket = socketRef.current;

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "message.read",
            conversationId,
            lastReadMessageId,
          })
        );
        return;
      }

      if (accessToken) {
        void markChatConversationRead(
          accessToken,
          conversationId,
          lastReadMessageId
        ).catch(() => undefined);
      }
    },
    [accessToken]
  );

  const loadMessages = useCallback(
    async (conversationId: string, options: { silent?: boolean } = {}) => {
      if (!accessToken) return [];

      if (!options.silent) {
        setIsMessagesLoading(true);
        setErrorMessage("");
      }

      try {
        const response = await getChatMessages(accessToken, conversationId, {
          limit: 50,
        });

        const normalizedMessages: ChatUiMessage[] = response.messages.map((message) => ({
          ...message,
          deliveryStatus:
            currentActor &&
            message.senderId === currentActor.id &&
            message.senderType === currentActor.type
              ? "sent"
              : undefined,
        }));

        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]: mergeMessages(prev[conversationId] ?? [], normalizedMessages),
        }));

        setHasOlderMessages((prev) => ({
          ...prev,
          [conversationId]: response.messages.length >= 50,
        }));

        const lastMessage = response.messages[response.messages.length - 1];

        if (lastMessage) {
          markConversationReadLocal(conversationId);

          notifyConversationRead(conversationId, lastMessage.id);
        }

        return response.messages;
      } catch (error) {
        if (!options.silent) {
          setErrorMessage(
            error instanceof Error ? error.message : "خطای دریافت پیام‌ها رخ داد."
          );
        }

        return [];
      } finally {
        if (!options.silent) {
          setIsMessagesLoading(false);
        }
      }
    },
    [accessToken, currentActor, markConversationReadLocal, notifyConversationRead]
  );

  const loadOlderMessages = useCallback(async () => {
    if (!accessToken || !selectedConversationId || isOlderMessagesLoading) {
      return [];
    }

    const currentMessages = messagesByConversation[selectedConversationId] ?? [];
    const firstMessage = currentMessages[0];

    if (!firstMessage || hasOlderMessages[selectedConversationId] === false) {
      return [];
    }

    setIsOlderMessagesLoading(true);

    try {
      const response = await getChatMessages(accessToken, selectedConversationId, {
        limit: 30,
        before: firstMessage.createdAt,
      });

      const normalizedMessages: ChatUiMessage[] = response.messages.map((message) => ({
        ...message,
        deliveryStatus:
          currentActor &&
          message.senderId === currentActor.id &&
          message.senderType === currentActor.type
            ? "sent"
            : undefined,
      }));

      setMessagesByConversation((prev) => ({
        ...prev,
        [selectedConversationId]: mergeMessages(
          normalizedMessages,
          prev[selectedConversationId] ?? []
        ),
      }));

      setHasOlderMessages((prev) => ({
        ...prev,
        [selectedConversationId]: response.messages.length >= 30,
      }));

      return response.messages;
    } finally {
      setIsOlderMessagesLoading(false);
    }
  }, [
    accessToken,
    currentActor,
    hasOlderMessages,
    isOlderMessagesLoading,
    messagesByConversation,
    selectedConversationId,
  ]);

  const subscribeToConversation = useCallback((conversationId: string | null) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN || !conversationId) {
      return;
    }

    if (subscribedConversationIdsRef.current.has(conversationId)) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: "subscribe",
        conversationId,
      })
    );

    subscribedConversationIdsRef.current.add(conversationId);
  }, []);

  useEffect(() => {
    if (socketStatus !== "open") {
      return;
    }

    conversations.forEach((conversation) => {
      subscribeToConversation(conversation.id);
    });
  }, [conversations, socketStatus, subscribeToConversation]);

  const selectConversation = useCallback(
    async (conversationId: string) => {
      setSelectedConversationId(conversationId);
      selectedConversationIdRef.current = conversationId;
      markConversationReadLocal(conversationId);
      subscribeToConversation(conversationId);
      await loadMessages(conversationId);
    },
    [loadMessages, markConversationReadLocal, subscribeToConversation]
  );

  const handleIncomingMessage = useCallback(
    (message: ChatMessage) => {
      clearOptimisticTimer(message.clientMessageId);

      const incomingMessage: ChatUiMessage = {
        ...message,
        deliveryStatus:
          currentActor &&
          message.senderId === currentActor.id &&
          message.senderType === currentActor.type
            ? "sent"
            : undefined,
        isOptimistic: false,
      };

      setMessagesByConversation((prev) => ({
        ...prev,
        [message.conversationId]: mergeMessages(
          prev[message.conversationId] ?? [],
          [incomingMessage]
        ),
      }));

      setConversations((prev) => {
        const exists = prev.some(
          (conversation) => conversation.id === message.conversationId
        );

        const nextConversations = exists
          ? prev.map((conversation) => {
              if (conversation.id !== message.conversationId) {
                return conversation;
              }

              const isCurrentConversation =
                message.conversationId === selectedConversationIdRef.current;

              const isOwnMessage =
                currentActor &&
                message.senderId === currentActor.id &&
                message.senderType === currentActor.type;

              return {
                ...conversation,
                lastMessage: message,
                lastMessageAt: message.createdAt,
                unreadCount:
                  isCurrentConversation || isOwnMessage
                    ? 0
                    : (conversation.unreadCount ?? 0) + 1,
              };
            })
          : prev;

        return [...nextConversations].sort((a, b) => {
          const left = a.lastMessageAt || a.updatedAt || a.createdAt;
          const right = b.lastMessageAt || b.updatedAt || b.createdAt;

          return new Date(right).getTime() - new Date(left).getTime();
        });
      });

      if (message.conversationId === selectedConversationIdRef.current && accessToken) {
        notifyConversationRead(message.conversationId, message.id);
      }
    },
    [accessToken, clearOptimisticTimer, currentActor, notifyConversationRead]
  );

  const handleMessageRead = useCallback(
    (payload: Extract<SocketPayload, { type: "message.read" }>) => {
      if (!currentActor || !payload.reader || payload.reader.id === currentActor.id) {
        return;
      }

      setMessagesByConversation((prev) => {
        const messages = prev[payload.conversationId] ?? [];

        return {
          ...prev,
          [payload.conversationId]: messages.map((message) =>
            message.senderId === currentActor.id &&
            message.senderType === currentActor.type &&
            message.deliveryStatus !== "failed"
              ? { ...message, deliveryStatus: "seen" }
              : message
          ),
        };
      });
    },
    [currentActor]
  );

  const handleTypingPayload = useCallback(
    (payload: Extract<SocketPayload, { type: "typing" }>) => {
      if (!payload.actor || !currentActor || payload.actor.id === currentActor.id) {
        return;
      }

      if (!payload.isTyping) {
        setTypingConversationIds((prev) => {
          const next = { ...prev };
          delete next[payload.conversationId];
          return next;
        });

        if (payload.conversationId === selectedConversationIdRef.current) {
          setTypingText("");
        }

        return;
      }

      setTypingConversationIds((prev) => ({
        ...prev,
        [payload.conversationId]: true,
      }));

      if (payload.conversationId === selectedConversationIdRef.current) {
        setTypingText("در حال نوشتن...");
      }

      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }

      typingTimerRef.current = window.setTimeout(() => {
        setTypingConversationIds((prev) => {
          const next = { ...prev };
          delete next[payload.conversationId];
          return next;
        });

        if (payload.conversationId === selectedConversationIdRef.current) {
          setTypingText("");
        }
      }, TYPING_CLEAR_MS);
    },
    [currentActor]
  );

  const handleSocketPayload = useCallback(
    (payload: SocketPayload) => {
      if (payload.type === "connection.ready") {
        subscribeToConversation(selectedConversationIdRef.current);
        return;
      }

      if (payload.type === "message.created") {
        handleIncomingMessage(payload.message);
        return;
      }

      if (payload.type === "message.read") {
        handleMessageRead(payload);
        return;
      }

      if (payload.type === "typing") {
        handleTypingPayload(payload);
        return;
      }

      if (payload.type === "error") {
        setErrorMessage(payload.error?.message || "خطای ارتباط زنده پیام‌ها.");
      }
    },
    [handleIncomingMessage, handleMessageRead, handleTypingPayload, subscribeToConversation]
  );

  const connectSocket = useCallback(() => {
    if (!accessToken) return;

    intentionalSocketCloseRef.current = false;

    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.CONNECTING ||
        socketRef.current.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    setSocketStatus("connecting");

    const socket = new WebSocket(buildChatWebSocketUrl(accessToken));
    socketRef.current = socket;

    socket.onopen = () => {
      reconnectAttemptRef.current = 0;
      setSocketStatus("open");
      subscribeToConversation(selectedConversationIdRef.current);
    };

    socket.onmessage = (event) => {
      try {
        handleSocketPayload(JSON.parse(String(event.data)) as SocketPayload);
      } catch {
        setErrorMessage("پیام زنده نامعتبر دریافت شد.");
      }
    };

    socket.onerror = () => {
      setSocketStatus("error");
    };

    socket.onclose = () => {
      socketRef.current = null;
      subscribedConversationIdsRef.current.clear();

      if (intentionalSocketCloseRef.current) {
        setSocketStatus("closed");
        return;
      }

      setSocketStatus("closed");

      const delay =
        REALTIME_RECONNECT_DELAYS[
          Math.min(reconnectAttemptRef.current, REALTIME_RECONNECT_DELAYS.length - 1)
        ];

      reconnectAttemptRef.current += 1;

      reconnectTimerRef.current = window.setTimeout(() => {
        connectSocketRef.current?.();
      }, delay);
    };
  }, [accessToken, handleSocketPayload, subscribeToConversation]);

  useEffect(() => {
    connectSocketRef.current = connectSocket;
  }, [connectSocket]);

  useEffect(() => {
    if (!accessToken || !currentActor) {
      bootedAccessTokenRef.current = null;
      intentionalSocketCloseRef.current = true;
      socketRef.current?.close();
      socketRef.current = null;
      window.setTimeout(() => setSocketStatus("idle"), 0);
      return;
    }

    connectSocket();

    return () => {
      intentionalSocketCloseRef.current = true;

      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }

      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [accessToken, connectSocket, currentActor]);

  useEffect(() => {
    if (!accessToken || !currentActor) {
      return;
    }

    if (bootedAccessTokenRef.current === accessToken) {
      return;
    }

    bootedAccessTokenRef.current = accessToken;

    let cancelled = false;

    async function boot() {
      if (startConversationInput && !bootedStartConversationRef.current) {
        bootedStartConversationRef.current = true;

        try {
          setIsLoading(true);
          const response = await startChatConversation(accessToken!, startConversationInput);

          if (cancelled) return;

          setConversations((prev) => upsertConversation(prev, response.conversation));
          setSelectedConversationId(response.conversation.id);
          selectedConversationIdRef.current = response.conversation.id;
          subscribeToConversation(response.conversation.id);
          await loadMessages(response.conversation.id);
          return;
        } catch (error) {
          if (!cancelled) {
            setErrorMessage(error instanceof Error ? error.message : "شروع گفتگو ناموفق بود.");
          }
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      }

      const loadedConversations = await refreshConversations();

      if (cancelled) return;

      const nextConversationId =
        initialConversationId || loadedConversations[0]?.id || null;

      if (nextConversationId) {
        setSelectedConversationId(nextConversationId);
        selectedConversationIdRef.current = nextConversationId;
        subscribeToConversation(nextConversationId);
        await loadMessages(nextConversationId);
      }
    }

    void boot();

    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    currentActor,
    initialConversationId,
    loadMessages,
        refreshConversations,
    startConversationInput,
    subscribeToConversation,
  ]);

  useEffect(() => {
    if (!accessToken || !currentActor) {
      return;
    }

    const timer = window.setInterval(() => {
      void refreshConversations({ silent: true });

      const conversationId = selectedConversationIdRef.current;

      if (conversationId && socketStatus !== "open") {
        void loadMessages(conversationId, { silent: true });
      }
    }, FALLBACK_POLL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [accessToken, currentActor, loadMessages, refreshConversations, socketStatus]);


  const searchUsersByUsername = useCallback(
    async (username: string) => {
      const normalizedUsername = username.trim();

      if (!accessToken || normalizedUsername.length < 2) {
        setSearchedUsers([]);
        setUserSearchError("");
        return [];
      }

      setIsSearchingUsers(true);
      setUserSearchError("");

      try {
        const users = await searchChatUsersByUsername(accessToken, normalizedUsername);
        setSearchedUsers(users);
        return users;
      } catch (error) {
        setSearchedUsers([]);
        setUserSearchError(
          error instanceof Error ? error.message : "جستجوی کاربر ناموفق بود."
        );
        return [];
      } finally {
        setIsSearchingUsers(false);
      }
    },
    [accessToken]
  );

  const clearUserSearch = useCallback(() => {
    setSearchedUsers([]);
    setUserSearchError("");
  }, []);

  const sendTyping = useCallback(() => {
    const socket = socketRef.current;
    const conversationId = selectedConversationIdRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN || !conversationId) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: "typing",
        conversationId,
        isTyping: true,
      })
    );

    if (outgoingTypingTimerRef.current) {
      window.clearTimeout(outgoingTypingTimerRef.current);
    }

    outgoingTypingTimerRef.current = window.setTimeout(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "typing",
            conversationId,
            isTyping: false,
          })
        );
      }
    }, 1400);
  }, []);

  const markOptimisticFailedLater = useCallback((conversationId: string, clientMessageId: string) => {
    optimisticTimersRef.current[clientMessageId] = window.setTimeout(() => {
      setMessagesByConversation((prev) => {
        const messages = prev[conversationId] ?? [];

        return {
          ...prev,
          [conversationId]: messages.map((message) =>
            message.clientMessageId === clientMessageId &&
            message.deliveryStatus === "sending"
              ? { ...message, deliveryStatus: "failed" }
              : message
          ),
        };
      });
    }, OPTIMISTIC_TIMEOUT_MS);
  }, []);

  const sendMessage = useCallback(
    async (body: string) => {
      const normalizedBody = body.trim();

      if (!accessToken || !selectedConversationId || !currentActor || !normalizedBody) {
        return null;
      }

      const clientMessageId = createClientMessageId();
      const optimisticMessage: ChatUiMessage = {
        id: `temp-${clientMessageId}`,
        conversationId: selectedConversationId,
        senderId: currentActor.id,
        senderType: currentActor.type,
        body: normalizedBody,
        clientMessageId,
        metadata: null,
        createdAt: new Date().toISOString(),
        deliveryStatus: "sending",
        isOptimistic: true,
      };

      setIsSending(true);
      setErrorMessage("");

      setMessagesByConversation((prev) => ({
        ...prev,
        [selectedConversationId]: mergeMessages(prev[selectedConversationId] ?? [], [
          optimisticMessage,
        ]),
      }));

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === selectedConversationId
            ? {
                ...conversation,
                lastMessage: optimisticMessage,
                lastMessageAt: optimisticMessage.createdAt,
              }
            : conversation
        )
      );

      const socket = socketRef.current;

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "message.send",
            conversationId: selectedConversationId,
            body: normalizedBody,
            clientMessageId,
          })
        );

        markOptimisticFailedLater(selectedConversationId, clientMessageId);
        setIsSending(false);
        return optimisticMessage;
      }

      try {
        const response = await sendChatMessageHttp(accessToken, selectedConversationId, {
          body: normalizedBody,
          clientMessageId,
        });

        clearOptimisticTimer(clientMessageId);

        const sentMessage: ChatUiMessage = {
          ...response.message,
          deliveryStatus: "sent",
          isOptimistic: false,
        };

        setMessagesByConversation((prev) => ({
          ...prev,
          [selectedConversationId]: mergeMessages(prev[selectedConversationId] ?? [], [
            sentMessage,
          ]).filter((message) => message.id !== optimisticMessage.id),
        }));

        void refreshConversations({ silent: true });

        return sentMessage;
      } catch (error) {
        setMessagesByConversation((prev) => {
          const messages = prev[selectedConversationId] ?? [];

          return {
            ...prev,
            [selectedConversationId]: messages.map((message) =>
              message.clientMessageId === clientMessageId
                ? { ...message, deliveryStatus: "failed" }
                : message
            ),
          };
        });

        setErrorMessage(error instanceof Error ? error.message : "ارسال پیام ناموفق بود.");
        return null;
      } finally {
        setIsSending(false);
      }
    },
    [
      accessToken,
      clearOptimisticTimer,
      currentActor,
      markOptimisticFailedLater,
      searchedUsers,
    isSearchingUsers,
    userSearchError,
    searchUsersByUsername,
    clearUserSearch,
    refreshConversations,
      selectedConversationId,
    ]
  );


  const startDirectConversation = useCallback(
    async (input: StartChatConversationInput) => {
      if (!accessToken) {
        return null;
      }

      const participantId = input.participantId.trim();

      if (!participantId) {
        setErrorMessage("شناسه کاربر را وارد کنید.");
        return null;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await startChatConversation(accessToken, {
          participantId,
          participantType: input.participantType ?? "user",
          participantDisplayName: input.participantDisplayName?.trim() || participantId,
          title: input.title ?? null,
          type: input.type ?? "direct",
          orderId: input.orderId ?? null,
        });

        setConversations((prev) => upsertConversation(prev, response.conversation));
        setSelectedConversationId(response.conversation.id);
        selectedConversationIdRef.current = response.conversation.id;
        markConversationReadLocal(response.conversation.id);
        subscribeToConversation(response.conversation.id);
        await loadMessages(response.conversation.id);

        return response.conversation;
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "شروع گفتگو ناموفق بود.");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, loadMessages, markConversationReadLocal, subscribeToConversation]
  );

  const isMine = useCallback(
    (message: ChatMessage) =>
      Boolean(
        currentActor &&
        message.senderId === currentActor.id &&
        message.senderType === currentActor.type
      ),
    [currentActor]
  );

  return {
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
    typingConversationIds,
    searchedUsers,
    isSearchingUsers,
    userSearchError,
    searchUsersByUsername,
    clearUserSearch,
    refreshConversations,
    startDirectConversation,
    selectConversation,
    loadOlderMessages,
    sendTyping,
    sendMessage,
    isMine,
  };
}
