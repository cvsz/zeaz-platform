'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function GamesfcIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Games</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Games Free Chips
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Free chip config per game.
        </p>
      </header>
      <div className="space-y-4">
      <Card><CardHeader><CardTitle>Game Free Chip Config</CardTitle><CardDescription>Free chip values per game.</CardDescription></CardHeader>
      <div className="space-y-3">{["Starburst","Book of Dead","Blackjack Pro","Mega Moolah","Sweet Bonanza"].map((g,i)=>(<div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-3"><div><span className="font-bold">{g}</span><p className="text-xs text-muted">Daily limit: {[500,300,200,150,400][i]} chips</p></div><div className="text-right"><p className="font-bold text-cyan-300">{"$"}{["0.10","0.20","0.50","0.25","0.15"][i]} / spin</p><p className="text-xs text-muted">Max: {"$"}{["5","10","25","10","5"][i]}</p></div></div>))}</div></Card>
      </div>
    </div>
  );
}
