/**
 * Settings system — server-only.
 *
 * Reads/writes a `settings.json` file at the project root (or `.dev/settings.json`).
 * Controls workspace behavior, safety restrictions, editor preferences,
 * visual style, and performance tuning.
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const SETTINGS_PATH = path.join(process.cwd(), ".dev", "settings.json");

export interface AppSettings {
  // --- Workspace ---
  workspace: {
    defaultMode: string;
    defaultModel: string;
    autoSave: boolean;
    maxHistoryMessages: number;
  };
  // --- Safety ---
  safety: {
    requireApiKey: boolean;
    sandboxEnabled: boolean;
    mcpApprovalRequired: boolean;
    maxCodeLength: number;
    blockDangerousCommands: boolean;
  };
  // --- Editor ---
  editor: {
    fontSize: number;
    fontFamily: string;
    tabSize: number;
    wordWrap: boolean;
    lineNumbers: boolean;
    autoIndent: boolean;
  };
  // --- Visual ---
  visual: {
    theme: "dark" | "light" | "auto";
    accentColor: string;
    enableAnimations: boolean;
    enableGlow: boolean;
    enableGrid: boolean;
    compactMode: boolean;
    sidebarDefaultOpen: boolean;
  };
  // --- Performance ---
  performance: {
    streamBatchSize: number;
    maxConcurrentRequests: number;
    cacheResponses: boolean;
    cacheTTLSeconds: number;
    enableTokenCounting: boolean;
    lazyLoadPanels: boolean;
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  workspace: {
    defaultMode: "chat",
    defaultModel: "zlm-4.5-air",
    autoSave: true,
    maxHistoryMessages: 20,
  },
  safety: {
    requireApiKey: false,
    sandboxEnabled: true,
    mcpApprovalRequired: true,
    maxCodeLength: 10000,
    blockDangerousCommands: true,
  },
  editor: {
    fontSize: 13,
    fontFamily: "var(--font-geist-mono)",
    tabSize: 2,
    wordWrap: true,
    lineNumbers: false,
    autoIndent: true,
  },
  visual: {
    theme: "dark",
    accentColor: "emerald",
    enableAnimations: true,
    enableGlow: true,
    enableGrid: true,
    compactMode: false,
    sidebarDefaultOpen: false,
  },
  performance: {
    streamBatchSize: 1,
    maxConcurrentRequests: 3,
    cacheResponses: false,
    cacheTTLSeconds: 300,
    enableTokenCounting: true,
    lazyLoadPanels: true,
  },
};

/** Load settings from disk, merging with defaults. */
export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await readFile(SETTINGS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    // Deep merge with defaults
    return {
      workspace: { ...DEFAULT_SETTINGS.workspace, ...parsed.workspace },
      safety: { ...DEFAULT_SETTINGS.safety, ...parsed.safety },
      editor: { ...DEFAULT_SETTINGS.editor, ...parsed.editor },
      visual: { ...DEFAULT_SETTINGS.visual, ...parsed.visual },
      performance: { ...DEFAULT_SETTINGS.performance, ...parsed.performance },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Save settings to disk. */
export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  await mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  await writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");
  return settings;
}

/** Reset settings to defaults. */
export async function resetSettings(): Promise<AppSettings> {
  await saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

/** Update a single section of settings. */
export async function updateSettingsSection(
  section: keyof AppSettings,
  patch: Record<string, unknown>,
): Promise<AppSettings> {
  const current = await loadSettings();
  const updated = {
    ...current,
    [section]: { ...current[section], ...patch },
  };
  return saveSettings(updated);
}
