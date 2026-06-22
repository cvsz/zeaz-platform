import { db } from "./db";
import { randomBytes } from "crypto";

/**
 * Payment gateway — server-only.
 *
 * Creates orders, processes payments (mock provider for demo; Stripe/PayPal
 * adapters can be added), and tracks status. Credits are granted on payment.
 */

export type PlanId = "starter" | "pro" | "team" | "enterprise";
export type OrderStatus = "pending" | "paid" | "failed" | "refunded";
export type Provider = "mock" | "stripe" | "paypal";

export interface PlanMeta {
  id: PlanId;
  name: string;
  priceCents: number;
  credits: number;
  rateLimitPerHour: number;
  features: string[];
  highlight?: boolean;
}

export const PLANS: PlanMeta[] = [
  {
    id: "starter",
    name: "Starter",
    priceCents: 0,
    credits: 100,
    rateLimitPerHour: 20,
    features: ["100 requests/month", "All GLM models", "Local model", "Web search"],
  },
  {
    id: "pro",
    name: "Pro",
    priceCents: 1900,
    credits: 5000,
    rateLimitPerHour: 200,
    features: ["5,000 requests/month", "All GLM models", "Priority streaming", "Agents + Plans", "Sandbox"],
    highlight: true,
  },
  {
    id: "team",
    name: "Team",
    priceCents: 4900,
    credits: 20000,
    rateLimitPerHour: 1000,
    features: ["20,000 requests/month", "Everything in Pro", "5 API keys", "Admin dashboard", "Permissions"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceCents: 19900,
    credits: 100000,
    rateLimitPerHour: 0,
    features: ["100,000 requests/month", "Everything in Team", "Unlimited keys", "SSO + audit log", "Support"],
  },
];

export const PLAN_MAP = new Map(PLANS.map((p) => [p.id, p]));

export interface PaymentOrderPublic {
  id: string;
  reference: string;
  email: string;
  plan: string;
  amountCents: number;
  currency: string;
  status: OrderStatus;
  provider: string;
  credits: number;
  createdAt: string;
  paidAt: string | null;
}

function toPublic(row: {
  id: string; reference: string; email: string; plan: string;
  amountCents: number; currency: string; status: string; provider: string;
  credits: number; createdAt: Date; paidAt: Date | null;
}): PaymentOrderPublic {
  return {
    id: row.id,
    reference: row.reference,
    email: row.email,
    plan: row.plan,
    amountCents: row.amountCents,
    currency: row.currency,
    status: row.status as OrderStatus,
    provider: row.provider,
    credits: row.credits,
    createdAt: row.createdAt.toISOString(),
    paidAt: row.paidAt ? row.paidAt.toISOString() : null,
  };
}

function genReference(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

/** Create a new payment order. */
export async function createOrder(opts: {
  email: string;
  plan: PlanId;
  provider?: Provider;
}): Promise<PaymentOrderPublic> {
  const plan = PLAN_MAP.get(opts.plan);
  if (!plan) throw new Error(`Unknown plan: ${opts.plan}`);
  const row = await db.paymentOrder.create({
    data: {
      reference: genReference(),
      email: opts.email.trim().toLowerCase(),
      plan: plan.id,
      amountCents: plan.priceCents,
      currency: "usd",
      status: "pending",
      provider: opts.provider ?? "mock",
      credits: plan.credits,
    },
  });
  return toPublic(row);
}

/** Process (pay) an order via the mock provider. */
export async function payOrder(reference: string): Promise<PaymentOrderPublic> {
  const row = await db.paymentOrder.findUnique({ where: { reference } });
  if (!row) throw new Error("Order not found");
  if (row.status === "paid") throw new Error("Order already paid");

  // Mock payment: always succeeds for demo. Real impl would call Stripe/PayPal.
  const txId = `MOCK-${randomBytes(8).toString("hex")}`;
  const updated = await db.paymentOrder.update({
    where: { reference },
    data: {
      status: "paid",
      providerTxId: txId,
      paidAt: new Date(),
    },
  });
  return toPublic(updated);
}

/** List orders (optionally filtered by email). */
export async function listOrders(email?: string): Promise<PaymentOrderPublic[]> {
  const where = email ? { email: email.trim().toLowerCase() } : undefined;
  const rows = await db.paymentOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map(toPublic);
}

/** Get order stats for the admin dashboard. */
export async function getPaymentStats(): Promise<{
  total: number;
  paid: number;
  pending: number;
  revenueCents: number;
  totalCredits: number;
}> {
  const rows = await db.paymentOrder.findMany();
  const paid = rows.filter((r) => r.status === "paid");
  return {
    total: rows.length,
    paid: paid.length,
    pending: rows.filter((r) => r.status === "pending").length,
    revenueCents: paid.reduce((s, r) => s + r.amountCents, 0),
    totalCredits: paid.reduce((s, r) => s + r.credits, 0),
  };
}
