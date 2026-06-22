import { NextRequest, NextResponse } from "next/server";
import { loginWithApiKey, getProfile, updateProfile, upgradePlan, generateInvoice, listInvoices, getBillingStats, hashKey } from "@/lib/billing";
import { getActiveKey } from "@/lib/api-keys-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Profile + login via API key.
 *
 * POST   /api/profile { action: "login", apiKey }   — login (creates profile if needed)
 * GET    /api/profile                                — get current profile (reads X-API-Key)
 * PATCH  /api/profile { name?, email? }              — update profile
 * POST   /api/profile { action: "upgrade", plan }    — upgrade plan + generate invoice
 */
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ hasProfile: false }, { status: 200 });
  const profile = await getProfile(hashKey(apiKey));
  return NextResponse.json(profile);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    if (action === "login") {
      const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
      if (!apiKey) return NextResponse.json({ error: "`apiKey` is required." }, { status: 400 });
      const profile = await loginWithApiKey(apiKey);
      return NextResponse.json(profile);
    }

    if (action === "upgrade") {
      const apiKey = req.headers.get("x-api-key");
      if (!apiKey) return NextResponse.json({ error: "API key required." }, { status: 401 });
      const plan = typeof body.plan === "string" ? body.plan : "";
      const planMeta = (await import("@/lib/payments")).PLANS.find((p) => p.id === plan);
      if (!planMeta) return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
      const keyHash = hashKey(apiKey);
      const profile = await upgradePlan(keyHash, plan);
      const invoice = await generateInvoice({ keyHash, plan, amountCents: planMeta.priceCents });
      return NextResponse.json({ profile, invoice });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) return NextResponse.json({ error: "API key required." }, { status: 401 });
    const body = await req.json();
    const profile = await updateProfile(hashKey(apiKey), {
      name: typeof body.name === "string" ? body.name : undefined,
      email: typeof body.email === "string" ? body.email : undefined,
    });
    return NextResponse.json(profile);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
