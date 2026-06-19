'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AccWithdrawIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Withdraw</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Withdraw Funds
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Withdraw funds from your account to your preferred payment method.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
      <Card>
        <CardHeader><CardTitle>Withdrawal Form</CardTitle><CardDescription>Choose amount and withdrawal method.</CardDescription></CardHeader>
        <div className="space-y-4">
          <div><label className="mb-1 block text-sm font-bold text-foreground">Withdrawal Amount</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted">$</span><input className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-lg font-bold text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" type="number" placeholder="0.00" /></div></div>
          <div><label className="mb-1 block text-sm font-bold text-foreground">Withdrawal Method</label><select className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400"><option>Bank Transfer (1-3 days)</option><option>Cryptocurrency (Instant)</option><option>E-Wallet (Instant)</option></select></div>
          <div><label className="mb-1 block text-sm font-bold text-foreground">Wallet Address / Details</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Enter your wallet address or account details" /></div>
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200"><strong>Note:</strong> Minimum withdrawal is $20. Maximum daily withdrawal is $5,000.</div>
          <div className="flex gap-3 pt-2"><Button>Submit Withdrawal</Button></div>
        </div>
      </Card>
      <Card>
        <CardHeader><CardTitle>Withdrawal Info</CardTitle><CardDescription>Limits and status.</CardDescription></CardHeader>
        <dl className="space-y-3 text-sm"><div className="flex justify-between border-b border-border pb-2"><dt className="text-muted">Available Balance</dt><dd className="font-bold">$1,284.50</dd></div><div className="flex justify-between border-b border-border pb-2"><dt className="text-muted">Pending Withdrawals</dt><dd className="font-bold">$0.00</dd></div><div className="flex justify-between border-b border-border pb-2"><dt className="text-muted">Daily Limit Remaining</dt><dd className="font-bold">$5,000.00</dd></div></dl>
        <div className="mt-6"><h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Recent Withdrawals</h3><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-2 font-bold">Date</th><th className="pb-2 font-bold">Amount</th><th className="pb-2 font-bold">Status</th></tr></thead><tbody><tr className="border-b border-border/50"><td className="py-2">Jun 05</td><td>$200.00</td><td><Badge tone="green">Completed</Badge></td></tr><tr className="border-b border-border/50"><td className="py-2">May 28</td><td>$100.00</td><td><Badge tone="green">Completed</Badge></td></tr></tbody></table></div>
      </Card>
    </div>
    </div>
  );
}
