import { NextRequest, NextResponse } from "next/server";
import { createPromptPay } from "@/lib/promptpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/promptpay { target, amount? } → { ok, payload, target, amount } */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const target = typeof body.target === "string" ? body.target.trim() : "";
    const amount = typeof body.amount === "number" ? body.amount : undefined;

    if (!target) {
      return NextResponse.json({ error: "`target` (phone or national ID) is required." }, { status: 400 });
    }

    const result = createPromptPay(target, amount);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
