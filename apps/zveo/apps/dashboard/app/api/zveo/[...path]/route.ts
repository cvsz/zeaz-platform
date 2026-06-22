import { NextResponse } from "next/server";
import { buildDashboardAuthHeaders, getDashboardRuntimeOptions } from "@/lib/service-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ path: string[] }> | { path: string[] };
};

async function proxyRequest(request: Request, context: RouteContext): Promise<Response> {
  const { path } = await context.params;
  const targetPath = `/${path.join("/")}`;
  const runtime = getDashboardRuntimeOptions();
  const upstreamUrl = new URL(targetPath, runtime.apiBaseUrl);
  upstreamUrl.search = new URL(request.url).search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  for (const [key, value] of Object.entries(buildDashboardAuthHeaders())) {
    headers.set(key, value);
  }

  const body = request.method === "GET" || request.method === "HEAD"
    ? undefined
    : await request.text();

  const upstream = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if ([
      "content-length",
      "connection",
      "keep-alive",
      "proxy-authenticate",
      "proxy-authorization",
      "te",
      "trailers",
      "transfer-encoding",
      "upgrade",
    ].includes(lower)) {
      return;
    }
    responseHeaders.set(key, value);
  });

  const responseText = await upstream.text();
  return new NextResponse(responseText || null, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  return proxyRequest(request, context);
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
  return proxyRequest(request, context);
}

export async function PUT(request: Request, context: RouteContext): Promise<Response> {
  return proxyRequest(request, context);
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  return proxyRequest(request, context);
}

export async function DELETE(request: Request, context: RouteContext): Promise<Response> {
  return proxyRequest(request, context);
}
