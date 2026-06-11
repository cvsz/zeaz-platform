'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AccountIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">My</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          My Account
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Overview of your account, balances, and recent activity.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Account Overview</CardTitle><CardDescription>Your profile at a glance.</CardDescription></CardHeader>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card/60 p-4 text-center"><p className="text-3xl font-black text-cyan-300">$1,284</p><p className="mt-1 text-xs text-muted">Available Balance</p></div>
          <div className="rounded-xl border border-border bg-card/60 p-4 text-center"><p className="text-3xl font-black text-cyan-300">47</p><p className="mt-1 text-xs text-muted">Games Played</p></div>
          <div className="rounded-xl border border-border bg-card/60 p-4 text-center"><p className="text-3xl font-black text-amber-300">12</p><p className="mt-1 text-xs text-muted">Active Bonuses</p></div>
        </div>
        <div className="mt-6"><h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Recent Transactions</h3><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-2 font-bold">Date</th><th className="pb-2 font-bold">Type</th><th className="pb-2 font-bold">Amount</th><th className="pb-2 font-bold">Status</th></tr></thead><tbody><tr className="border-b border-border/50"><td className="py-2">Jun 10</td><td>Deposit</td><td className="text-green-400">+$100.00</td><td><Badge tone="green">Completed</Badge></td></tr><tr className="border-b border-border/50"><td className="py-2">Jun 09</td><td>Withdrawal</td><td className="text-red-400">-$50.00</td><td><Badge tone="amber">Pending</Badge></td></tr><tr className="border-b border-border/50"><td className="py-2">Jun 08</td><td>Bet</td><td className="text-red-400">-$25.00</td><td><Badge tone="slate">Settled</Badge></td></tr></tbody></table></div>
      </Card>
      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle><CardDescription>Common account tasks.</CardDescription></CardHeader>
        <div className="flex flex-col gap-2"><Button variant="secondary" className="w-full justify-start">Deposit Funds</Button><Button variant="secondary" className="w-full justify-start">Withdraw Funds</Button><Button variant="secondary" className="w-full justify-start">View Transactions</Button><Button variant="secondary" className="w-full justify-start">Edit Profile</Button><Button variant="secondary" className="w-full justify-start">Refer a Friend</Button></div>
      </Card>
    </div>
    </div>
  );
}
