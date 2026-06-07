import type { Game, GameCategory, GameFilters, GamesResponse } from "@/types/game";

const providers = ["Aurora Play", "Neon Forge", "Lucky Atlas", "Velvet Reel", "Pixel Crown"];
const categories: GameCategory[] = ["slots", "table", "live", "arcade", "jackpot"];
const names = [
  "Starlight Spins",
  "Ruby Riviera",
  "Midnight Mosaic",
  "Golden Harbor",
  "Velvet Vault",
  "Chrome Cascade",
  "Aurora Aces",
  "Crystal Court",
  "Sapphire Sprint",
  "Neon Bazaar",
  "Emerald Eclipse",
  "Cosmic Carousel",
  "Opal Odyssey",
  "Royal Circuit",
  "Citrus City",
  "Quartz Quest",
  "Moonlit Market",
  "Treasure Tempo",
  "Lotus Lounge",
  "Prism Palace",
  "Galaxy Garden",
  "Marble Mirage",
  "Coral Carnival",
  "Diamond Drift",
  "Solar Studio",
  "Jade Junction",
  "Copper Coast",
  "Pearl Parade",
  "Electric Estate",
  "Topaz Terrace",
];

const accents = ["#f8d572", "#69f0ae", "#7dd3fc", "#c084fc", "#fb7185", "#f97316"];

function createThumbnail(name: string, category: GameCategory, accent: string) {
  const shortName = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${accent}"/><stop offset="0.48" stop-color="#1f3f36"/><stop offset="1" stop-color="#07120f"/></linearGradient></defs><rect width="640" height="480" fill="url(#g)"/><circle cx="512" cy="92" r="96" fill="#ffffff" fill-opacity="0.16"/><rect x="56" y="72" width="528" height="336" rx="44" fill="#000000" fill-opacity="0.16" stroke="#ffffff" stroke-opacity="0.28"/><text x="70" y="130" fill="#ffffff" fill-opacity="0.82" font-family="Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="8">${category.toUpperCase()}</text><text x="70" y="288" fill="#ffffff" font-family="Arial, sans-serif" font-size="112" font-weight="900">${shortName}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const gameCatalog: Game[] = Array.from({ length: 90 }, (_, index) => {
  const provider = providers[index % providers.length];
  const category = categories[index % categories.length];
  const rtp = Number((91.5 + ((index * 37) % 720) / 100).toFixed(2));
  const name = `${names[index % names.length]} ${Math.floor(index / names.length) + 1}`;
  const accent = accents[index % accents.length];

  return {
    id: `game-${index + 1}`,
    name,
    provider,
    category,
    rtp,
    thumbnail: createThumbnail(name, category, accent),
    accent,
  };
});

export function getFilterOptions() {
  return {
    providers,
    categories,
    rtpBounds: {
      min: 91,
      max: 99,
    },
  };
}

export function getGames(filters: GameFilters, cursor = 0, limit = 18): GamesResponse {
  const normalizedSearch = filters.search?.trim().toLowerCase();

  const filtered = gameCatalog.filter((game) => {
    const matchesProvider = !filters.provider || game.provider === filters.provider;
    const matchesCategory = !filters.category || game.category === filters.category;
    const matchesRtpMin = filters.rtpMin === undefined || game.rtp >= filters.rtpMin;
    const matchesRtpMax = filters.rtpMax === undefined || game.rtp <= filters.rtpMax;
    const matchesSearch =
      !normalizedSearch ||
      game.name.toLowerCase().includes(normalizedSearch) ||
      game.provider.toLowerCase().includes(normalizedSearch);

    return matchesProvider && matchesCategory && matchesRtpMin && matchesRtpMax && matchesSearch;
  });

  const page = filtered.slice(cursor, cursor + limit);
  const nextCursor = cursor + limit < filtered.length ? cursor + limit : null;

  return {
    games: page,
    nextCursor,
    total: filtered.length,
    filters: getFilterOptions(),
  };
}
