'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function GameplaysMreIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">MRE</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          MRE Game Plays
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Multi-Round Arena enter sessions.
        </p>
      </header>
      <div className="space-y-4">
      <Card><CardHeader><CardTitle>MRE Enter Sessions</CardTitle><CardDescription>Manual entry Multi-Round Arena game plays.</CardDescription></CardHeader></Card>
      <Card><CardHeader><CardTitle>Session History</CardTitle></CardHeader><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-3 font-bold">Session</th><th className="pb-3 font-bold">Player</th><th className="pb-3 font-bold">Game</th><th className="pb-3 font-bold">Entry Fee</th><th className="pb-3 font-bold">Payout</th><th className="pb-3 font-bold">Status</th></tr></thead><tbody>{[{s:"#MRE-001",p:"john***",g:"MRA Blackjack",f:10,pay:25,st:"Paid"},{s:"#MRE-002",p:"alice***",g:"MRA Roulette",f:25,pay:0,st:"Lost"},{s:"#MRE-003",p:"bob***",g:"MRA Slots",f:5,pay:50,st:"Paid"}].map((s,i)=>(<tr key={i} className="border-b border-border/50"><td className="py-3 font-mono text-xs">{s.s}</td><td className="py-3">{s.p}</td><td className="py-3">{s.g}</td><td className="py-3">{"$"}{s.f}</td><td className="py-3">{"$"}{s.pay}</td><td className="py-3"><Badge tone={s.st==="Paid"?"green":"red"}>{s.st}</Badge></td></tr>))}</tbody></table></Card>
      </div>
    </div>
  );
}
