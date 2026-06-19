'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function FnBonusListIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Bonus</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Bonus List
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          View all configured bonus offers in the system.
        </p>
      </header>
      <div className="space-y-4">
      <Card><CardHeader><CardTitle>All Bonuses</CardTitle><div className="flex gap-2"><Button>+ Add Bonus</Button></div></CardHeader></Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[
        {name:"Welcome Bonus",type:"Deposit Match",value:"100% up to $1,000",active:true,claimed:452},
        {name:"Wednesday Reload",type:"Reload",value:"50% up to $500",active:true,claimed:128},
        {name:"Weekend Spins",type:"Free Spins",value:"50 Spins on Slots",active:true,claimed:312},
        {name:"High Roller",type:"Deposit Match",value:"200% up to $5,000",active:true,claimed:23},
        {name:"Cashback Week",type:"Cashback",value:"10% Cashback",active:false,claimed:0},
        {name:"Referral Bonus",type:"Free Chip",value:"$50 per Referral",active:true,claimed:87},
      ].map((b,i)=>(<Card key={i}><CardHeader><CardTitle className="text-base">{b.name}</CardTitle><Badge tone={b.active?"green":"slate"}>{b.active?"Active":"Inactive"}</Badge></CardHeader><CardDescription>{b.type} &middot; {b.value}</CardDescription><p className="mt-2 text-xs text-muted">{b.claimed} claims</p><div className="mt-3 flex gap-2"><Button variant="secondary">Edit</Button><Button variant="ghost">Stats</Button></div></Card>))}</div>
    </div>
    </div>
  );
}
