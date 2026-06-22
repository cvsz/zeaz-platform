import { NextRequest, NextResponse } from "next/server";
import { executeSandbox, SANDBOX_EXAMPLES } from "@/lib/sandbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

/**
 * Sandbox code execution.
 *
 * GET  /api/sandbox  — list example snippets
 * POST /api/sandbox  — execute code { code, timeoutMs? }
 */
export async function GET() {
  return NextResponse.json({ examples: SANDBOX_EXAMPLES });
}

export async function POST(req: NextRequest) {
  let body: { code?: string; timeoutMs?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code : "";
  if (!code.trim()) {
    return NextResponse.json({ error: "`code` is required." }, { status: 400 });
  }

  // Cap code size and timeout.
  const trimmedCode = code.slice(0, 10000);
  const timeoutMs = Math.min(body.timeoutMs ?? 5000, 10000);

  const result = executeSandbox(trimmedCode, timeoutMs);
  return NextResponse.json(result);
}
