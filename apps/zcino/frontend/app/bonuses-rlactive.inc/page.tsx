'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function BonusesRlactiveIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Active</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Active Bonuses
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          View and manage your currently active bonuses and promotions.
        </p>
      </header>
      <div className="space-y-4">
      {[
        { title: "Weekly Reload Bonus", amount: "$50.00", wagering: "$500", progress: 60, expires: "Jun 15, 2026" },
        { title: "Cashback Special", amount: "$25.00", wagering: "$0", progress: 100, expires: "Jun 12, 2026" },
        { title: "Free Spins Pack", amount: "50 Spins", wagering: "$200", progress: 30, expires: "Jun 18, 2026" },
      ].map((b, i) => (
        <Card key={i}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle>{b.title}</CardTitle><CardDescription>Bonus: {b.amount} &middot; Wagering: {b.wagering} &middot; Expires: {b.expires}</CardDescription></div>
            <Badge tone={b.progress >= 100 ? "green" : "amber"}>{b.progress >= 100 ? "Completed" : "In Progress"}</Badge>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted-surface"><div className="h-full rounded-full bg-cyan-400 transition-all" style={{width: b.progress + "%"}}></div></div>
          <p className="mt-2 text-xs text-muted">{b.progress}% wagering requirement met</p>
        </Card>
      ))}
    </div>
    </div>
  );
}
