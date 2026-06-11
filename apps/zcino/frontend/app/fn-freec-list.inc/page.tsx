'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function FnFreecListIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Free</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Free Chips Report
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Overview of all free chips promotions and usage.
        </p>
      </header>
      <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3"><Card><p className="text-sm text-muted">Active Promotions</p><p className="text-3xl font-black text-cyan-300">5</p></Card><Card><p className="text-sm text-muted">Total Issued</p><p className="text-3xl font-black text-cyan-300">$12,400</p></Card><Card><p className="text-sm text-muted">Redemption Rate</p><p className="text-3xl font-black text-green-300">78%</p></Card></div>
      <Card><CardHeader><CardTitle>Free Chip Promotions</CardTitle></CardHeader><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-3 font-bold">Name</th><th className="pb-3 font-bold">Value</th><th className="pb-3 font-bold">Issued</th><th className="pb-3 font-bold">Redeemed</th><th className="pb-3 font-bold">Status</th></tr></thead><tbody>{[{name:"Welcome Chip",value:"$10",issued:452,redeemed:389},{name:"Weekend Chip",value:"$25",issued:215,redeemed:178},{name:"VIP Chip",value:"$50",issued:89,redeemed:72},{name:"Referral Chip",value:"$5",issued:312,redeemed:298}].map((c,i)=>(<tr key={i} className="border-b border-border/50"><td className="py-3 font-medium">{c.name}</td><td className="py-3">{c.value}</td><td className="py-3 text-muted">{c.issued}</td><td className="py-3 text-muted">{c.redeemed}</td><td className="py-3"><Badge tone="green">Active</Badge></td></tr>))}</tbody></table></Card>
    </div>
    </div>
  );
}
