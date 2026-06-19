'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function GmGamesResetIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Game</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Game Reset
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Reset game state and counters.
        </p>
      </header>
      <div className="mx-auto max-w-2xl">
      <Card className="border-red-400/30"><CardHeader><CardTitle className="text-red-400">Reset Games</CardTitle><CardDescription>Reset game state data. Use with caution.</CardDescription></CardHeader><div className="space-y-4">
      <div><label className="mb-1 block text-sm font-bold text-foreground">Select Game</label><select className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400"><option>Starburst</option><option>Book of Dead</option><option>Blackjack Pro</option><option>All Games</option></select></div>
      <div className="space-y-2">{["Reset Jackpots","Reset Counters","Clear Cache","Reset RTP History"].map((opt,i)=>(<label key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card/60 px-4 py-3 cursor-pointer"><input type="checkbox" className="h-4 w-4 rounded border-border bg-card text-cyan-400" /><span className="text-sm font-medium">{opt}</span></label>))}</div>
      <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200"><strong>Warning:</strong> This action may affect active gameplay sessions.</div>
      <div className="flex gap-3 pt-2"><Button variant="danger">Execute Reset</Button><Button variant="secondary">Cancel</Button></div>
      </div></Card>
      </div>
    </div>
  );
}
