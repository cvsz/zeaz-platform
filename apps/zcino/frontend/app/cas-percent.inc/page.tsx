'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CasPercentIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Percentage</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Percentage Settings
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Configure house edge percentages, commission rates, and revenue shares.
        </p>
      </header>
      <div className="max-w-2xl space-y-4">
      <Card><CardHeader><CardTitle>House Edge</CardTitle><CardDescription>Configure default house edge percentages per game category.</CardDescription></CardHeader><div className="space-y-3">{["Slots", "Blackjack", "Roulette", "Baccarat", "Video Poker"].map((game, i) => (<div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-3"><span className="font-bold">{game}</span><div className="flex items-center gap-2"><input className="w-20 rounded-lg border border-border bg-card px-3 py-1.5 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400" type="number" defaultValue={[4, 0.5, 2.7, 1.06, 0.5][i]} step="0.01" /><span className="text-muted">%</span></div></div>))}</div></Card>
      <Card><CardHeader><CardTitle>Revenue Share</CardTitle><CardDescription>Agent and affiliate revenue share percentages.</CardDescription></CardHeader><div className="space-y-3"><div className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-3"><span className="font-bold">Agent Commission</span><div className="flex items-center gap-2"><input className="w-20 rounded-lg border border-border bg-card px-3 py-1.5 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400" type="number" defaultValue="30" /><span className="text-muted">%</span></div></div><div className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-3"><span className="font-bold">Affiliate Payout</span><div className="flex items-center gap-2"><input className="w-20 rounded-lg border border-border bg-card px-3 py-1.5 text-right text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400" type="number" defaultValue="40" /><span className="text-muted">%</span></div></div></div><div className="pt-2"><Button>Save Percentages</Button></div></Card>
    </div>
    </div>
  );
}
