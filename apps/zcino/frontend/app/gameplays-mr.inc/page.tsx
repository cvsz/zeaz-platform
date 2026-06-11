'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function GameplaysMrIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">MR</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          MR Game Plays
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Multi-Round game sessions.
        </p>
      </header>
      <div className="space-y-4">
      <Card><CardHeader><CardTitle>Multi-Round Sessions</CardTitle><CardDescription>All multi-round game play activity.</CardDescription></CardHeader></Card>
      <Card><CardHeader><CardTitle>Session History</CardTitle></CardHeader><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-3 font-bold">Player</th><th className="pb-3 font-bold">Game</th><th className="pb-3 font-bold">Rounds</th><th className="pb-3 font-bold">Total Bet</th><th className="pb-3 font-bold">Result</th></tr></thead><tbody>{[{p:"john***",g:"Multi-Round BJ",r:15,b:150,res:"+$45"},{p:"alice***",g:"Multi-Round RL",r:10,b:100,res:"-$50"},{p:"bob***",g:"Multi-Round SL",r:25,b:250,res:"+$120"}].map((s,i)=>(<tr key={i} className="border-b border-border/50"><td className="py-3">{s.p}</td><td className="py-3">{s.g}</td><td className="py-3">{s.r}</td><td className="py-3">{"$"}{s.b}</td><td className={cn("py-3 font-bold",s.res.startsWith("+")?"text-green-400":"text-red-400")}>{s.res}</td></tr>))}</tbody></table></Card>
      </div>
    </div>
  );
}
