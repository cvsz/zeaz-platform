import { createHash, randomBytes } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, readdir, realpath, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const WAKEUP_ID_PATTERN = /^[a-f0-9]{12}$/;
const UNIT_PREFIX = "codex-wakeup-";

export interface CommandResult {
  stdout: string;
  stderr: string;
}

export type CommandRunner = (command: string, args: string[]) => Promise<CommandResult>;

export interface ScheduleRequest {
  delaySeconds: number;
  reason: string;
  root?: string | undefined;
  prompt?: string | undefined;
}

export interface WakeupRecord {
  id: string;
  timerUnit: string;
  serviceUnit: string;
  root: string;
  delaySeconds: number;
  reason: string;
  promptSha256: string;
  outputPath: string;
  createdAt: string;
}

export interface WakeupStatus extends WakeupRecord {
  activeState: string;
  subState: string;
  nextElapse: string;
  resultAvailable: boolean;
}

export interface CodexInvocation {
  command: string;
  prefixArgs: string[];
}

export const defaultRunner: CommandRunner = async (command, args) => {
  const result = await execFileAsync(command, args, {
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
  });
  return { stdout: result.stdout, stderr: result.stderr };
};

export function schedulerStateDirectory(): string {
  const base = process.env.XDG_STATE_HOME ?? join(homedir(), ".local", "state");
  return resolve(base, "codex-scheduler");
}

export function assertWakeupId(id: string): void {
  if (!WAKEUP_ID_PATTERN.test(id)) {
    throw new Error("Invalid wakeup ID");
  }
}

export function buildSystemdRunArgs(
  record: WakeupRecord,
  invocation: CodexInvocation,
  prompt: string,
): string[] {
  return [
    "--user",
    `--unit=${UNIT_PREFIX}${record.id}`,
    `--description=Codex wakeup: ${record.reason}`,
    `--on-active=${record.delaySeconds}s`,
    `--working-directory=${record.root}`,
    "--property=Nice=10",
    "--collect",
    invocation.command,
    ...invocation.prefixArgs,
    "exec",
    "--cd",
    record.root,
    "--sandbox",
    "workspace-write",
    "--color",
    "never",
    "--config",
    'approval_policy="never"',
    "--output-last-message",
    record.outputPath,
    prompt,
  ];
}

function recordPath(id: string): string {
  return join(schedulerStateDirectory(), "wakeups", `${id}.json`);
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await readFile(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function resolveRepositoryRoot(input: string | undefined, runner: CommandRunner): Promise<string> {
  const requested = await realpath(resolve(input ?? process.cwd()));
  const result = await runner("git", ["-C", requested, "rev-parse", "--show-toplevel"]);
  return realpath(result.stdout.trim());
}

async function resolveCodexInvocation(runner: CommandRunner): Promise<CodexInvocation> {
  const configured = process.env.CODEX_SCHEDULER_CODEX_BIN;
  const launcher = configured ?? (await runner("which", ["codex"])).stdout.trim();
  const target = await realpath(launcher);
  if (!target.endsWith(".js")) {
    return { command: target, prefixArgs: [] };
  }
  const node = await runner("which", ["node"]);
  return { command: await realpath(node.stdout.trim()), prefixArgs: [target] };
}

function parseSystemdProperties(output: string): Record<string, string> {
  return Object.fromEntries(
    output
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf("=");
        return separator === -1 ? [line, ""] : [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

async function readRecord(id: string): Promise<WakeupRecord> {
  assertWakeupId(id);
  try {
    return JSON.parse(await readFile(recordPath(id), "utf8")) as WakeupRecord;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`Wakeup not found: ${id}`);
    }
    throw error;
  }
}

export async function scheduleWakeup(
  request: ScheduleRequest,
  runner: CommandRunner = defaultRunner,
): Promise<WakeupRecord> {
  const prompt = request.prompt ?? "Use $codex-flow to run the next safe repository iteration.";
  const root = await resolveRepositoryRoot(request.root, runner);
  const codexInvocation = await resolveCodexInvocation(runner);
  const id = randomBytes(6).toString("hex");
  const stateDirectory = schedulerStateDirectory();
  const outputDirectory = join(stateDirectory, "results");
  await mkdir(join(stateDirectory, "wakeups"), { recursive: true, mode: 0o700 });
  await mkdir(outputDirectory, { recursive: true, mode: 0o700 });

  const record: WakeupRecord = {
    id,
    timerUnit: `${UNIT_PREFIX}${id}.timer`,
    serviceUnit: `${UNIT_PREFIX}${id}.service`,
    root,
    delaySeconds: request.delaySeconds,
    reason: request.reason,
    promptSha256: createHash("sha256").update(prompt).digest("hex"),
    outputPath: join(outputDirectory, `${id}.txt`),
    createdAt: new Date().toISOString(),
  };

  await runner("systemd-run", buildSystemdRunArgs(record, codexInvocation, prompt));
  await writeFile(recordPath(id), `${JSON.stringify(record, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  return record;
}

export async function wakeupStatus(
  id: string,
  runner: CommandRunner = defaultRunner,
): Promise<WakeupStatus> {
  const record = await readRecord(id);
  let properties: Record<string, string> = {};
  try {
    const result = await runner("systemctl", [
      "--user",
      "show",
      record.timerUnit,
      "--property=ActiveState,SubState,NextElapseUSecRealtime",
      "--no-pager",
    ]);
    properties = parseSystemdProperties(result.stdout);
  } catch {
    properties = { ActiveState: "inactive", SubState: "not-found", NextElapseUSecRealtime: "" };
  }
  return {
    ...record,
    activeState: properties.ActiveState ?? "unknown",
    subState: properties.SubState ?? "unknown",
    nextElapse: properties.NextElapseUSecRealtime ?? "",
    resultAvailable: await pathExists(record.outputPath),
  };
}

export async function listWakeups(
  includeFinished: boolean,
  runner: CommandRunner = defaultRunner,
): Promise<WakeupStatus[]> {
  const directory = join(schedulerStateDirectory(), "wakeups");
  let entries: string[];
  try {
    entries = await readdir(directory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
  const ids = entries
    .filter((entry) => entry.endsWith(".json"))
    .map((entry) => entry.slice(0, -5))
    .filter((id) => WAKEUP_ID_PATTERN.test(id))
    .slice(-100);
  const statuses = await Promise.all(ids.map((id) => wakeupStatus(id, runner)));
  return includeFinished ? statuses : statuses.filter((status) => status.activeState === "active");
}

export async function cancelWakeup(
  id: string,
  runner: CommandRunner = defaultRunner,
): Promise<WakeupStatus> {
  const record = await readRecord(id);
  await runner("systemctl", ["--user", "stop", record.timerUnit]);
  try {
    await runner("systemctl", ["--user", "stop", record.serviceUnit]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("not loaded") && !message.includes("not found")) {
      throw error;
    }
  }
  return wakeupStatus(id, runner);
}
