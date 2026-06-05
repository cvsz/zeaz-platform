"use client";

import type { Game } from "@/types/game";

const categoryLabels: Record<Game["category"], string> = {
  slots: "Slots",
  table: "Table",
  live: "Live",
  arcade: "Arcade",
  jackpot: "Jackpot",
};

export function GameCard({ game }: { game: Game }) {
  function trackClick() {
    const payload = JSON.stringify({
      game_id: game.id,
      session_id: getSessionID(),
      provider: game.provider,
      placement: "game_lobby_card",
      click_target: "game_card",
      affiliate_id: getQueryParam("aff_id"),
      campaign_id:
        getQueryParam("campaign_id") ?? getQueryParam("utm_campaign"),
      country: "US",
      referrer_url: document.referrer || undefined,
      metadata: {
        category: game.category,
        rtp: String(game.rtp),
      },
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track/click",
        new Blob([payload], { type: "application/json" }),
      );
      window.location.href = `/legacy/launch_game.php?game=${game.id}`;
      return;
    }

    void fetch("/api/track/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).then(() => {
      window.location.href = `/legacy/launch_game.php?game=${game.id}`;
    });
  }

  return (
    <article
      onClick={trackClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") trackClick();
      }}
      role="button"
      tabIndex={0}
      className="group cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/[0.08] shadow-card backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-gold-400/50 focus:outline-none focus:ring-2 focus:ring-gold-400/80"
    >
      <div
        aria-label={`${game.name} thumbnail`}
        className="relative aspect-[4/3] overflow-hidden"
        role="img"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(7,18,15,0.08), rgba(7,18,15,0.72)), url("${game.thumbnail}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-4 rounded-[2rem] border border-white/20 bg-black/10" />
        <div className="absolute left-5 top-5 rounded-full bg-black/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
          {categoryLabels[game.category]}
        </div>
        <div className="absolute bottom-5 left-5 right-5">
          <div className="h-16 rounded-2xl bg-white/15 p-3 backdrop-blur-md">
            <div className="h-2 w-1/2 rounded-full bg-white/70" />
            <div className="mt-3 h-2 w-3/4 rounded-full bg-white/40" />
          </div>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h3 className="line-clamp-1 text-lg font-bold text-white">
            {game.name}
          </h3>
          <span className="mt-2 inline-flex rounded-full border border-gold-400/30 bg-gold-400/10 px-3 py-1 text-xs font-semibold text-gold-400">
            {game.provider}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm">
          <span className="text-slate-400">RTP</span>
          <strong className="text-white">{game.rtp.toFixed(2)}%</strong>
        </div>
      </div>
    </article>
  );
}

function getQueryParam(name: string) {
  const value = new URLSearchParams(window.location.search).get(name);
  return value || undefined;
}

function getSessionID() {
  const key = "zcino_session_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const generated = crypto.randomUUID();
  window.localStorage.setItem(key, generated);
  return generated;
}
