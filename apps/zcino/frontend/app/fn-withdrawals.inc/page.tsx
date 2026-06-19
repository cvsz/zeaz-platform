'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function FnWithdrawalsIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Withdrawal</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Withdrawal Management
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Review, approve, or reject player withdrawal requests.
        </p>
      </header>
      <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3"><Card><p className="text-sm text-muted">Pending Requests</p><p className="text-3xl font-black text-amber-300">18</p></Card><Card><p className="text-sm text-muted">Processing Today</p><p className="text-3xl font-black text-cyan-300">$12,400</p></Card><Card><p className="text-sm text-muted">Approval Rate</p><p className="text-3xl font-black text-green-300">94%</p></Card></div>
      <Card><CardHeader><CardTitle>Withdrawal Requests</CardTitle><div className="flex gap-2"><select className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400"><option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option></select></div></CardHeader><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-3 font-bold">Player</th><th className="pb-3 font-bold">Amount</th><th className="pb-3 font-bold">Method</th><th className="pb-3 font-bold">Date</th><th className="pb-3 font-bold">Status</th><th className="pb-3 font-bold"></th></tr></thead><tbody>{[{player:"john***",amount:"$500",method:"Bank",date:"Jun 11"},{player:"alice***",amount:"$1,200",method:"BTC",date:"Jun 11"},{player:"bob***",amount:"$250",method:"ETH",date:"Jun 10"},{player:"eve***",amount:"$3,000",method:"Bank",date:"Jun 10"}].map((w,i)=>(<tr key={i} className="border-b border-border/50"><td className="py-3">{w.player}</td><td className="py-3 font-bold">{w.amount}</td><td className="py-3 text-muted">{w.method}</td><td className="py-3 text-muted">{w.date}</td><td className="py-3"><Badge tone="amber">Pending</Badge></td><td className="py-3"><div className="flex gap-1"><Button variant="ghost">Approve</Button><Button variant="ghost">Reject</Button></div></td></tr>))}</tbody></table></Card>
    </div>
    </div>
  );
}
