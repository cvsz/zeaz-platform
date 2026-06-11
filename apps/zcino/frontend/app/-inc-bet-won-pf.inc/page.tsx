'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function IncBetWonPfIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Bet</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Bet Won Summary
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Won bets and payout stats.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-3">
      <Card><p className="text-sm text-muted">Total Bets Won Today</p><p className="text-3xl font-black text-green-400">3,847</p></Card>
      <Card><p className="text-sm text-muted">Total Payout Today</p><p className="text-3xl font-black text-cyan-300">$124,500</p></Card>
      <Card><p className="text-sm text-muted">Largest Win Today</p><p className="text-3xl font-black text-amber-300">$12,000</p></Card>
      <Card className="lg:col-span-3"><CardHeader><CardTitle>Recent Won Bets</CardTitle></CardHeader><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-3 font-bold">Player</th><th className="pb-3 font-bold">Game</th><th className="pb-3 font-bold">Bet</th><th className="pb-3 font-bold">Win</th><th className="pb-3 font-bold">Multiplier</th><th className="pb-3 font-bold">Time</th></tr></thead><tbody>{[{p:"john***",g:"Mega Moolah",b:20,w:12000,m:"600x"},{p:"alice***",g:"Starburst",b:5,w:85,m:"17x"},{p:"bob***",g:"Book of Dead",b:10,w:250,m:"25x"}].map((r,i)=>(<tr key={i} className="border-b border-border/50"><td className="py-3">{r.p}</td><td className="py-3">{r.g}</td><td className="py-3">{"$"}{r.b}</td><td className="py-3 font-bold text-green-400">{"$"}{r.w.toLocaleString()}</td><td className="py-3"><Badge tone="amber">{r.m}</Badge></td><td className="py-3 text-muted">{["2m ago","10m ago","15m ago"][i]}</td></tr>))}</tbody></table></Card>
      </div>
    </div>
  );
}
