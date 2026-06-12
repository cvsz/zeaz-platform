import React from "react";
import Link from "next/link";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-xl">
      <div className="relative group max-w-2xl mx-auto w-full px-4">
        {/* Glow effect behind the glass card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-chart-1 to-chart-2 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse"></div>
        
        <div className="relative glass flex flex-col items-center justify-center gap-10 p-12 text-center rounded-[2rem] shadow-2xl">
          <div className="relative flex items-center justify-center w-28 h-28">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary border-l-primary/30 animate-spin [animation-duration:1.5s]"></div>
            
            {/* Middle spinning ring */}
            <div className="absolute inset-3 rounded-full border-[3px] border-transparent border-b-chart-1 border-r-chart-1/30 animate-spin [animation-duration:2s] [animation-direction:reverse]"></div>
            
            {/* Inner spinning ring */}
            <div className="absolute inset-6 rounded-full border-[3px] border-transparent border-t-chart-2 border-l-chart-2/30 animate-spin [animation-duration:2.5s]"></div>
            
            {/* Center glowing core */}
            <div className="absolute inset-0 m-auto w-5 h-5 bg-primary/80 rounded-full shadow-[0_0_20px_var(--color-primary)] animate-ping"></div>
            <div className="absolute inset-0 m-auto w-3 h-3 bg-foreground rounded-full"></div>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-widest uppercase bg-gradient-to-r from-foreground via-primary to-chart-1 bg-clip-text text-transparent animate-pulse">
              ZeaZ
            </h1>
            <h2 className="text-lg md:text-xl font-medium text-foreground tracking-wide mt-2">
              กำลังโหลดระบบ <span className="opacity-50 mx-2">|</span> System Loading
            </h2>
            
            <div className="flex flex-col gap-3 mt-4 text-sm md:text-base text-muted-foreground/80 max-w-lg">
              <p className="leading-relaxed">
                <strong className="text-foreground">ไทย:</strong> กำลังเตรียมระบบ AI Automation, Cloudflare Edge Routing, Zero Trust Access และ Workspace Security สำหรับเซสชันของคุณ
              </p>
              <p className="leading-relaxed">
                <strong className="text-foreground">English:</strong> Preparing AI automation, Cloudflare Edge routing, Zero Trust access, and secure workspace services for your session.
              </p>
            </div>
            
            <div className="flex items-center gap-2 mt-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-chart-1 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-chart-2 animate-bounce"></span>
            </div>

            <Link href="https://app.zeaz.dev">
              <button className="relative px-8 py-3 font-semibold text-primary-foreground bg-primary rounded-full overflow-hidden group/btn hover:scale-105 transition-transform duration-300">
                <span className="relative z-10">เปิดหน้าแดชบอร์ด / Open Dashboard</span>
                <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover/btn:scale-x-100 transform origin-left transition-transform duration-300 ease-out"></div>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
