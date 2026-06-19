"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Key, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  RefreshCw, 
  Server, 
  Terminal, 
  TrendingUp, 
  Wallet, 
  Cloud, 
  LayoutDashboard, 
  Video, 
  Briefcase,
  Layers,
  AlertTriangle,
  Gamepad2,
  Gamepad,
  Cpu,
  MessageSquare
} from "lucide-react";

interface AppSecretStatus {
  appId: string;
  name: string;
  icon: any;
  secretCount: number;
  status: "SYNCHRONIZED" | "SEALED" | "WARNING";
  kmsProvider: string;
  lastRotated: string;
}

export default function Vault() {
  const [isUnsealing, setIsUnsealing] = useState(false);
  const [vaultStatus, setVaultStatus] = useState<"UNSEALED" | "SEALED">("UNSEALED");
  const [rotatingApp, setRotatingApp] = useState<string | null>(null);

  const appsSecrets: AppSecretStatus[] = [
    {
      appId: "api",
      name: "Core Platform API",
      icon: Terminal,
      secretCount: 18,
      status: "SYNCHRONIZED",
      kmsProvider: "Google Cloud KMS",
      lastRotated: "2026-06-12",
    },
    {
      appId: "openwork",
      name: "OpenWork Platform",
      icon: Briefcase,
      secretCount: 15,
      status: "SYNCHRONIZED",
      kmsProvider: "Google Cloud KMS",
      lastRotated: "2026-06-07",
    },
    {
      appId: "web",
      name: "Next.js Web Frontend",
      icon: Layers,
      secretCount: 6,
      status: "SYNCHRONIZED",
      kmsProvider: "Google Cloud KMS",
      lastRotated: "2026-06-14",
    },
    {
      appId: "zAcademy",
      name: "zAcademy Learning",
      icon: Server,
      secretCount: 22,
      status: "SYNCHRONIZED",
      kmsProvider: "HashiCorp Vault",
      lastRotated: "2026-06-10",
    },
    {
      appId: "zLinebot",
      name: "zLinebot Service",
      icon: MessageSquare,
      secretCount: 5,
      status: "WARNING",
      kmsProvider: "Env Variable",
      lastRotated: "2026-05-15",
    },
    {
      appId: "zcfdash",
      name: "zcfdash Cloudflare Panel",
      icon: Layers,
      secretCount: 8,
      status: "SYNCHRONIZED",
      kmsProvider: "Kubernetes Secret",
      lastRotated: "2026-06-13",
    },
    {
      appId: "zcino",
      name: "zCino Gaming Engine",
      icon: Gamepad2,
      secretCount: 19,
      status: "SYNCHRONIZED",
      kmsProvider: "SOPS / Age",
      lastRotated: "2026-06-09",
    },
    {
      appId: "zcino-modern",
      name: "zCino Modern Console",
      icon: Gamepad,
      secretCount: 11,
      status: "SYNCHRONIZED",
      kmsProvider: "SOPS / Age",
      lastRotated: "2026-06-11",
    },
    {
      appId: "zcloud",
      name: "zCloud Panel",
      icon: Cloud,
      secretCount: 16,
      status: "SYNCHRONIZED",
      kmsProvider: "Google Cloud KMS",
      lastRotated: "2026-06-11",
    },
    {
      appId: "zdash",
      name: "zDash Dashboard",
      icon: LayoutDashboard,
      secretCount: 14,
      status: "SYNCHRONIZED",
      kmsProvider: "Google Cloud KMS",
      lastRotated: "2026-06-05",
    },
    {
      appId: "zdev",
      name: "zDev Developer Cockpit",
      icon: Terminal,
      secretCount: 25,
      status: "SYNCHRONIZED",
      kmsProvider: "Google Cloud KMS",
      lastRotated: "2026-06-12",
    },
    {
      appId: "zlms",
      name: "zLMS Portal",
      icon: Server,
      secretCount: 28,
      status: "SYNCHRONIZED",
      kmsProvider: "HashiCorp Vault",
      lastRotated: "2026-06-08",
    },
    {
      appId: "zoffice",
      name: "zOffice Workspace",
      icon: Briefcase,
      secretCount: 10,
      status: "WARNING",
      kmsProvider: "Env Variable",
      lastRotated: "2026-05-20",
    },
    {
      appId: "zsp-aitool",
      name: "zsp-aitool SaaS Adapter",
      icon: Cpu,
      secretCount: 14,
      status: "SYNCHRONIZED",
      kmsProvider: "Google Cloud KMS",
      lastRotated: "2026-06-13",
    },
    {
      appId: "zsticker",
      name: "zSticker Daemon",
      icon: MessageSquare,
      secretCount: 4,
      status: "WARNING",
      kmsProvider: "Env Variable",
      lastRotated: "2026-05-18",
    },
    {
      appId: "ztrader",
      name: "zTrader Algo Trading",
      icon: TrendingUp,
      secretCount: 24,
      status: "SYNCHRONIZED",
      kmsProvider: "SOPS / Age",
      lastRotated: "2026-06-10",
    },
    {
      appId: "zveo",
      name: "zVeo Video Engine",
      icon: Video,
      secretCount: 20,
      status: "SYNCHRONIZED",
      kmsProvider: "Google Cloud KMS",
      lastRotated: "2026-06-08",
    },
    {
      appId: "zwallet",
      name: "zWallet Fintech API",
      icon: Wallet,
      secretCount: 32,
      status: "SYNCHRONIZED",
      kmsProvider: "HashiCorp Vault",
      lastRotated: "2026-06-14",
    },
    {
      appId: "auth",
      name: "Authentik Identity",
      icon: ShieldCheck,
      secretCount: 12,
      status: "SYNCHRONIZED",
      kmsProvider: "Postgres crypt",
      lastRotated: "2026-06-01",
    }
  ];

  const handleUnsealToggle = () => {
    setIsUnsealing(true);
    setTimeout(() => {
      setVaultStatus(prev => prev === "UNSEALED" ? "SEALED" : "UNSEALED");
      setIsUnsealing(false);
    }, 1200);
  };

  const handleRotateKey = (appId: string) => {
    setRotatingApp(appId);
    setTimeout(() => {
      setRotatingApp(null);
    }, 1500);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Header section with rich aesthetics */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-purple-500/20 shadow-xl shadow-purple-900/10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-indigo-200 flex items-center gap-2">
            <Key className="w-8 h-8 text-purple-400 animate-pulse" />
            SECRETS VAULT
          </h1>
          <p className="text-purple-300/60 font-mono text-sm mt-1 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${vaultStatus === "UNSEALED" ? "bg-emerald-500 animate-ping" : "bg-red-500"}`}></span>
            STATUS: <span className="font-bold text-white">{vaultStatus}</span> | KMS_ACTIVE: <span className="text-white">TRUE</span>
          </p>
        </div>
        
        <button
          onClick={handleUnsealToggle}
          disabled={isUnsealing}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-300 ${
            vaultStatus === "UNSEALED" 
              ? "bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-500/30" 
              : "bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/30"
          }`}
        >
          {isUnsealing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : vaultStatus === "UNSEALED" ? (
            <Lock className="w-4 h-4" />
          ) : (
            <Unlock className="w-4 h-4" />
          )}
          {isUnsealing ? "Processing..." : vaultStatus === "UNSEALED" ? "Seal Vault" : "Unseal Vault"}
        </button>
      </div>

      {/* Grid containing secret status for all apps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appsSecrets.map((app) => {
          const IconComponent = app.icon;
          return (
            <Card key={app.appId} className="border-slate-800 bg-slate-950/50 hover:bg-slate-900/50 transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-950/10 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-950/30 border border-purple-500/10 text-purple-400 group-hover:text-purple-300 transition-colors">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-semibold text-slate-100 group-hover:text-white transition-colors">{app.name}</CardTitle>
                </div>
                {app.status === "SYNCHRONIZED" ? (
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500 animate-bounce" />
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs text-slate-400 block">Active Secrets</span>
                    <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-100">{app.secretCount}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">KMS Engine</span>
                    <span className="text-xs font-mono font-bold bg-slate-900 px-2 py-1 rounded text-purple-300 border border-purple-950">{app.kmsProvider}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Last rotated: {app.lastRotated}</span>
                  <button 
                    onClick={() => handleRotateKey(app.appId)}
                    disabled={rotatingApp !== null}
                    className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${rotatingApp === app.appId ? "animate-spin" : ""}`} />
                    {rotatingApp === app.appId ? "Rotating..." : "Rotate"}
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

