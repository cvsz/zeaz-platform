'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function GmListIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Game</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Game List
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Browse and manage all games.
        </p>
      </header>
      <div className="space-y-4">
      <Card><CardHeader><CardTitle>All Games</CardTitle><div className="flex gap-2"><input className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Search games..." /><select className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400"><option>All Categories</option><option>Slots</option><option>Table</option><option>Live</option><option>Arcade</option></select></div></CardHeader></Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{["Starburst","Book of Dead","Blackjack Pro","European Roulette","Mega Moolah","Sweet Bonanza","Lightning Roulette","Baccarat Pro"].map((n,i)=>(<Card key={i}><CardHeader><CardTitle className="text-base">{n}</CardTitle><Badge tone="green">Active</Badge></CardHeader><CardDescription>{["NetEnt","Play'n GO","Evolution","Evolution","Microgaming","Pragmatic","Evolution","Evolution"][i]} &middot; {["Slots","Slots","Table","Table","Jackpot","Slots","Live","Table"][i]}</CardDescription><p className="mt-1 text-xs text-muted">RTP: {["96.1","96.2","99.5","97.3","88.1","96.5","97.0","98.9"][i]}%</p><div className="mt-3 flex gap-1"><Button variant="ghost">Edit</Button><Button variant="ghost">Configure</Button></div></Card>))}</div>
      </div>
    </div>
  );
}
