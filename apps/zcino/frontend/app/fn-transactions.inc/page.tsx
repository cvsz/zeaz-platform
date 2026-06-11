'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function FnTransactionsIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">All</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          All Transactions
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Complete transaction log across deposits, withdrawals, and transfers.
        </p>
      </header>
      <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4"><Card><p className="text-sm text-muted">Total Volume</p><p className="text-2xl font-black text-cyan-300">$1.2M</p></Card><Card><p className="text-sm text-muted">Deposits</p><p className="text-2xl font-black text-green-300">$892K</p></Card><Card><p className="text-sm text-muted">Withdrawals</p><p className="text-2xl font-black text-red-300">$308K</p></Card><Card><p className="text-sm text-muted">Transactions</p><p className="text-2xl font-black text-cyan-300">12,847</p></Card></div>
      <Card><CardHeader><CardTitle>Transaction Log</CardTitle><div className="flex gap-2"><select className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400"><option>All Types</option><option>Deposit</option><option>Withdrawal</option><option>Transfer</option></select></div></CardHeader><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-3 font-bold">ID</th><th className="pb-3 font-bold">Date</th><th className="pb-3 font-bold">Player</th><th className="pb-3 font-bold">Type</th><th className="pb-3 font-bold">Amount</th><th className="pb-3 font-bold">Status</th></tr></thead><tbody>{[{id:"#2847",date:"Jun 11",player:"john***",type:"Deposit",amount:"+$200",status:"Completed"},{id:"#2846",date:"Jun 11",player:"alice***",type:"Withdrawal",amount:"-$500",status:"Pending"},{id:"#2845",date:"Jun 10",player:"bob***",type:"Transfer",amount:"$0",status:"Completed"},{id:"#2844",date:"Jun 10",player:"eve***",type:"Deposit",amount:"+$1,000",status:"Completed"}].map((t,i)=>(<tr key={i} className="border-b border-border/50"><td className="py-3 text-muted">{t.id}</td><td className="py-3 text-muted">{t.date}</td><td className="py-3">{t.player}</td><td className="py-3">{t.type}</td><td className={cn("py-3 font-bold", t.amount.startsWith("+") ? "text-green-400" : t.amount.startsWith("-") ? "text-red-400" : "")}>{t.amount}</td><td className="py-3"><Badge tone={t.status==="Completed"?"green":"amber"}>{t.status}</Badge></td></tr>))}</tbody></table></Card>
    </div>
    </div>
  );
}
