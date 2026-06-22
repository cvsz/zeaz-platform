import { NextRequest, NextResponse } from "next/server";
import { hashKey, listInvoices, getBillingStats, generateInvoice } from "@/lib/billing";
import { getUsageStats } from "@/lib/usage";
import { listKeys, getKeyConfig } from "@/lib/api-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Billing.
 *
 * GET  /api/billing              — list invoices for the current key (X-API-Key)
 *                                  OR admin stats if ?admin=1
 * POST /api/billing              — generate invoice { plan, amountCents }
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const isAdmin = url.searchParams.get("admin") === "1";

  if (isAdmin) {
    const [stats, keys, config] = await Promise.all([getBillingStats(), listKeys(), getKeyConfig()]);
    return NextResponse.json({ stats, keys, config });
  }

  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ invoices: [] });
  const invoices = await listInvoices(hashKey(apiKey));
  return NextResponse.json({ invoices });
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "API key required." }, { status: 401 });
  try {
    const body = await req.json();
    const plan = typeof body.plan === "string" ? body.plan : "";
    const amountCents = typeof body.amountCents === "number" ? body.amountCents : 0;
    const invoice = await generateInvoice({ keyHash: hashKey(apiKey), plan, amountCents });
    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
