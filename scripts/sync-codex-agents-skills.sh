#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CODEX_HOME="${CODEX_HOME:-${HOME}/.codex}"
USER_AGENTS_HOME="${USER_AGENTS_HOME:-${HOME}/.agents}"
DRY_RUN=true
OVERWRITE_AGENTS=false
OVERWRITE_SKILLS=false

usage() {
  cat <<'USAGE'
Usage: scripts/sync-codex-agents-skills.sh [options]

Install every repo ECC agent and skill into the user-level Codex surfaces.
Default mode is a dry-run. Existing agent and skill files are preserved unless
an explicit overwrite flag is passed.

Options:
  --apply              Write changes. Default is --dry-run.
  --dry-run            Preview changes only.
  --overwrite-agents   Replace existing generated agent TOML files.
  --overwrite-skills   Replace existing skill directories.
  -h, --help           Show this help.
USAGE
}

while (($#)); do
  case "$1" in
    --apply) DRY_RUN=false ;;
    --dry-run) DRY_RUN=true ;;
    --overwrite-agents) OVERWRITE_AGENTS=true ;;
    --overwrite-skills) OVERWRITE_SKILLS=true ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf '[sync-codex-agents-skills] ERROR: unknown argument: %s\n' "$1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

export PROJECT_ROOT CODEX_HOME USER_AGENTS_HOME DRY_RUN OVERWRITE_AGENTS OVERWRITE_SKILLS

node <<'JS'
const fs = require("fs");
const path = require("path");

const projectRoot = process.env.PROJECT_ROOT;
const codexHome = process.env.CODEX_HOME;
const userAgentsHome = process.env.USER_AGENTS_HOME;
const dryRun = process.env.DRY_RUN === "true";
const overwriteAgents = process.env.OVERWRITE_AGENTS === "true";
const overwriteSkills = process.env.OVERWRITE_SKILLS === "true";

const repoAgentsDir = path.join(projectRoot, ".agents", "agents");
const repoSkillsDir = path.join(projectRoot, ".agents", "skills");
const repoCodexAgentsDir = path.join(projectRoot, ".codex", "agents");
const targetAgentsDir = path.join(codexHome, "agents");
const targetSkillDirs = [
  path.join(codexHome, "skills"),
  path.join(userAgentsHome, "skills"),
];
const targetConfig = path.join(codexHome, "config.toml");

function log(message) {
  process.stdout.write(`[sync-codex-agents-skills] ${message}\n`);
}

function fail(message) {
  process.stderr.write(`[sync-codex-agents-skills] ERROR: ${message}\n`);
  process.exit(1);
}

function ensureDir(dir) {
  if (dryRun) {
    return;
  }
  fs.mkdirSync(dir, { recursive: true });
}

function listDirs(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

function listFiles(dir, suffix) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(suffix))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

function tomlString(value) {
  return JSON.stringify(String(value ?? ""));
}

