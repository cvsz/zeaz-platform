import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { cancelWakeup, listWakeups, scheduleWakeup, wakeupStatus } from "./scheduler.js";

const server = new McpServer(
  { name: "codex-scheduler", version: "1.0.0" },
  {
    instructions:
      "Schedule bounded Codex repository wakeups through user-level systemd timers. List or inspect a wakeup before retrying it. Cancel obsolete wakeups explicitly.",
  },
);

function result(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
  };
}

server.registerTool(
  "schedule_wakeup",
  {
    title: "Schedule Codex Wakeup",
    description:
      "Schedule a new sandboxed Codex exec iteration in a Git repository using a persistent user systemd timer.",
    inputSchema: z.object({
      delaySeconds: z.number().int().min(1).max(86_400),
      reason: z.string().min(1).max(200),
      root: z.string().min(1).optional(),
      prompt: z.string().min(1).max(4_000).optional(),
    }),
  },
  async (request) => result(await scheduleWakeup(request)),
);

server.registerTool(
  "list_wakeups",
  {
    title: "List Codex Wakeups",
    description: "List scheduled Codex wakeups and optionally include finished entries.",
    inputSchema: z.object({ includeFinished: z.boolean().default(false) }),
  },
  async ({ includeFinished }) => result(await listWakeups(includeFinished)),
);

server.registerTool(
  "wakeup_status",
  {
    title: "Codex Wakeup Status",
    description: "Inspect the systemd state and result availability for one scheduled wakeup.",
    inputSchema: z.object({ wakeupId: z.string().regex(/^[a-f0-9]{12}$/) }),
  },
  async ({ wakeupId }) => result(await wakeupStatus(wakeupId)),
);

server.registerTool(
  "cancel_wakeup",
  {
    title: "Cancel Codex Wakeup",
    description: "Stop one scheduled Codex timer and its service if already running.",
    inputSchema: z.object({ wakeupId: z.string().regex(/^[a-f0-9]{12}$/) }),
  },
  async ({ wakeupId }) => result(await cancelWakeup(wakeupId)),
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown scheduler failure";
  process.stderr.write(`[codex-scheduler] ${message}\n`);
  process.exitCode = 1;
});
