import { db } from "./db";
import { createHash } from "crypto";
import { PLAN_LIMITS } from "./usage";
import { PLANS } from "./payments";

/**
 * Billing + user profile — server-only.
 *
 * - Login via API key (hash → profile)
 * - Plan-based function limits (credits, feature gates)
 * - Invoice generation + tracking
 * - Profile management (name, email, plan)
 */

export interface UserProfilePublic {
  id: string;
  hasProfile: true;
  email: string | null;
  name: string | null;
  plan: string;
  credits: number;
  tokensUsed: number;
  requestCount: number;
  internetEnabled: boolean;
  memoryEnabled: boolean;
  limits: typeof PLAN_LIMITS[string];
  createdAt: string;
  lastLoginAt: string | null;
}

export interface NoProfile {
  hasProfile: false;
}

export type ProfileResult = UserProfilePublic | NoProfile;

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Login: look up or create a profile from an API key. */
export async function loginWithApiKey(rawKey: string): Promise<ProfileResult> {
  const keyHash = hashKey(rawKey);
  let profile = await db.userProfile.findUnique({ where: { keyHash } });

  if (!profile) {
    // Auto-create a free profile.
    profile = await db.userProfile.create({
      data: {
        keyHash,
        plan: "free",
        credits: PLAN_LIMITS.free.credits,
      },
    });
  }

  // Update last login.
  profile = await db.userProfile.update({
    where: { keyHash },
    data: { lastLoginAt: new Date() },
  });

  const limits = PLAN_LIMITS[profile.plan] ?? PLAN_LIMITS.free;
  return {
    id: profile.id,
    hasProfile: true,
    email: profile.email,
    name: profile.name,
    plan: profile.plan,
    credits: profile.credits,
    tokensUsed: profile.tokensUsed,
    requestCount: profile.requestCount,
    internetEnabled: profile.internetEnabled,
    memoryEnabled: profile.memoryEnabled,
    limits,
    createdAt: profile.createdAt.toISOString(),
    lastLoginAt: profile.lastLoginAt ? profile.lastLoginAt.toISOString() : null,
  };
}

/** Get a profile by key hash (without updating lastLogin). */
export async function getProfile(keyHash: string): Promise<ProfileResult> {
  const profile = await db.userProfile.findUnique({ where: { keyHash } });
  if (!profile) return { hasProfile: false };
  const limits = PLAN_LIMITS[profile.plan] ?? PLAN_LIMITS.free;
  return {
    id: profile.id,
    hasProfile: true,
    email: profile.email,
    name: profile.name,
    plan: profile.plan,
    credits: profile.credits,
    tokensUsed: profile.tokensUsed,
    requestCount: profile.requestCount,
    internetEnabled: profile.internetEnabled,
    memoryEnabled: profile.memoryEnabled,
    limits,
    createdAt: profile.createdAt.toISOString(),
    lastLoginAt: profile.lastLoginAt ? profile.lastLoginAt.toISOString() : null,
  };
}

/** Update a profile (name, email). */
export async function updateProfile(
  keyHash: string,
  patch: { name?: string; email?: string },
): Promise<ProfileResult> {
  const data: Record<string, unknown> = {};
  if (patch.name !== undefined) data.name = patch.name.slice(0, 80);
  if (patch.email !== undefined) data.email = patch.email.slice(0, 120);
  await db.userProfile.update({ where: { keyHash }, data });
  return getProfile(keyHash);
}

/** Upgrade a profile to a new plan (grants credits). */
export async function upgradePlan(keyHash: string, plan: string): Promise<ProfileResult> {
  const limits = PLAN_LIMITS[plan];
  if (!limits) throw new Error(`Unknown plan: ${plan}`);
  const planMeta = PLANS.find((p) => p.id === plan);
  await db.userProfile.update({
    where: { keyHash },
    data: {
      plan,
      credits: planMeta?.credits ?? limits.credits,
    },
  });
  return getProfile(keyHash);
}

/** Check if a profile can use a feature. */
export function canUseFeature(profile: ProfileResult, feature: keyof typeof PLAN_LIMITS[string]): boolean {
  if (!profile.hasProfile) return false;
  return Boolean(profile.limits[feature]);
}

/** Check credits. */
export function hasCredits(profile: ProfileResult): boolean {
  if (!profile.hasProfile) return false;
  return profile.credits > 0;
}

/* ---------------- invoices ---------------- */

export interface InvoicePublic {
  id: string;
  number: string;
  type: string;
  description: string;
  amountCents: number;
  currency: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  paidAt: string | null;
}

function toInvoicePublic(row: {
  id: string; number: string; type: string; description: string;
  amountCents: number; currency: string; status: string;
  periodStart: Date; periodEnd: Date; createdAt: Date; paidAt: Date | null;
}): InvoicePublic {
  return {
    id: row.id,
    number: row.number,
    type: row.type,
    description: row.description,
    amountCents: row.amountCents,
    currency: row.currency,
    status: row.status,
    periodStart: row.periodStart.toISOString(),
    periodEnd: row.periodEnd.toISOString(),
    createdAt: row.createdAt.toISOString(),
    paidAt: row.paidAt ? row.paidAt.toISOString() : null,
  };
}

/** Generate an invoice for a plan upgrade. */
export async function generateInvoice(opts: {
  keyHash: string;
  plan: string;
  amountCents: number;
}): Promise<InvoicePublic> {
  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 86400000); // 30 days
  const number = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const row = await db.invoice.create({
    data: {
      keyHash: opts.keyHash,
      number,
      type: "plan",
      description: `Plan upgrade: ${opts.plan}`,
      amountCents: opts.amountCents,
      currency: "usd",
      status: "paid",
      periodStart: now,
      periodEnd: periodEnd,
      paidAt: now,
    },
  });
  return toInvoicePublic(row);
}

/** List invoices for a key. */
export async function listInvoices(keyHash: string): Promise<InvoicePublic[]> {
  const rows = await db.invoice.findMany({
    where: { keyHash },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return rows.map(toInvoicePublic);
}

/** Get billing stats across all users (admin). */
export async function getBillingStats(): Promise<{
  totalUsers: number;
  totalRevenue: number;
  totalCredits: number;
  totalTokens: number;
  byPlan: Record<string, number>;
}> {
  const profiles = await db.userProfile.findMany();
  const invoices = await db.invoice.findMany({ where: { status: "paid" } });
  const byPlan: Record<string, number> = {};
  for (const p of profiles) {
    byPlan[p.plan] = (byPlan[p.plan] ?? 0) + 1;
  }
  return {
    totalUsers: profiles.length,
    totalRevenue: invoices.reduce((s, i) => s + i.amountCents, 0),
    totalCredits: profiles.reduce((s, p) => s + p.credits, 0),
    totalTokens: profiles.reduce((s, p) => s + p.tokensUsed, 0),
    byPlan,
  };
}

export { hashKey };
