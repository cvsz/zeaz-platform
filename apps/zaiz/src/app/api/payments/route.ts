import { NextRequest, NextResponse } from "next/server";
import { PLANS, createOrder, payOrder, listOrders, getPaymentStats } from "@/lib/payments";
import type { PlanId, Provider } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET  /api/payments          — list plans + orders + stats
 * POST /api/payments          — create order { email, plan, provider? }
 * PATCH /api/payments         — pay order { reference }
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email") ?? undefined;
  const [orders, stats] = await Promise.all([listOrders(email), getPaymentStats()]);
  return NextResponse.json({ plans: PLANS, orders, stats });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email : "";
    const plan = typeof body.plan === "string" ? body.plan as PlanId : "starter";
    const provider = (typeof body.provider === "string" ? body.provider : "mock") as Provider;

    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    const order = await createOrder({ email: email.trim(), plan, provider });
    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create order" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const reference = typeof body.reference === "string" ? body.reference : "";
    if (!reference) {
      return NextResponse.json({ error: "`reference` is required." }, { status: 400 });
    }
    const order = await payOrder(reference);
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment failed" },
      { status: 500 },
    );
  }
}
