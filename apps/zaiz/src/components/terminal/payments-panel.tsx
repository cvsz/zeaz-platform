"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCard, Check, Loader2, AlertCircle, Sparkles, TrendingUp, Receipt } from "lucide-react";
import type { PlanMeta, PaymentOrderPublic } from "@/lib/payments";
import { cn } from "@/lib/utils";

interface Stats {
  total: number; paid: number; pending: number; revenueCents: number; totalCredits: number;
}

export function PaymentsPanel() {
  const [plans, setPlans] = useState<PlanMeta[]>([]);
  const [orders, setOrders] = useState<PaymentOrderPublic[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [processing, setProcessing] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      setPlans(data.plans ?? []);
      setOrders(data.orders ?? []);
      setStats(data.stats ?? null);
    } catch {
      setError("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCheckout = async (plan: PlanMeta) => {
    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Enter a valid email first.");
      return;
    }
    setProcessing(plan.id);
    setError(null);
    setSuccess(null);
    try {
      // Create order
      const createRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), plan: plan.id, provider: "mock" }),
      });
      if (!createRes.ok) throw new Error("Failed to create order");
      const order = await createRes.json();

      // Pay (mock provider)
      const payRes = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: order.reference }),
      });
      if (!payRes.ok) throw new Error("Payment failed");
      setSuccess(`Payment successful! ${plan.credits.toLocaleString()} credits added. Ref: ${order.reference}`);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center gap-2 py-12 font-mono text-[11px] text-zinc-600"><Loader2 className="h-4 w-4 animate-spin" /> loading…</div>;
  }

  return (
    <div className="space-y-3">
      <SectionLabel>payment gateway · checkout</SectionLabel>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          <MiniStat label="Orders" value={stats.total} />
          <MiniStat label="Paid" value={stats.paid} color="emerald" />
          <MiniStat label="Revenue" value={`$${(stats.revenueCents / 100).toFixed(2)}`} color="amber" />
        </div>
      )}

      {/* Email input */}
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="w-full rounded-xl border border-emerald-500/15 bg-[#0a0f0d]/60 px-3 py-2 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
      />

      {/* Plans */}
      <div className="space-y-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "grad-border rounded-xl p-3 transition-all",
              plan.highlight ? "bg-emerald-500/[0.05]" : "bg-[#07090a]/40",
              selectedPlan === plan.id && "ring-1 ring-emerald-500/40",
            )}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[13px] font-semibold text-zinc-100">{plan.name}</span>
              {plan.highlight && (
                <span className="rounded-full bg-emerald-500/20 px-1.5 py-px font-mono text-[8.5px] uppercase text-emerald-400">popular</span>
              )}
              <span className="ml-auto font-mono text-[14px] font-bold text-emerald-300">
                {plan.priceCents === 0 ? "Free" : `$${(plan.priceCents / 100).toFixed(0)}`}
                {plan.priceCents > 0 && <span className="text-[10px] text-zinc-600">/mo</span>}
              </span>
            </div>
            <div className="mt-1 font-mono text-[10px] text-zinc-500">
              {plan.credits.toLocaleString()} credits · {plan.rateLimitPerHour === 0 ? "∞" : plan.rateLimitPerHour}/hr
            </div>
            <ul className="mt-2 space-y-0.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-[10.5px] text-zinc-400">
                  <Check className="h-2.5 w-2.5 text-emerald-400" /> {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleCheckout(plan); }}
              disabled={processing === plan.id}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/[0.05] px-3 py-1.5 font-mono text-[11px] font-medium text-emerald-300 transition-all hover:from-emerald-500/25 hover:to-emerald-500/10 active:scale-[0.98] disabled:opacity-40"
            >
              {processing === plan.id ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> processing…</>
              ) : (
                <><CreditCard className="h-3 w-3" /> {plan.priceCents === 0 ? "claim free" : "checkout"}</>
              )}
            </button>
          </div>
        ))}
      </div>

      {error && <ErrorBox text={error} />}
      {success && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] px-3 py-2">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
          <span className="font-mono text-[11px] text-emerald-300">{success}</span>
        </div>
      )}

      {/* Recent orders */}
      {orders.length > 0 && (
        <div>
          <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.15em] text-zinc-600">recent orders</div>
          <div className="space-y-1">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center gap-2 rounded-lg border border-zinc-800/50 bg-[#0a0f0d]/40 px-2.5 py-1.5">
                <Receipt className="h-3 w-3 shrink-0 text-zinc-600" />
                <code className="font-mono text-[9.5px] text-zinc-500">{o.reference.slice(0, 16)}</code>
                <span className="font-mono text-[10px] text-zinc-400">{o.plan}</span>
                <span className={cn(
                  "ml-auto rounded-full px-1.5 py-px font-mono text-[8.5px] uppercase",
                  o.status === "paid" ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-800 text-zinc-500",
                )}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className={cn("rounded-lg border p-2 text-center", color === "emerald" ? "border-emerald-500/20 bg-emerald-500/[0.04]" : color === "amber" ? "border-amber-400/20 bg-amber-400/[0.04]" : "border-zinc-800 bg-[#0a0f0d]/40")}>
      <div className="font-mono text-[16px] font-bold text-zinc-200">{value}</div>
      <div className="font-mono text-[8.5px] uppercase tracking-wide text-zinc-600">{label}</div>
    </div>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
      <span className="font-mono text-[11px] text-rose-300">{text}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">{children}</div>;
}

type PlanId = "starter" | "pro" | "team" | "enterprise";
