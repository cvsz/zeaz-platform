export type GameCategory = "slots" | "table" | "live" | "arcade" | "jackpot";

export type Game = {
  id: string;
  name: string;
  provider: string;
  category: GameCategory;
  rtp: number;
  thumbnail: string;
  accent: string;
};

export type GameFilters = {
  provider?: string;
  category?: string;
  rtpMin?: number;
  rtpMax?: number;
  search?: string;
};

export type GamesResponse = {
  games: Game[];
  nextCursor: number | null;
  total: number;
  filters: {
    providers: string[];
    categories: GameCategory[];
    rtpBounds: {
      min: number;
      max: number;
    };
  };
};
