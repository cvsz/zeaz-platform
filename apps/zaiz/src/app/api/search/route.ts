import { NextRequest, NextResponse } from "next/server";
import { webSearch, readPage } from "@/lib/web-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET  /api/search?q=<query>&num=<n>   — web search
 * POST /api/search                      — read page { url }
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const num = Math.min(parseInt(url.searchParams.get("num") ?? "8") || 8, 20);

  if (!q.trim()) {
    return NextResponse.json({ ok: false, error: "`q` query param is required." }, { status: 400 });
  }

  const result = await webSearch(q.trim(), num);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = typeof body.url === "string" ? body.url : "";
    if (!url.trim()) {
      return NextResponse.json({ ok: false, error: "`url` is required." }, { status: 400 });
    }
    const result = await readPage(url.trim());
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
}
