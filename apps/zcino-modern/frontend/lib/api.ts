import type { GameFilters, GamesResponse } from "@/types/game";

const DEFAULT_LIMIT = 18;

export function buildGamesQuery(filters: GameFilters, cursor = 0, limit = DEFAULT_LIMIT) {
  const params = new URLSearchParams();

  if (filters.provider) params.set("provider", filters.provider);
  if (filters.category) params.set("category", filters.category);
  if (filters.rtpMin !== undefined) params.set("rtpMin", String(filters.rtpMin));
  if (filters.rtpMax !== undefined) params.set("rtpMax", String(filters.rtpMax));
  if (filters.search) params.set("search", filters.search);

  params.set("cursor", String(cursor));
  params.set("limit", String(limit));

  return params.toString();
}

export async function fetchGames(filters: GameFilters, cursor = 0): Promise<GamesResponse> {
  const query = buildGamesQuery(filters, cursor);
  const response = await fetch(`/api/games?${query}`);

  if (!response.ok) {
    throw new Error("Unable to load games");
  }

  return response.json() as Promise<GamesResponse>;
}
