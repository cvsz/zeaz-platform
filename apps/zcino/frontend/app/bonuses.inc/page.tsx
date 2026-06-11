'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function BonusesIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Bonuses</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Bonuses
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Explore available bonuses, promotions, and special offers.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[
        { title: "Welcome Bonus", desc: "100% match up to $1,000 on your first deposit.", badge: "New" },
        { title: "Weekly Reload", desc: "50% match bonus every Wednesday.", badge: "Active" },
        { title: "Cashback Special", desc: "10% cashback on all net losses this week.", badge: "Active" },
        { title: "High Roller", desc: "Deposit $5,000+ and get 200% bonus.", badge: "VIP" },
        { title: "Weekend Free Spins", desc: "50 free spins on selected slots every weekend.", badge: "New" },
        { title: "Referral Bonus", desc: "Earn $50 for every friend you refer.", badge: "Active" },
      ].map((b, i) => (
        <Card key={i}>
          <CardHeader><CardTitle>{b.title}</CardTitle><Badge tone="cyan">{b.badge}</Badge></CardHeader>
          <CardDescription>{b.desc}</CardDescription>
          <div className="mt-4"><Button variant="secondary">Claim Bonus</Button></div>
        </Card>
      ))}
    </div>
    </div>
  );
}
