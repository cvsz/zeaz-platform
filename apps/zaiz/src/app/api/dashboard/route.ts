import { NextRequest, NextResponse } from "next/server";
import { hashKey, getProfile, getBillingStats } from "@/lib/billing";
import { getUsageStats } from "@/lib/usage";
import { listMemories } from "@/lib/memory";
import { listInvoices } from "@/lib/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Dashboard — aggregated overview for the current user.
 *
 * GET /api/dashboard — requires X-API-Key
 * Returns: profile, usage stats, memory count, recent invoices, billing stats
 */
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "API key required. Login via /profile first." }, { status: 401 });
  }

  const keyHash = hashKey(apiKey);

  const [profile, usage, memories, invoices, billingStats] = await Promise.all([
    getProfile(keyHash),
    getUsageStats(keyHash),
    listMemories(keyHash),
    listInvoices(keyHash),
    getBillingStats(),
  ]);

  return NextResponse.json({
    profile,
    usage,
    memoryCount: memories.length,
    memories: memories.slice(0, 5),
    invoices,
    billingStats,
  });
}
