import { NextResponse } from "next/server";

import { getFilterOptions, getGames } from "@/lib/games-data";
import type {
  Game,
  GameCategory,
  GameFilters,
  GamesResponse,
} from "@/types/game";

export const dynamic = "force-dynamic";

type CatalogGame = {
  id: string;
  name: string;
  provider: string;
  category: string;
  rtp: number;
  thumbnail_url?: string;
};

type CatalogPage = {
  items: CatalogGame[];
  page: number;
  per_page: number;
  total: number;
};

const accents = [
  "#f8d572",
  "#69f0ae",
  "#7dd3fc",
  "#c084fc",
  "#fb7185",
  "#f97316",
];
const categories: GameCategory[] = [
  "slots",
  "table",
  "live",
  "arcade",
  "jackpot",
];

function readNumber(value: string | null) {
  if (!value) return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readPositiveInteger(value: string | null, fallback: number) {
  const parsed = readNumber(value);
  if (parsed === undefined) return fallback;

  const integer = Math.floor(parsed);
  return integer > 0 ? integer : fallback;
}

function readCursor(value: string | null) {
  const parsed = readNumber(value);
  if (parsed === undefined) return 0;

  return Math.max(0, Math.floor(parsed));
}

function readFilters(searchParams: URLSearchParams): GameFilters {
  return {
    provider: searchParams.get("provider") || undefined,
    category: searchParams.get("category") || undefined,
    rtpMin: readNumber(searchParams.get("rtpMin")),
    rtpMax: readNumber(searchParams.get("rtpMax")),
    search: searchParams.get("search") || undefined,
  };
}

function isGameCategory(category: string): category is GameCategory {
  return categories.includes(category as GameCategory);
}

function createThumbnail(name: string, category: string, accent: string) {
  const shortName = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${accent}"/><stop offset="0.48" stop-color="#1f3f36"/><stop offset="1" stop-color="#07120f"/></linearGradient></defs><rect width="640" height="480" fill="url(#g)"/><circle cx="512" cy="92" r="96" fill="#ffffff" fill-opacity="0.16"/><rect x="56" y="72" width="528" height="336" rx="44" fill="#000000" fill-opacity="0.16" stroke="#ffffff" stroke-opacity="0.28"/><text x="70" y="130" fill="#ffffff" fill-opacity="0.82" font-family="Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="8">${category.toUpperCase()}</text><text x="70" y="288" fill="#ffffff" font-family="Arial, sans-serif" font-size="112" font-weight="900">${shortName}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function mapCatalogGame(game: CatalogGame, index: number): Game {
  const category = isGameCategory(game.category) ? game.category : "slots";
  const accent = accents[index % accents.length];

  return {
    id: game.id,
    name: game.name,
    provider: game.provider,
    category,
    rtp: game.rtp,
    thumbnail:
      game.thumbnail_url || createThumbnail(game.name, category, accent),
    accent,
  };
}

function catalogQuery(filters: GameFilters, cursor: number, limit: number) {
  const params = new URLSearchParams();
  const page = Math.floor(cursor / limit) + 1;

  if (filters.provider) params.set("provider", filters.provider);
  if (filters.category) params.set("category", filters.category);
  if (filters.rtpMin !== undefined)
    params.set("rtp_min", String(filters.rtpMin));
  if (filters.rtpMax !== undefined)
    params.set("rtp_max", String(filters.rtpMax));

  params.set("page", String(page));
  params.set("per_page", String(limit));

  return params.toString();
}

async function fetchCatalogProviders(catalogApiUrl: string) {
  const response = await fetch(
    `${catalogApiUrl.replace(/\/$/, "")}/providers`,
    {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    },
  );
  if (!response.ok) return getFilterOptions().providers;

  const body = (await response.json()) as { providers?: string[] };
  return body.providers && body.providers.length > 0
    ? body.providers
    : getFilterOptions().providers;
}

async function fetchCatalogGames(
  filters: GameFilters,
  cursor: number,
  limit: number,
): Promise<GamesResponse | null> {
  const catalogApiUrl = process.env.CATALOG_API_URL;
  if (!catalogApiUrl) return null;

  const response = await fetch(
    `${catalogApiUrl.replace(/\/$/, "")}/games?${catalogQuery(filters, cursor, limit)}`,
    {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    },
  );
  if (!response.ok) {
    throw new Error("Catalog API request failed");
  }

  const page = (await response.json()) as CatalogPage;
  const allGames = page.items.map(mapCatalogGame).filter((game) => {
    if (!filters.search) return true;
    const search = filters.search.toLowerCase();
    return (
      game.name.toLowerCase().includes(search) ||
      game.provider.toLowerCase().includes(search)
    );
  });

  const filterOptions = getFilterOptions();

  return {
    games: allGames,
    nextCursor:
      cursor + page.per_page < page.total ? cursor + page.per_page : null,
    total: page.total,
    filters: {
      ...filterOptions,
      providers: await fetchCatalogProviders(catalogApiUrl),
    },
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = readFilters(searchParams);
  const cursor = readCursor(searchParams.get("cursor"));
  const limit = readPositiveInteger(searchParams.get("limit"), 18);

  let response: GamesResponse;
  try {
    response =
      (await fetchCatalogGames(filters, cursor, limit)) ??
      getGames(filters, cursor, limit);
  } catch {
    response = getGames(filters, cursor, limit);
  }

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
