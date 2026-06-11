'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function FinancesIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Finances</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Finances
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Platform financial dashboard.
        </p>
      </header>
      <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Card><p className="text-sm text-muted">Total Balance</p><p className="text-2xl font-black text-cyan-300">$2,847,500</p></Card><Card><p className="text-sm text-muted">Player Balances</p><p className="text-2xl font-black text-cyan-300">$1,284,000</p></Card><Card><p className="text-sm text-muted">House Account</p><p className="text-2xl font-black text-green-300">$1,563,500</p></Card><Card><p className="text-sm text-muted">Pending Payouts</p><p className="text-2xl font-black text-amber-300">$47,250</p></Card></div>
      <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle>Revenue (30d)</CardTitle></CardHeader><div className="space-y-2">{["Week 1","Week 2","Week 3","Week 4"].map((w,i)=>(<div key={i} className="flex items-center gap-3"><span className="w-16 text-sm text-muted">{w}</span><div className="h-3 flex-1 overflow-hidden rounded-full bg-muted-surface"><div className="h-full rounded-full bg-cyan-400" style={{width:[65,72,68,78][i]+"%"}}></div></div><span className="w-20 text-right text-sm font-bold text-foreground">{"$"}{[98,108,102,117][i]}K</span></div>))}</div></Card>
      <Card><CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader><div className="flex flex-col gap-2"><Button variant="secondary" className="w-full justify-start">View Deposits</Button><Button variant="secondary" className="w-full justify-start">View Withdrawals</Button><Button variant="secondary" className="w-full justify-start">Transaction Log</Button><Button variant="secondary" className="w-full justify-start">Earnings Report</Button></div></Card></div>
      </div>
    </div>
  );
}
