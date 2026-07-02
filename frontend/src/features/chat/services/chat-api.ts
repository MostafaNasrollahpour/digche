import { API_BASE_URL } from "@/config/api";
import type {
  ChatConversation,
  ChatMessage,
  ChatSearchUser,
  StartChatConversationInput,
} from "../types/chat.types";

const CHAT_API_BASE_URL = "/api/chat";

type ErrorResponseBody = {
  error?: {
    code?: string;
    message?: string;
  };
  code?: string;
  message?: string;
};

type RequestJsonOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  accessToken?: string | null;
  headers?: HeadersInit;
};

export class ChatApiError extends Error {
  status: number;
  code?: string;
  backendMessage?: string;

  constructor(
    message: string,
    status: number,
    code?: string,
    backendMessage?: string
  ) {
    super(message);
    this.name = "ChatApiError";
    this.status = status;
    this.code = code;
    this.backendMessage = backendMessage;
  }
}

function toProxyChatPath(path: string) {
  return path.startsWith("/chat") ? path.slice("/chat".length) : path;
}

async function requestJson<ResponseBody>(
  path: string,
  options: RequestJsonOptions = {}
): Promise<ResponseBody> {
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(`${CHAT_API_BASE_URL}${toProxyChatPath(path)}`, {
      method: options.method ?? "GET",
      cache: "no-store",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ChatApiError(
      "ارتباط با سرویس پیام‌ها برقرار نشد. وضعیت بک‌اند یا آدرس API را بررسی کنید.",
      0,
      "NETWORK_ERROR"
    );
  }

  const responseBody = await readJsonResponse(response);

  if (!response.ok) {
    const errorBody = responseBody as ErrorResponseBody | null;
    const code = errorBody?.error?.code || errorBody?.code;
    const message = errorBody?.error?.message || errorBody?.message;

    throw new ChatApiError(
      message || getFallbackHttpErrorMessage(response.status),
      response.status,
      code,
      message
    );
  }

  return responseBody as ResponseBody;
}

async function requestAuthJson<ResponseBody>(
  path: string,
  options: RequestJsonOptions = {}
): Promise<ResponseBody> {
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      cache: "no-store",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ChatApiError(
      "ارتباط با سرویس احراز هویت برقرار نشد. وضعیت بک‌اند یا آدرس API را بررسی کنید.",
      0,
      "NETWORK_ERROR"
    );
  }

  const responseBody = await readJsonResponse(response);

  if (!response.ok) {
    const errorBody = responseBody as ErrorResponseBody | null;
    const code = errorBody?.error?.code || errorBody?.code;
    const message = errorBody?.error?.message || errorBody?.message;

    throw new ChatApiError(
      message || getFallbackHttpErrorMessage(response.status),
      response.status,
      code,
      message
    );
  }

  return responseBody as ResponseBody;
}

async function readJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function getFallbackHttpErrorMessage(status: number) {
  if (status === 400) return "اطلاعات پیام معتبر نیست.";
  if (status === 401) return "نشست کاربری منقضی شده است. دوباره وارد شوید.";
  if (status === 403) return "شما عضو این گفتگو نیستید.";
  if (status === 404) return "گفتگوی موردنظر پیدا نشد.";
  if (status === 502) return "Next proxy نتوانست به سرویس چت وصل شود.";
  if (status >= 500) return "خطای داخلی سرویس پیام‌ها.";
  return "درخواست پیام‌ها ناموفق بود.";
}

function buildQuery(params: Record<string, string | number | null | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function listChatConversations(accessToken: string) {
  return requestJson<{ conversations: ChatConversation[] }>("/chat/conversations", {
    method: "GET",
    accessToken,
  });
}

export function startChatConversation(
  accessToken: string,
  input: StartChatConversationInput
) {
  return requestJson<{ conversation: ChatConversation; created: boolean }>(
    "/chat/conversations",
    {
      method: "POST",
      accessToken,
      body: input,
    }
  );
}

export function getChatMessages(
  accessToken: string,
  conversationId: string,
  options: { limit?: number; before?: string | null } = {}
) {
  const query = buildQuery({
    limit: options.limit,
    before: options.before,
  });

  return requestJson<{ messages: ChatMessage[] }>(
    `/chat/conversations/${conversationId}/messages${query}`,
    {
      method: "GET",
      accessToken,
    }
  );
}

export function sendChatMessage(
  accessToken: string,
  conversationId: string,
  input: {
    body: string;
    clientMessageId?: string | null;
    metadata?: Record<string, unknown> | null;
  }
) {
  return requestJson<{ message: ChatMessage }>(
    `/chat/conversations/${conversationId}/messages`,
    {
      method: "POST",
      accessToken,
      body: input,
    }
  );
}

export function markChatConversationRead(
  accessToken: string,
  conversationId: string,
  lastReadMessageId?: string | null
) {
  return requestJson<{ readState: unknown }>(
    `/chat/conversations/${conversationId}/read`,
    {
      method: "POST",
      accessToken,
      body: { lastReadMessageId: lastReadMessageId ?? null },
    }
  );
}

export function buildChatWebSocketUrl(accessToken: string) {
  const baseUrl = API_BASE_URL.replace(/\/$/, "");

  if (!baseUrl && typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    return `${protocol}//${window.location.host}/chat/ws?token=${encodeURIComponent(
      accessToken
    )}`;
  }

  const wsBaseUrl = baseUrl.startsWith("https://")
    ? baseUrl.replace("https://", "wss://")
    : baseUrl.replace("http://", "ws://");

  return `${wsBaseUrl}/chat/ws?token=${encodeURIComponent(accessToken)}`;
}


function normalizeSearchUsersResponse(response: unknown): ChatSearchUser[] {
  if (!response || typeof response !== "object") {
    return [];
  }

  const body = response as {
    users?: ChatSearchUser[];
    results?: ChatSearchUser[];
    data?: ChatSearchUser[];
  };

  return body.users || body.results || body.data || [];
}

export async function searchChatUsersByUsername(
  accessToken: string,
  username: string
) {
  const normalizedUsername = username.trim();

  if (normalizedUsername.length < 2) {
    return [];
  }

  const response = await requestAuthJson<unknown>(
    `/auth/users/search${buildQuery({ username: normalizedUsername, limit: 8 })}`,
    {
      method: "GET",
      accessToken,
    }
  );

  return normalizeSearchUsersResponse(response);
}
