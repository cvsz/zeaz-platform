"use client";

import { useState } from "react";
import { QrCode, Loader2, AlertCircle, Check, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

export function PromptPayPanel() {
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState("");
  const [payload, setPayload] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!target.trim() || loading) return;
    setLoading(true);
    setError(null);
    setPayload(null);
    try {
      const amt = parseFloat(amount);
      const res = await fetch("/api/promptpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: target.trim(),
          amount: isNaN(amt) ? undefined : amt,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Failed");
      setPayload(data.payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate QR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <SectionLabel>promptpay · thai qr payment</SectionLabel>
      <p className="mb-2 text-[11px] leading-relaxed text-zinc-500">
        Generate a PromptPay QR code for Thai payments. Enter a phone number or National ID, optionally an amount.
      </p>

      <input
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="0812345678 or 13-digit ID"
        className="w-full rounded-xl border border-emerald-500/15 bg-[#0a0f0d]/60 px-3 py-2 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
      />
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in THB (optional)"
        type="number"
        step="0.01"
        className="w-full rounded-xl border border-emerald-500/15 bg-[#0a0f0d]/60 px-3 py-2 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:outline-none"
      />

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!target.trim() || loading}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/[0.05] px-3 py-2 font-mono text-[11px] font-medium text-emerald-300 hover:from-emerald-500/25 hover:to-emerald-500/10 disabled:opacity-40"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <QrCode className="h-3 w-3" />}
        generate qr
      </button>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-3 py-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span className="font-mono text-[11px] text-rose-300">{error}</span>
        </div>
      )}

      {payload && (
        <div className="grad-border anim-fade-in-up rounded-xl bg-[#07090a]/40 p-4 text-center">
          <div className="mb-2 flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-emerald-400/70">
            <Check className="h-3 w-3" /> promptpay qr ready
          </div>
          <div className="mx-auto mb-3 max-w-[200px] rounded-lg bg-white p-3">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payload)}`}
              alt="PromptPay QR"
              className="w-full"
            />
          </div>
          <div className="rounded-lg border border-zinc-800 bg-[#0a0f0d]/60 p-2">
            <div className="font-mono text-[9px] uppercase tracking-wide text-zinc-600">payload</div>
            <code className="break-all font-mono text-[9.5px] text-zinc-500">{payload}</code>
          </div>
          {amount && (
            <div className="mt-2 font-mono text-[14px] font-bold text-emerald-300">
              ฿{parseFloat(amount).toFixed(2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">{children}</div>;
}
