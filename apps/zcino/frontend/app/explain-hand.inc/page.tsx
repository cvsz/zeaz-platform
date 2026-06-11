'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ExplainHandIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Hand</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Hand Explanation
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Poker hand rankings and rules.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Hand Rankings</CardTitle><CardDescription>From highest to lowest.</CardDescription></CardHeader><ol className="space-y-2">{["Royal Flush","Straight Flush","Four of a Kind","Full House","Flush","Straight","Three of a Kind","Two Pair","One Pair","High Card"].map((hand,i)=>(<li key={i} className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-2"><span className="font-bold">{i+1}. {hand}</span><Badge tone={(["amber","amber","cyan","cyan","cyan","cyan","slate","slate","slate","slate"] as const)[i]}>{["Top","Elite","Strong","Solid","Decent","Average","OK","Weak","Poor","Last"][i]}</Badge></li>))}</ol></Card>
      <Card><CardHeader><CardTitle>Game Rules</CardTitle><CardDescription>Basic rules and terminology.</CardDescription></CardHeader><div className="space-y-4 text-sm">{["Blackjack","Roulette","Baccarat","Slots","Video Poker"].map((g,i)=>(<div key={i} className="rounded-xl border border-border bg-card/60 p-4"><h3 className="font-bold text-cyan-300">{g}</h3><p className="mt-1 text-muted">{["Beat the dealer's hand without exceeding 21.","Predict where the ball lands on the spinning wheel.","Bet on Player, Banker, or Tie. Closest to 9 wins.","Match symbols across paylines to win.","Make the best 5-card poker hand."][i]}</p></div>))}</div></Card>
      </div>
    </div>
  );
}
