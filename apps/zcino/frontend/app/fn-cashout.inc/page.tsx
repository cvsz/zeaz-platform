'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function FnCashoutIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Cashout</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Cashout Management
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Review and process pending player cashout requests.
        </p>
      </header>
      <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3"><Card><p className="text-sm text-muted">Pending Cashouts</p><p className="text-3xl font-black text-amber-300">23</p></Card><Card><p className="text-sm text-muted">Total Amount Pending</p><p className="text-3xl font-black text-cyan-300">$47,250</p></Card><Card><p className="text-sm text-muted">Avg Processing Time</p><p className="text-3xl font-black text-green-300">~2.4 hrs</p></Card></div>
      <Card><CardHeader><CardTitle>Cashout Requests</CardTitle></CardHeader><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-3 font-bold">Player</th><th className="pb-3 font-bold">Amount</th><th className="pb-3 font-bold">Method</th><th className="pb-3 font-bold">Requested</th><th className="pb-3 font-bold">Status</th><th className="pb-3 font-bold"></th></tr></thead><tbody>{[{player:"john***",amount:"$500",method:"Bank Transfer",time:"2h ago"},{player:"alice***",amount:"$1,200",method:"Crypto",time:"4h ago"},{player:"bob***",amount:"$250",method:"E-Wallet",time:"6h ago"}].map((c,i)=>(<tr key={i} className="border-b border-border/50"><td className="py-3">{c.player}</td><td className="py-3 font-bold">{c.amount}</td><td className="py-3 text-muted">{c.method}</td><td className="py-3 text-muted">{c.time}</td><td className="py-3"><Badge tone="amber">Pending</Badge></td><td className="py-3"><div className="flex gap-1"><Button variant="ghost">Approve</Button><Button variant="ghost">Hold</Button></div></td></tr>))}</tbody></table></Card>
    </div>
    </div>
  );
}
