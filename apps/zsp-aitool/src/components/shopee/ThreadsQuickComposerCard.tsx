"use client";

import React from "react";

interface Props {
  selectedCount: number;
  onOpen: () => void;
}

export default function ThreadsQuickComposerCard({ selectedCount, onOpen }: Props) {
  return (
    <button onClick={onOpen}
      className="group relative w-full overflow-hidden rounded-2xl border-2 border-transparent bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-950 p-5 text-left shadow-lg transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(39,39,42,0.5)] hover:brightness-110 hover:[border-image:linear-gradient(135deg,#52525b,#71717a,#a1a1aa)_1]">
      <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-zinc-500/0 via-zinc-400/0 to-zinc-300/0 opacity-0 blur-xl transition-all duration-500 group-hover:from-zinc-500/20 group-hover:via-zinc-400/20 group-hover:to-zinc-300/20 group-hover:opacity-100" />
      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-white/50">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {selectedCount > 0 ? `${selectedCount} selected` : "พร้อมใช้งาน"}
      </div>
      <div className="absolute -right-6 -top-6 text-6xl opacity-[0.08]">🧵</div>
      <div className="relative z-10">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-base">🧵</span>
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/70">Threads</span>
            <p className="text-[10px] text-white/30">Shopee Affiliate • Casual & Promo</p>
          </div>
        </div>
        <p className="mt-3 text-xl font-bold text-white">
          {selectedCount > 0 ? `สร้าง ${selectedCount} Threads posts` : "สร้าง Threads Post"}
        </p>
        <p className="mt-1 text-sm leading-5 text-white/60">
          {selectedCount > 0
            ? `กดเพื่อสร้าง Threads drafts แบบกลุ่ม ${selectedCount} รายการ`
            : "โพสต์ Threads แบบสั้น กระชับ เน้นการสนทนา"}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70 ring-1 ring-white/10">😊 สบายๆ</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70 ring-1 ring-white/10">🔥 โปรโมชั่น</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/70 ring-1 ring-white/10">💬 มีส่วนร่วม</span>
        </div>
      </div>
    </button>
  );
}
