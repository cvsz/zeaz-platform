"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, Network, Shield, Cpu, Cloud, GitMerge, FileText } from "lucide-react";

export default function Reports() {
  return (
    <div className="p-8 space-y-8 pb-20 min-h-screen bg-black text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            SYSTEM ARCHITECTURE REPORT
          </h1>
          <p className="text-muted-foreground font-mono mt-1">REPORT_GENERATED: CURRENT | PLATFORM: zeaz.dev</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Identity & Access</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-slate-100">Cloudflare Access</div>
            <p className="text-xs text-slate-400 mt-1">Zero Trust + SAML/OIDC</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Network Edge</CardTitle>
            <Cloud className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-slate-100">Cloudflare Tunnel</div>
            <p className="text-xs text-slate-400 mt-1">Secure Origin Connectivity</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Infrastructure</CardTitle>
            <GitMerge className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-slate-100">Terraform / OpenTofu</div>
            <p className="text-xs text-slate-400 mt-1">Declarative Provisioning</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Monorepo</CardTitle>
            <Server className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-slate-100">zeaz-platform</div>
            <p className="text-xs text-slate-400 mt-1">Ubuntu / Docker / Systemd</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Network className="w-5 h-5 text-primary" />
              Routing & Subdomains
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-black/50 p-4 rounded-lg font-mono text-sm border border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-300">www.zeaz.dev</span>
                <span className="text-slate-500">public landing</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-300">zeaz.dev</span>
                <span className="text-slate-500">redirect</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-primary">zdash.zeaz.dev</span>
                <span className="text-slate-500">zDash frontend</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-primary">api-zdash.zeaz.dev</span>
                <span className="text-slate-500">zDash API</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-300">ssh.zeaz.dev</span>
                <span className="text-slate-500">Access SSH</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-300">app.zeaz.dev</span>
                <span className="text-slate-500">zWallet</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-300">zveo.zeaz.dev</span>
                <span className="text-slate-500">AI platform</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-300">zcino.zeaz.dev</span>
                <span className="text-slate-500">zCino Casino App</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Cpu className="w-5 h-5 text-primary" />
              Platform Sub-Apps
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {[
                 { name: "web", desc: "Main landing and portal frontend (Next.js)" },
                 { name: "zdash", desc: "Integrated monorepo subtree for zDash application" },
                 { name: "zveo", desc: "AI platform application" },
                 { name: "zcino", desc: "zCino Casino application" },
                 { name: "zwallet", desc: "Wallet and transaction core" },
                 { name: "zoffice", desc: "Office tools and presence gateway" },
                 { name: "zAcademy", desc: "Learning management system" },
                 { name: "ztrader", desc: "Trading dashboard and analysis" }
               ].map(app => (
                 <div key={app.name} className="flex flex-col gap-1">
                   <div className="text-slate-200 font-semibold font-mono text-sm">apps/{app.name}</div>
                   <div className="text-slate-500 text-xs">{app.desc}</div>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 bg-primary/10 border border-primary/20 p-6 rounded-xl flex items-start gap-4">
        <Activity className="w-8 h-8 text-primary shrink-0 animate-pulse" />
        <div>
          <h3 className="text-lg font-bold text-white mb-2">Cost & Security Guardrails</h3>
          <p className="text-sm text-slate-300 mb-2">
            The platform is running under strict FREE NO COST mode constraints. 
          </p>
          <ul className="text-xs text-slate-400 space-y-1 font-mono">
            <li>✓ COST_LOCK=true</li>
            <li>✓ CLOUDFLARE_PLAN_TIER=Free</li>
            <li>✓ TERRAFORM_BACKEND_TYPE=local</li>
            <li>✓ No Load Balancing / Argo / Paid WAF / Logpush</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
