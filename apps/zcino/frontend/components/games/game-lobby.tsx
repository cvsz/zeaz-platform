"use client";

import type { InfiniteData } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { FilterSidebar } from "@/components/games/filter-sidebar";
import { GameGrid } from "@/components/games/game-grid";
import { SearchBar } from "@/components/games/search-bar";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useGames } from "@/hooks/use-games";
import type { GameFilters, GamesResponse } from "@/types/game";

export function GameLobby({ initialResponse }: { initialResponse: GamesResponse }) {
  const [filters, setFilters] = useState<GameFilters>({});
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const activeFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch.trim() || undefined }),
    [debouncedSearch, filters],
  );
  const shouldUseInitialData = Object.values(activeFilters).every((value) => value === undefined);
  const initialData: InfiniteData<GamesResponse, number> | undefined = shouldUseInitialData
    ? { pages: [initialResponse], pageParams: [0] }
    : undefined;
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useGames(
    activeFilters,
    initialData,
  );

  const games = data?.pages.flatMap((page) => page.games) ?? [];
  const latestPage = data?.pages[data.pages.length - 1] ?? initialResponse;
  const total = data?.pages[0]?.total ?? initialResponse.total;

  return (
    <div className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
      <FilterSidebar
        categories={initialResponse.filters.categories}
        filters={filters}
        onChange={setFilters}
        providers={initialResponse.filters.providers}
      />
      <main className="min-w-0 space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4 shadow-card backdrop-blur-xl sm:p-5">
          <SearchBar onChange={setSearch} value={search} />
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="rounded-full bg-white/10 px-3 py-1">{latestPage.filters.providers.length} providers</span>
            <span className="rounded-full bg-white/10 px-3 py-1">{latestPage.filters.categories.length} categories</span>
            <span className="rounded-full bg-white/10 px-3 py-1">
              RTP {latestPage.filters.rtpBounds.min}% - {latestPage.filters.rtpBounds.max}%
            </span>
          </div>
        </div>

        {error ? (
          <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-100">
            The game catalog could not be loaded. Please try again.
          </div>
        ) : isLoading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-10 text-center text-slate-300">
            Loading games...
          </div>
        ) : (
          <GameGrid
            games={games}
            hasNextPage={Boolean(hasNextPage)}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
            total={total}
          />
        )}
      </main>
    </div>
  );
}
