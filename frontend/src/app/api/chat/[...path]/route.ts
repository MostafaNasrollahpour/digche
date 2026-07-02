import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_BASE_URL =
  process.env.NEXT_BACKEND_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function proxyChatRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const targetPath = path.join("/");
  const targetUrl = new URL(`/chat/${targetPath}`, BACKEND_API_BASE_URL);

  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const headers = new Headers();

  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");

  if (authorization) {
    headers.set("authorization", authorization);
  }

  if (contentType) {
    headers.set("content-type", contentType);
  }

  headers.set("accept", "application/json");

  const hasBody = !["GET", "HEAD"].includes(request.method);

  try {
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    });

    const responseText = await response.text();

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "CHAT_PROXY_NETWORK_ERROR",
          message: "Chat service is not reachable from Next.js proxy.",
        },
      },
      { status: 502 }
    );
  }
}

export const GET = proxyChatRequest;
export const POST = proxyChatRequest;
export const PATCH = proxyChatRequest;
export const PUT = proxyChatRequest;
export const DELETE = proxyChatRequest;
