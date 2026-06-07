"use client";

import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";

import { fetchGames } from "@/lib/api";
import type { GameFilters, GamesResponse } from "@/types/game";

export function useGames(
  filters: GameFilters,
  initialData?: InfiniteData<GamesResponse, number>,
) {
  return useInfiniteQuery({
    queryKey: ["games", filters],
    queryFn: ({ pageParam }) => fetchGames(filters, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData,
    staleTime: 60_000,
  });
}
