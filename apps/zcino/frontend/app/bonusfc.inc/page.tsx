'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function BonusfcIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Bonus</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Bonus Free Chips
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Claim and manage your free chip bonuses for casino games.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[
        { title: "Free Chip $10", game: "Slots", code: "CHIP10", expires: "Jun 14" },
        { title: "Free Chip $25", game: "Blackjack", code: "BJ25", expires: "Jun 20" },
        { title: "Free Chip $50", game: "Roulette", code: "RL50", expires: "Jun 30" },
        { title: "Free Chip $5", game: "Video Poker", code: "VP5", expires: "Jul 05" },
        { title: "Free Chip $100", game: "Live Casino", code: "LIVE100", expires: "Jul 10" },
        { title: "Free Chip $20", game: "All Games", code: "ALL20", expires: "Jul 15" },
      ].map((c, i) => (
        <Card key={i}>
          <CardHeader><CardTitle>{c.title}</CardTitle><Badge tone="cyan">Free</Badge></CardHeader>
          <CardDescription>Game: {c.game} &middot; Code: <code className="rounded bg-muted-surface px-1.5 py-0.5 font-mono text-cyan-300">{c.code}</code></CardDescription>
          <p className="mt-2 text-xs text-muted">Expires: {c.expires}</p>
          <div className="mt-4"><Button variant="secondary">Claim Free Chip</Button></div>
        </Card>
      ))}
    </div>
    </div>
  );
}
