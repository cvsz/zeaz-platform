import { spawn } from "node:child_process";
import path from "node:path";
import { getCommand, type CommandProfile, type CommandResult } from "./mcp-commands";

/**
 * MCP CLI runner — server-only.
 *
 * Executes allowlisted commands with `shell: false`. The AI never provides the
 * command or args — only a name that resolves to a fixed profile.
 *
 * Write commands require an `approve: true` flag from the caller (human approval).
 */

const DEFAULT_WORKSPACE = process.env.WORKSPACE_DIR || process.cwd();

function resolveCwd(cwd?: string): string {
  if (!cwd) return DEFAULT_WORKSPACE;
  if (path.isAbsolute(cwd)) return cwd;
  return path.resolve(DEFAULT_WORKSPACE, cwd);
}

/** Execute one allowlisted command, returning stdout/stderr/exitCode. */
export function runAllowedCommand(
  profile: CommandProfile,
): Promise<CommandResult> {
  return new Promise((resolve) => {
    const start = Date.now();
    const cwd = resolveCwd(profile.cwd);

    // Special-case the meta "list" command — no spawn needed.
    if (profile.command === "") {
      resolve({
        ok: true,
        commandName: profile.name,
        command: "",
        args: [],
        exitCode: 0,
        stdout: JSON.stringify(
          { commands: "see ALLOWED_COMMANDS", note: "Only allowlisted commands can be executed." },
          null,
          2,
        ),
        stderr: "",
        durationMs: Date.now() - start,
      });
      return;
    }

    let stdout = "";
    let stderr = "";
    const timeoutMs = profile.timeoutMs ?? 30000;

    const child = spawn(profile.command, profile.args, {
      cwd,
      shell: false,
      env: { ...process.env, FORCE_COLOR: "0", CI: "1" },
    });

    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      stderr += `\n[runner] Command timed out after ${timeoutMs}ms`;
    }, timeoutMs);

    child.stdout?.on("data", (data: Buffer) => {
      stdout += data.toString();
    });
    child.stderr?.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    child.on("close", (exitCode) => {
      clearTimeout(timer);
      resolve({
        ok: exitCode === 0,
        commandName: profile.name,
        command: profile.command,
        args: profile.args,
        exitCode,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        durationMs: Date.now() - start,
      });
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        ok: false,
        commandName: profile.name,
        command: profile.command,
        args: profile.args,
        exitCode: 1,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        durationMs: Date.now() - start,
        error: err.message,
      });
    });
  });
}

/** Generator that streams stdout/stderr line-by-line as the command runs. */
export async function* streamAllowedCommand(
  profile: CommandProfile,
): AsyncGenerator<{ kind: "stdout" | "stderr" | "done" | "error"; content?: string; exitCode?: number | null; durationMs?: number; error?: string }, void, unknown> {
  const start = Date.now();
  const cwd = resolveCwd(profile.cwd);

  if (profile.command === "") {
    yield { kind: "stdout", content: "(meta command — no output)\n" };
    yield { kind: "done", exitCode: 0, durationMs: Date.now() - start };
    return;
  }

  let child;
  try {
    child = spawn(profile.command, profile.args, {
      cwd,
      shell: false,
      env: { ...process.env, FORCE_COLOR: "0", CI: "1" },
    });
  } catch (err) {
    yield { kind: "error", error: err instanceof Error ? err.message : "spawn failed" };
    return;
  }

  const timeoutMs = profile.timeoutMs ?? 30000;
  const timer = setTimeout(() => {
    child.kill("SIGTERM");
  }, timeoutMs);

  try {
    for await (const chunk of child.stdout!) {
      yield { kind: "stdout", content: chunk.toString() };
    }
    for await (const chunk of child.stderr!) {
      yield { kind: "stderr", content: chunk.toString() };
    }
    const exitCode = await new Promise<number | null>((resolveExit) => {
      child.on("close", resolveExit);
    });
    clearTimeout(timer);
    yield { kind: "done", exitCode, durationMs: Date.now() - start };
  } catch (err) {
    clearTimeout(timer);
    yield { kind: "error", error: err instanceof Error ? err.message : "stream error" };
  }
}

/** Resolve + validate a command name, checking write approval. */
export function resolveCommand(
  name: string,
  approve: boolean,
): { ok: true; profile: CommandProfile } | { ok: false; error: string; status: number } {
  const profile = getCommand(name);
  if (!profile) {
    return {
      ok: false,
      status: 403,
      error: `Command "${name}" is not allowlisted. Only approved commands can be executed.`,
    };
  }
  if (profile.risk === "write" && !approve) {
    return {
      ok: false,
      status: 403,
      error: `Command "${name}" is a write operation and requires human approval. Pass approve: true to confirm.`,
    };
  }
  return { ok: true, profile };
}
