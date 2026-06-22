"use client";

/**
 * Voice commander — client-side.
 *
 * Parses a transcript from ASR (push-to-talk) and routes it to the
 * appropriate action: slash command, mode switch, panel open, or prompt submit.
 */

export interface VoiceCommandResult {
  matched: boolean;
  action: "slash" | "mode" | "panel" | "submit" | "unknown";
  command?: string;
  text?: string;
  label: string;
}

interface CommandPattern {
  patterns: RegExp[];
  action: VoiceCommandResult["action"];
  command?: string;
  label: string;
}

const MODE_MAP: Record<string, string> = {
  chat: "/chat",
  explain: "/explain",
  debug: "/debug",
  generate: "/generate",
  review: "/review",
  optimize: "/optimize",
};

const PANEL_MAP: Record<string, string> = {
  dashboard: "/dashboard",
  skills: "/skills",
  modules: "/modules",
  pipeline: "/pipeline",
  keys: "/keys",
  media: "/media",
  admin: "/admin",
  mcp: "/mcp",
  payments: "/pay",
  pay: "/pay",
  search: "/search",
  research: "/research",
  sandbox: "/sandbox",
  permissions: "/permissions",
  memory: "/memory",
  voice: "/voice",
  workflows: "/workflow",
  workflow: "/workflow",
  promptpay: "/promptpay",
};

const COMMAND_PATTERNS: CommandPattern[] = [
  // Mode switches
  {
    patterns: [/switch to (chat|explain|debug|generate|review|optimize)/i, /go to (chat|explain|debug|generate|review|optimize)/i, /(chat|explain|debug|generate|review|optimize) mode/i],
    action: "mode",
    label: "switch mode",
  },
  // Panel opens
  {
    patterns: [/open (dashboard|skills|modules|pipeline|keys|media|admin|mcp|payments|pay|search|research|sandbox|permissions|memory|voice|workflows|workflow|promptpay)/i, /show (dashboard|skills|modules|pipeline|keys|media|admin|mcp|payments|pay|search|research|sandbox|permissions|memory|voice|workflows|workflow|promptpay)/i, /go to (dashboard|skills|modules|pipeline|keys|media|admin|mcp|payments|pay|search|research|sandbox|permissions|memory|voice|workflows|workflow|promptpay)/i],
    action: "panel",
    label: "open panel",
  },
  // Help
  {
    patterns: [/show help/i, /help me/i, /commands/i],
    action: "slash",
    command: "/help",
    label: "show help",
  },
  // Clear
  {
    patterns: [/clear (screen|terminal|chat)/i, /clear/i],
    action: "slash",
    command: "/clear",
    label: "clear terminal",
  },
  // Model switch
  {
    patterns: [/switch model/i, /change model/i],
    action: "slash",
    command: "/model",
    label: "switch model",
  },
  // Generate plan
  {
    patterns: [/make a plan/i, /create a plan/i, /plan for/i],
    action: "slash",
    command: "/plan",
    label: "create plan",
  },
  // Run agent
  {
    patterns: [/run agent/i, /start agent/i],
    action: "slash",
    command: "/agent",
    label: "run agent",
  },
  // Login
  {
    patterns: [/log in/i, /login/i, /sign in/i],
    action: "slash",
    command: "/login",
    label: "login",
  },
  // Logout
  {
    patterns: [/log out/i, /logout/i, /sign out/i],
    action: "slash",
    command: "/logout",
    label: "logout",
  },
];

/** Parse a voice transcript and determine the action. */
export function parseVoiceCommand(transcript: string): VoiceCommandResult {
  const text = transcript.trim();
  if (!text) return { matched: false, action: "unknown", label: "empty" };

  // Check if it starts with a slash command
  if (text.startsWith("/")) {
    return { matched: true, action: "slash", command: text.split(/\s+/)[0], text, label: `slash: ${text.slice(0, 20)}` };
  }

  // Try each pattern
  for (const pattern of COMMAND_PATTERNS) {
    for (const re of pattern.patterns) {
      const match = text.match(re);
      if (match) {
        if (pattern.action === "mode") {
          const mode = match[1]?.toLowerCase();
          if (mode && MODE_MAP[mode]) {
            return { matched: true, action: "mode", command: MODE_MAP[mode], label: `mode: ${mode}` };
          }
        }
        if (pattern.action === "panel") {
          const panel = match[1]?.toLowerCase();
          if (panel && PANEL_MAP[panel]) {
            return { matched: true, action: "panel", command: PANEL_MAP[panel], label: `panel: ${panel}` };
          }
        }
        if (pattern.command) {
          return { matched: true, action: pattern.action, command: pattern.command, text, label: pattern.label };
        }
      }
    }
  }

  // Default: treat as a prompt to submit
  return { matched: true, action: "submit", text, label: `prompt: ${text.slice(0, 30)}…` };
}
