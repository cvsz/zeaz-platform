"use client";

import { useEffect, useRef } from "react";

import { GameCard } from "@/components/games/game-card";
import type { Game } from "@/types/game";

type GameGridProps = {
  games: Game[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  total: number;
};

export function GameGrid({ games, hasNextPage, isFetchingNextPage, onLoadMore, total }: GameGridProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (games.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.05] p-10 text-center">
        <h3 className="text-xl font-bold">No games found</h3>
        <p className="mt-2 text-sm text-slate-400">Try broadening the search or clearing a filter.</p>
      </div>
    );
  }

  return (
    <section aria-label="Game catalog" className="space-y-6">
      <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
        <p>
          Showing <span className="font-semibold text-white">{games.length}</span> of{" "}
          <span className="font-semibold text-white">{total}</span> games
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {games.map((game) => (
          <GameCard game={game} key={game.id} />
        ))}
      </div>
      <div ref={sentinelRef} className="flex min-h-16 items-center justify-center">
        {isFetchingNextPage ? (
          <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-300">
            Loading more games...
          </span>
        ) : hasNextPage ? (
          <button
            className="rounded-full border border-gold-400/40 bg-gold-400/10 px-5 py-2 text-sm font-semibold text-gold-400 transition hover:bg-gold-400/20"
            onClick={onLoadMore}
            type="button"
          >
            Load more
          </button>
        ) : (
          <span className="text-sm text-slate-500">End of catalog</span>
        )}
      </div>
    </section>
  );
}
