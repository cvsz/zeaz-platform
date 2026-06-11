'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function DoAccDepositIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Process</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Process Deposit
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Process a deposit for a player.
        </p>
      </header>
      <div className="mx-auto max-w-2xl">
      <Card><CardHeader><CardTitle>Process Deposit</CardTitle><CardDescription>Admin deposit processing.</CardDescription></CardHeader><div className="space-y-4">
      <div><label className="mb-1 block text-sm font-bold text-foreground">Player Username</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Enter player username" /></div>
      <div><label className="mb-1 block text-sm font-bold text-foreground">Deposit Amount</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" type="number" placeholder="0.00" /></div>
      <div><label className="mb-1 block text-sm font-bold text-foreground">Reference / Notes</label><textarea className="min-h-[80px] w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Transaction reference" /></div>
      <div className="flex gap-3 pt-2"><Button>Process Deposit</Button><Button variant="secondary">Cancel</Button></div>
      </div></Card>
      </div>
    </div>
  );
}
