/**
 * API keys — client-safe types & localStorage helpers.
 *
 * No server-only imports here. The server logic lives in `api-keys.ts`.
 */

export interface ApiKeyPublic {
  id: string;
  lastFour: string;
  name: string;
  rateLimitPerHour: number;
  usageCount: number;
  active: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface ApiKeyCreated extends ApiKeyPublic {
  /** The raw key — only returned at creation. */
  key: string;
}

export interface KeyConfig {
  requireKey: boolean;
}

export interface KeysState {
  keys: ApiKeyPublic[];
  config: KeyConfig;
}

/** localStorage key for the active API key (sent on every request). */
const ACTIVE_KEY_STORAGE = "zlm-cli-active-key";
const ACTIVE_KEY_NAME_STORAGE = "zlm-cli-active-key-name";

export function getActiveKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_KEY_STORAGE);
  } catch {
    return null;
  }
}

export function setActiveKey(key: string | null, name?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (key) {
      localStorage.setItem(ACTIVE_KEY_STORAGE, key);
      if (name) localStorage.setItem(ACTIVE_KEY_NAME_STORAGE, name);
      else localStorage.removeItem(ACTIVE_KEY_NAME_STORAGE);
    } else {
      localStorage.removeItem(ACTIVE_KEY_STORAGE);
      localStorage.removeItem(ACTIVE_KEY_NAME_STORAGE);
    }
  } catch {
    /* storage unavailable */
  }
}

export function getActiveKeyName(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_KEY_NAME_STORAGE);
  } catch {
    return null;
  }
}
