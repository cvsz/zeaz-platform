"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, Users, ShieldAlert, Cpu, Network, Zap } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";

const data = [
  { time: "00:00", reqs: 4000, cpu: 24 },
  { time: "04:00", reqs: 3000, cpu: 13 },
  { time: "08:00", reqs: 2000, cpu: 98 },
  { time: "12:00", reqs: 2780, cpu: 39 },
  { time: "16:00", reqs: 1890, cpu: 48 },
  { time: "20:00", reqs: 2390, cpu: 38 },
  { time: "24:00", reqs: 3490, cpu: 43 },
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-8 h-8 text-primary" />
            GLOBAL COMMAND CENTER
          </h1>
          <p className="text-muted-foreground font-mono mt-1">SYS_STATUS: OPTIMAL | ALL SYSTEMS NOMINAL</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            LIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128.4M</div>
              <p className="text-xs text-muted-foreground">+20.1% from last hour</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3,492</div>
              <p className="text-xs text-muted-foreground">42 spawning...</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.2 TB/s</div>
              <p className="text-xs text-muted-foreground">Stable</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-destructive">Security Events</CardTitle>
              <ShieldAlert className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">7</div>
              <p className="text-xs text-destructive/80">3 blocked, 4 investigating</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>System Load Trajectory</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReqs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="reqs" stroke="var(--primary)" fillOpacity={1} fill="url(#colorReqs)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Live Topology</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="h-[300px] flex items-center justify-center border border-border/50 rounded-lg bg-black/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                <div className="relative w-full h-full p-4">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/20 border border-primary flex items-center justify-center animate-pulse">
                    <Server className="w-6 h-6 text-primary" />
                  </div>
                  
                  {/* Nodes */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-500/20 border border-blue-500 rounded-full flex items-center justify-center"><Database className="w-3 h-3 text-blue-500" /></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-green-500/20 border border-green-500 rounded-full flex items-center justify-center"><Globe className="w-3 h-3 text-green-500" /></div>
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-8 h-8 bg-yellow-500/20 border border-yellow-500 rounded-full flex items-center justify-center"><ShieldAlert className="w-3 h-3 text-yellow-500" /></div>
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-8 h-8 bg-purple-500/20 border border-purple-500 rounded-full flex items-center justify-center"><Cpu className="w-3 h-3 text-purple-500" /></div>
                  </motion.div>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Database(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 9 3" />
      <path d="M3 12A9 3 0 0 9 3" />
    </svg>
  )
}
function Globe(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 1 4 10 4 10-4 10-4 10" />
      <path d="M2 12h20" />
    </svg>
  )
}
