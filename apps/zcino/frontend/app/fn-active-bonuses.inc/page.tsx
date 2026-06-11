'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function FnActiveBonusesIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Active</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Active Bonuses Report
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Financial overview of all currently active bonuses across the platform.
        </p>
      </header>
      <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3"><Card><p className="text-sm text-muted">Total Active Bonuses</p><p className="text-3xl font-black text-cyan-300">847</p></Card><Card><p className="text-sm text-muted">Total Bonus Value</p><p className="text-3xl font-black text-cyan-300">$124,500</p></Card><Card><p className="text-sm text-muted">Avg Wagering Progress</p><p className="text-3xl font-black text-amber-300">62%</p></Card></div>
      <Card><CardHeader><CardTitle>Active Bonuses List</CardTitle></CardHeader><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-3 font-bold">Player</th><th className="pb-3 font-bold">Bonus Type</th><th className="pb-3 font-bold">Amount</th><th className="pb-3 font-bold">Wagering</th><th className="pb-3 font-bold">Progress</th></tr></thead><tbody>{[{player:"john***",type:"Welcome",amount:"$100",req:"$1,000",prog:45},{player:"alice***",type:"Reload",amount:"$50",req:"$500",prog:78},{player:"bob***",type:"Cashback",amount:"$25",req:"$250",prog:100},{player:"eve***",type:"Free Spins",amount:"$20",req:"$400",prog:30}].map((b,i)=>(<tr key={i} className="border-b border-border/50"><td className="py-3">{b.player}</td><td className="py-3">{b.type}</td><td className="py-3">{b.amount}</td><td className="py-3">{b.req}</td><td className="py-3"><div className="flex items-center gap-2"><div className="h-2 flex-1 overflow-hidden rounded-full bg-muted-surface"><div className="h-full rounded-full bg-cyan-400" style={{width:b.prog+"%"}}></div></div><span className="text-xs text-muted">{b.prog}%</span></div></td></tr>))}</tbody></table></Card>
    </div>
    </div>
  );
}
