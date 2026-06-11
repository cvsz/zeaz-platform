'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function FnPrepaidListIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Prepaid</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Prepaid Cards
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          View and manage all prepaid cards issued on the platform.
        </p>
      </header>
      <div className="space-y-4">
      <Card><CardHeader><CardTitle>Prepaid Cards</CardTitle><div className="flex gap-2"><Button>+ Issue Card</Button></div></CardHeader><div className="flex gap-2"><input className="flex-1 rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Search by code or player..." /></div></Card>
      <Card><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-3 font-bold">Code</th><th className="pb-3 font-bold">Player</th><th className="pb-3 font-bold">Value</th><th className="pb-3 font-bold">Issued</th><th className="pb-3 font-bold">Status</th></tr></thead><tbody>{[{code:"ZCARD-A001-XX",player:"john***",value:"$50",issued:"Jun 01"},{code:"ZCARD-B002-YY",player:"alice***",value:"$100",issued:"May 28"},{code:"ZCARD-C003-ZZ",player:"bob***",value:"$25",issued:"May 25"},{code:"ZCARD-D004-WW",player:"eve***",value:"$200",issued:"May 20"}].map((c,i)=>(<tr key={i} className="border-b border-border/50"><td className="py-3 font-mono text-sm">{c.code}</td><td className="py-3">{c.player}</td><td className="py-3 font-bold">{c.value}</td><td className="py-3 text-muted">{c.issued}</td><td className="py-3"><Badge tone={(["green","green","amber","red"] as const)[i]}>{["Active","Redeemed","Expired","Disabled"][i]}</Badge></td></tr>))}</tbody></table></Card>
    </div>
    </div>
  );
}
