'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function FnDepositsIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Deposit</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Deposit Reports
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          View and analyze all player deposit transactions.
        </p>
      </header>
      <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4"><Card><p className="text-sm text-muted">Today</p><p className="text-2xl font-black text-cyan-300">$28,450</p></Card><Card><p className="text-sm text-muted">This Week</p><p className="text-2xl font-black text-cyan-300">$142,800</p></Card><Card><p className="text-sm text-muted">This Month</p><p className="text-2xl font-black text-cyan-300">$589,200</p></Card><Card><p className="text-sm text-muted">Avg Deposit</p><p className="text-2xl font-black text-green-300">$124.50</p></Card></div>
      <Card><CardHeader><CardTitle>Deposit Transactions</CardTitle><div className="flex gap-2"><input className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Search..." /></div></CardHeader><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-3 font-bold">Date</th><th className="pb-3 font-bold">Player</th><th className="pb-3 font-bold">Method</th><th className="pb-3 font-bold">Amount</th><th className="pb-3 font-bold">Status</th></tr></thead><tbody>{[{date:"Jun 11",player:"john***",method:"Visa",amount:"$200",status:"Completed"},{date:"Jun 11",player:"alice***",method:"BTC",amount:"$1,000",status:"Completed"},{date:"Jun 10",player:"bob***",method:"ETH",amount:"$500",status:"Pending"},{date:"Jun 10",player:"eve***",method:"Bank",amount:"$2,500",status:"Completed"}].map((d,i)=>(<tr key={i} className="border-b border-border/50"><td className="py-3 text-muted">{d.date}</td><td className="py-3 font-medium">{d.player}</td><td className="py-3 text-muted">{d.method}</td><td className="py-3 font-bold">{d.amount}</td><td className="py-3"><Badge tone={d.status==="Completed"?"green":"amber"}>{d.status}</Badge></td></tr>))}</tbody></table></Card>
    </div>
    </div>
  );
}
