'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function EarningsIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Earnings</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Earnings Report
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Platform revenue and earnings.
        </p>
      </header>
      <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Card><p className="text-sm text-muted">Gross Revenue</p><p className="text-2xl font-black text-cyan-300">$482,500</p></Card><Card><p className="text-sm text-muted">Net Revenue</p><p className="text-2xl font-black text-green-300">$312,750</p></Card><Card><p className="text-sm text-muted">Commissions Paid</p><p className="text-2xl font-black text-amber-300">$95,400</p></Card><Card><p className="text-sm text-muted">Operating Costs</p><p className="text-2xl font-black text-red-300">$74,350</p></Card></div>
      <Card><CardHeader><CardTitle>Revenue Breakdown</CardTitle></CardHeader><div className="space-y-3">{["Slots","Table Games","Live Casino","Jackpots","Other"].map((s,i)=>(<div key={i} className="flex items-center gap-4"><div className="w-32 text-sm font-medium">{s}</div><div className="h-4 flex-1 overflow-hidden rounded-full bg-muted-surface"><div className="h-full rounded-full bg-cyan-400" style={{width:[59,20.4,12.9,5.2,2.5][i]+"%"}}></div></div><div className="w-24 text-right text-sm font-bold text-foreground">{"$"}{["285K","98.5K","62K","25K","12K"][i]}</div><div className="w-12 text-right text-xs text-muted">{[59,20.4,12.9,5.2,2.5][i]}%</div></div>))}</div></Card>
      </div>
    </div>
  );
}
