'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function GameplaysIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Game</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Game Plays
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          All game play sessions.
        </p>
      </header>
      <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4"><Card><p className="text-sm text-muted">Active Sessions</p><p className="text-2xl font-black text-cyan-300">847</p></Card><Card><p className="text-sm text-muted">Today's Plays</p><p className="text-2xl font-black text-green-300">12,450</p></Card><Card><p className="text-sm text-muted">Total Bets</p><p className="text-2xl font-black text-cyan-300">$284K</p></Card><Card><p className="text-sm text-muted">Avg Bet</p><p className="text-2xl font-black text-amber-300">$22.80</p></Card></div>
      <Card><CardHeader><CardTitle>Recent Game Plays</CardTitle><div className="flex gap-2"><select className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400"><option>All Games</option><option>Slots</option><option>Table</option><option>Live</option></select></div></CardHeader><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-3 font-bold">Player</th><th className="pb-3 font-bold">Game</th><th className="pb-3 font-bold">Bet</th><th className="pb-3 font-bold">Win</th><th className="pb-3 font-bold">Net</th><th className="pb-3 font-bold">Time</th></tr></thead><tbody>{[{p:"john***",g:"Starburst",b:5,w:12},{p:"alice***",g:"Blackjack Pro",b:25,w:0},{p:"bob***",g:"Mega Moolah",b:10,w:250},{p:"eve***",g:"Roulette",b:50,w:100}].map((r,i)=>(<tr key={i} className="border-b border-border/50"><td className="py-3">{r.p}</td><td className="py-3">{r.g}</td><td className="py-3">{"$"}{r.b}</td><td className="py-3">{"$"}{r.w}</td><td className={cn("py-3 font-bold",r.w>r.b?"text-green-400":"text-red-400")}>{r.w>r.b?"+"+("$"+(r.w-r.b)):"-"+"$"+(r.b-r.w)}</td><td className="py-3 text-muted">{["2m ago","5m ago","8m ago","12m ago"][i]}</td></tr>))}</tbody></table></Card>
      </div>
    </div>
  );
}
