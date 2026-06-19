'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function EarningsOwnerIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Owner</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Owner Earnings
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Owner profit distribution.
        </p>
      </header>
      <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3"><Card><p className="text-sm text-muted">Owner Profit Share</p><p className="text-3xl font-black text-cyan-300">$187,650</p></Card><Card><p className="text-sm text-muted">Platform Value</p><p className="text-3xl font-black text-green-300">$4.2M</p></Card><Card><p className="text-sm text-muted">Monthly Growth</p><p className="text-3xl font-black text-amber-300">+12.4%</p></Card></div>
      <Card><CardHeader><CardTitle>Profit Distribution</CardTitle></CardHeader><div className="space-y-3">{["Platform Revenue","Agent Commissions","Operating Expenses","Marketing Budget","Tech & Infrastructure","Reserve Fund"].map((item,i)=>(<div key={i} className="flex justify-between border-b border-border pb-2"><span className="text-muted">{item}</span><span className={cn("font-bold", i>0?"text-red-400":"text-green-400")}>{["$482,500","-$95,400","-$74,350","-$48,200","-$36,900","-$40,000"][i]}</span></div>))}</div></Card>
      </div>
    </div>
  );
}
