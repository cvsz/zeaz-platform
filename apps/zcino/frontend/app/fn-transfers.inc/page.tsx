'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function FnTransfersIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Transfer</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Transfer History
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          View all fund transfer activity between accounts and agents.
        </p>
      </header>
      <div className="space-y-4">
      <Card><CardHeader><CardTitle>Transfer History</CardTitle><CardDescription>Record of all fund transfers between accounts.</CardDescription></CardHeader>
      <table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-3 font-bold">Date</th><th className="pb-3 font-bold">From</th><th className="pb-3 font-bold">To</th><th className="pb-3 font-bold">Amount</th><th className="pb-3 font-bold">Type</th><th className="pb-3 font-bold">Status</th></tr></thead><tbody>{[{date:"Jun 11",from:"Agent #12",to:"Player john***",amount:"$500",type:"Agent Transfer"},{date:"Jun 10",from:"Player alice***",to:"Player bob***",amount:"$100",type:"P2P"},{date:"Jun 09",from:"System",to:"Player eve***",amount:"$50",type:"Bonus"},{date:"Jun 08",from:"Agent #05",to:"Player charlie***",amount:"$1,000",type:"Agent Transfer"}].map((t,i)=>(<tr key={i} className="border-b border-border/50"><td className="py-3 text-muted">{t.date}</td><td className="py-3">{t.from}</td><td className="py-3">{t.to}</td><td className="py-3 font-bold">{t.amount}</td><td className="py-3 text-muted">{t.type}</td><td className="py-3"><Badge tone="green">Completed</Badge></td></tr>))}</tbody></table></Card>
    </div>
    </div>
  );
}
