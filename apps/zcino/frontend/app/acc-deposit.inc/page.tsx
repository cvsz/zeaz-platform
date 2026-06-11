'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AccDepositIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Deposit</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Deposit Funds
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Add funds to your account using your preferred payment method.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
      <Card>
        <CardHeader><CardTitle>Deposit Form</CardTitle><CardDescription>Choose an amount and payment method.</CardDescription></CardHeader>
        <div className="space-y-4">
          <div><label className="mb-1 block text-sm font-bold text-foreground">Deposit Amount</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted">$</span><input className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-lg font-bold text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" type="number" placeholder="0.00" /></div></div>
          <div className="grid grid-cols-3 gap-2"><button className="rounded-xl border border-border bg-card/60 px-4 py-3 text-sm font-bold text-foreground transition hover:bg-card hover:border-cyan-400/50">$50</button><button className="rounded-xl border border-border bg-card/60 px-4 py-3 text-sm font-bold text-foreground transition hover:bg-card hover:border-cyan-400/50">$100</button><button className="rounded-xl border border-border bg-card/60 px-4 py-3 text-sm font-bold text-foreground transition hover:bg-card hover:border-cyan-400/50">$250</button><button className="rounded-xl border border-border bg-card/60 px-4 py-3 text-sm font-bold text-foreground transition hover:bg-card hover:border-cyan-400/50">$500</button><button className="rounded-xl border border-border bg-card/60 px-4 py-3 text-sm font-bold text-foreground transition hover:bg-card hover:border-cyan-400/50">$1,000</button><button className="rounded-xl border border-border bg-card/60 px-4 py-3 text-sm font-bold text-foreground transition hover:bg-card hover:border-cyan-400/50">Custom</button></div>
          <div><label className="mb-1 block text-sm font-bold text-foreground">Payment Method</label><select className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400"><option>Credit / Debit Card</option><option>Bank Transfer</option><option>Cryptocurrency</option><option>E-Wallet</option></select></div>
          <div className="flex gap-3 pt-2"><Button>Deposit Now</Button></div>
        </div>
      </Card>
      <Card>
        <CardHeader><CardTitle>Current Balance</CardTitle><CardDescription>Your available funds.</CardDescription></CardHeader>
        <div className="text-center py-6"><p className="text-5xl font-black text-cyan-300">$1,284.50</p><p className="mt-2 text-sm text-muted">Available for play</p></div>
        <hr className="border-border my-4" />
        <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted">Pending Deposits</span><span className="font-bold">$0.00</span></div><div className="flex justify-between"><span className="text-muted">Bonus Balance</span><span className="font-bold">$50.00</span></div></div>
      </Card>
    </div>
    </div>
  );
}