function writeFile(file, content) {
  if (dryRun) {
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
}

function copyDir(source, destination, overwrite) {
  if (fs.existsSync(destination)) {
    if (!overwrite) {
      return "exists";
    }
    if (!dryRun) {
      fs.rmSync(destination, { recursive: true, force: true });
    }
  }
  if (!dryRun) {
    fs.cpSync(source, destination, { recursive: true });
  }
  return "copied";
}

function agentTomlFromJson(agentJson) {
  const data = JSON.parse(fs.readFileSync(agentJson, "utf8"));
  const name = data.name || path.basename(path.dirname(agentJson));
  const description = data.description || "";
  const instructions = data.instructions || "";
  if (!instructions) {
    fail(`agent has no instructions: ${agentJson}`);
  }
  return {
    name,
    text: [
      `name = ${tomlString(name)}`,
      `description = ${tomlString(description)}`,
      `developer_instructions = ${tomlString(instructions)}`,
      "",
    ].join("\n"),
  };
}

function extractTomlString(text, key) {
  const match = text.match(new RegExp(`^${key}\\s*=\\s*"((?:\\\\.|[^"\\\\])*)"`, "m"));
  if (!match) {
    return "";
  }
  try {
    return JSON.parse(`"${match[1]}"`);
  } catch {
    return match[1];
  }
}

function installRepoAgents() {
  let copied = 0;
  let preserved = 0;
  for (const sourceDir of listDirs(repoAgentsDir)) {
    const agentJson = path.join(sourceDir, "agent.json");
    if (!fs.existsSync(agentJson)) {
      continue;
    }
    const { name, text } = agentTomlFromJson(agentJson);
    const destination = path.join(targetAgentsDir, `${name}.toml`);
    if (fs.existsSync(destination) && !overwriteAgents) {
      preserved += 1;
      continue;
    }
    writeFile(destination, text);
    copied += 1;
    log(`${dryRun ? "would install" : "installed"} agent: ${name}`);
  }

  for (const source of listFiles(repoCodexAgentsDir, ".toml")) {
    const destination = path.join(targetAgentsDir, path.basename(source));
    if (fs.existsSync(destination) && !overwriteAgents) {
      preserved += 1;
      continue;
    }
    if (!dryRun) {
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(source, destination);
    }
    copied += 1;
    log(`${dryRun ? "would install" : "installed"} project agent: ${path.basename(source, ".toml")}`);
  }

  log(`agents copied=${copied} preserved=${preserved}`);
}

function installSkills() {
  let copied = 0;
  let preserved = 0;
  for (const targetDir of targetSkillDirs) {
    ensureDir(targetDir);
    for (const source of listDirs(repoSkillsDir)) {
      if (!fs.existsSync(path.join(source, "SKILL.md"))) {
        continue;
      }
      const destination = path.join(targetDir, path.basename(source));
      const result = copyDir(source, destination, overwriteSkills);
      if (result === "exists") {
        preserved += 1;
        continue;
      }
      copied += 1;
      log(`${dryRun ? "would install" : "installed"} skill: ${path.basename(source)} -> ${targetDir}`);
    }
  }
  log(`skills copied=${copied} preserved=${preserved}`);
}

function parseSections(text) {
  const lines = text.split(/\r?\n/);
  const sections = [];
  let current = { name: null, lines: [] };
  for (const line of lines) {
    const match = line.match(/^\s*\[([^\]]+)\]\s*$/);
    if (match) {
      sections.push(current);
      current = { name: match[1], lines: [line] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);
  return sections;
}

function agentRoleSections() {
  const files = listFiles(targetAgentsDir, ".toml");
  const sections = [];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    if (!/^\s*developer_instructions\s*=/m.test(text)) {
      log(`WARN: skipped malformed agent file missing developer_instructions: ${file}`);
      continue;
    }
    const name = extractTomlString(text, "name") || path.basename(file, ".toml");
    const description = extractTomlString(text, "description") || `${name} agent`;
    sections.push([
      `[agents.${name}]`,
      `description = ${tomlString(description)}`,
      `config_file = ${tomlString(`agents/${path.basename(file)}`)}`,
      "",
    ].join("\n"));
  }
  return sections.sort();
}

function updateCodexConfig() {
  const original = fs.existsSync(targetConfig)
    ? fs.readFileSync(targetConfig, "utf8")
    : [
        'approval_policy = "on-request"',
        'sandbox_mode = "workspace-write"',
        'web_search = "live"',
        "",
        "[agents]",
        "max_threads = 6",
        "max_depth = 1",
        "",
      ].join("\n");

  const sections = parseSections(original);
  const kept = sections.filter((section) => {
    return !section.name || !section.name.startsWith("agents.");
  });

  if (!kept.some((section) => section.name === "agents")) {
    kept.splice(1, 0, {
      name: "agents",
      lines: ["[agents]", "max_threads = 6", "max_depth = 1", ""],
    });
  }

  const roles = agentRoleSections();
  const output = [];
  for (const section of kept) {
    output.push(section.lines.join("\n").replace(/\s+$/u, ""));
    if (section.name === "agents") {
      output.push(...roles.map((role) => role.replace(/\s+$/u, "")));
    }
  }
  const next = output.filter(Boolean).join("\n\n") + "\n";
  if (next === original) {
    log(`config unchanged; ${roles.length} agent roles already registered`);
    return;
  }

  log(`${dryRun ? "would update" : "updated"} ${targetConfig} with ${roles.length} agent roles`);
  if (dryRun) {
    return;
  }

  fs.mkdirSync(path.dirname(targetConfig), { recursive: true });
  if (fs.existsSync(targetConfig)) {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..*$/u, "Z");
    const backup = `${targetConfig}.bak.${stamp}`;
    fs.copyFileSync(targetConfig, backup);
    log(`backup written: ${backup}`);
  }
  fs.writeFileSync(targetConfig, next, "utf8");
}

if (!fs.existsSync(repoAgentsDir)) {
  log(`WARN: repo agents directory not found, using project Codex agents only: ${repoAgentsDir}`);
}
if (!fs.existsSync(repoSkillsDir)) {
  fail(`repo skills directory not found: ${repoSkillsDir}`);
}

ensureDir(targetAgentsDir);
installRepoAgents();
installSkills();
updateCodexConfig();

if (dryRun) {
  log("dry-run only. Re-run with --apply to write changes.");
}
JS
