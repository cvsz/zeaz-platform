'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CasLiveIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Live</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Live Casino
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Manage live dealer casino tables, streams, and dealer assignments.
        </p>
      </header>
      <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Live Tables</CardTitle><CardDescription>Active and available live dealer tables.</CardDescription></CardHeader>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["Roulette #1", "Roulette #2", "Blackjack #1", "Blackjack #2", "Baccarat #1", "Dragon Tiger"].map((table, i) => (<div key={i} className="rounded-xl border border-border bg-card/60 p-4"><div className="flex items-center justify-between"><span className="font-bold">{table}</span><Badge tone="green">Live</Badge></div><p className="mt-2 text-xs text-muted">Dealer: Dealer #{i + 1} &middot; Players: 7</p></div>))}
        </div>
      </Card>
    </div>
    </div>
  );
}
