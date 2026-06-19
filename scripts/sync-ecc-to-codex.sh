#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SOURCE_CONFIG="${SOURCE_CONFIG:-${PROJECT_ROOT}/.codex/config.toml}"
TARGET_CONFIG="${TARGET_CONFIG:-${HOME}/.codex/config.toml}"
MODE="add"
DRY_RUN=true

usage() {
  cat <<'USAGE'
Usage: scripts/sync-ecc-to-codex.sh [options]

Merge the repo-local ECC Codex MCP baseline into ~/.codex/config.toml.
Default mode is a dry-run, add-only preview.

Options:
  --apply        Write changes to TARGET_CONFIG.
  --dry-run      Preview changes only. This is the default.
  --update-mcp   Replace ECC-managed MCP server sections instead of add-only merge.
  --source PATH  Source Codex config. Default: .codex/config.toml.
  --target PATH  Target Codex config. Default: ~/.codex/config.toml.
  -h, --help     Show this help.
USAGE
}

while (($#)); do
  case "$1" in
    --apply) DRY_RUN=false ;;
    --dry-run) DRY_RUN=true ;;
    --update-mcp) MODE="update" ;;
    --source)
      shift
      SOURCE_CONFIG="${1:?missing --source value}"
      ;;
    --target)
      shift
      TARGET_CONFIG="${1:?missing --target value}"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf '[sync-ecc-to-codex] ERROR: unknown argument: %s\n' "$1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

export SOURCE_CONFIG TARGET_CONFIG MODE DRY_RUN

node <<'JS'
const fs = require("fs");
const path = require("path");

const sourceConfig = process.env.SOURCE_CONFIG;
const targetConfig = process.env.TARGET_CONFIG;
const mode = process.env.MODE;
const dryRun = process.env.DRY_RUN === "true";

const managed = [
  "supabase",
  "playwright",
  "context7",
  "exa",
  "github",
  "memory",
  "sequential-thinking",
];
const aliases = new Map([["context7", ["context7-mcp"]]]);
const synthesizedSections = new Map([
  ["supabase", ['[mcp_servers.supabase]', 'url = "https://mcp.supabase.com/mcp"'].join("\n")],
]);

function log(message) {
  process.stdout.write(`[sync-ecc-to-codex] ${message}\n`);
}

function fail(message) {
  process.stderr.write(`[sync-ecc-to-codex] ERROR: ${message}\n`);
  process.exit(1);
}

function readIfExists(file) {
  if (!fs.existsSync(file)) {
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

function detectPackageManager(root) {
  const pkgPath = path.join(root, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      const declared = String(pkg.packageManager || "").split("@")[0];
      if (["npm", "pnpm", "yarn", "bun"].includes(declared)) {
        return declared;
      }
    } catch {
      log(`WARN: could not parse ${pkgPath}`);
    }
  }

  const lockPreference = [
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["bun.lockb", "bun"],
    ["package-lock.json", "npm"],
  ];
  for (const [lockFile, manager] of lockPreference) {
    if (fs.existsSync(path.join(root, lockFile))) {
      return manager;
    }
  }
  return "npm";
}

function parseSections(text) {
  const lines = text.split(/\r?\n/);
  const sections = [];
  let current = {
    name: null,
    header: null,
    start: 0,
    end: 0,
    lines: [],
  };

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^\s*\[([^\]]+)\]\s*$/);
    if (match) {
      current.end = i;
      sections.push(current);
      current = {
        name: match[1],
        header: lines[i],
        start: i,
        end: i + 1,
        lines: [lines[i]],
      };
    } else {
      current.lines.push(lines[i]);
      current.end = i + 1;
    }
  }

  current.end = lines.length;
  sections.push(current);
  return { lines, sections };
}

function mcpName(sectionName) {
  const match = sectionName && sectionName.match(/^mcp_servers\.([^.]+)(?:\.|$)/);
  return match ? match[1] : null;
}

function getManagedSections(text) {
  const parsed = parseSections(text);
  const byName = new Map();

  for (const section of parsed.sections) {
    const name = mcpName(section.name);
    if (!name || !managed.includes(name)) {
      continue;
    }
    if (!byName.has(name)) {
      byName.set(name, []);
    }
    byName.get(name).push(section.lines.join("\n").replace(/\s+$/u, ""));
  }

  return byName;
}

function canonicalFor(name) {
  return [name, ...(aliases.get(name) || [])];
}

function findExistingSections(text, name) {
  const parsed = parseSections(text);
  const names = canonicalFor(name);
  return parsed.sections.filter((section) => {
    const current = mcpName(section.name);
    return current && names.includes(current);
  });
}

function normalizeSection(sectionText) {
  return sectionText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .join("\n");
}

function removeManagedSections(text) {
  const parsed = parseSections(text);
  const keep = [];
  for (const section of parsed.sections) {
    const current = mcpName(section.name);
    const remove = current && managed.some((name) => canonicalFor(name).includes(current));
    if (!remove) {
      keep.push(section.lines.join("\n").replace(/\s+$/u, ""));
    }
  }
  return keep.join("\n").replace(/\s+$/u, "") + "\n";
}

function appendSections(text, sections) {
  const base = text.replace(/\s+$/u, "");
  const suffix = sections.map((section) => section.replace(/\s+$/u, "")).join("\n\n");
  if (!base) {
    return `${suffix}\n`;
  }
  if (!suffix) {
    return `${base}\n`;
  }
  return `${base}\n\n${suffix}\n`;
}

if (!fs.existsSync(sourceConfig)) {
  fail(`source config not found: ${sourceConfig}`);
}

const projectRoot = path.dirname(path.dirname(sourceConfig));
const packageManager = detectPackageManager(projectRoot);
log(`package manager detected: ${packageManager}`);

const sourceText = fs.readFileSync(sourceConfig, "utf8");
const targetText = readIfExists(targetConfig);
const sourceManaged = getManagedSections(sourceText);
for (const [name, section] of synthesizedSections.entries()) {
  if (!sourceManaged.has(name)) {
    sourceManaged.set(name, [section]);
    log(`using built-in ECC MCP template: ${name}`);
  }
}

const missing = managed.filter((name) => !sourceManaged.has(name));
if (missing.length > 0) {
  fail(`source config is missing managed MCP server(s): ${missing.join(", ")}`);
}

let nextText = targetText;
const appendList = [];

if (mode === "update") {
  nextText = removeManagedSections(nextText);
  for (const name of managed) {
    appendList.push(...sourceManaged.get(name));
  }
  log("mode: update-mcp; existing ECC-managed MCP sections will be replaced");
} else {
  log("mode: add-only; existing MCP sections will not be modified");
  for (const name of managed) {
    const existing = findExistingSections(nextText, name);
    const sourceNormalized = sourceManaged.get(name).map(normalizeSection).join("\n");
    if (existing.length === 0) {
      appendList.push(...sourceManaged.get(name));
      log(`add missing MCP server: ${name}`);
      continue;
    }

    const existingNormalized = existing.map((section) => normalizeSection(section.lines.join("\n"))).join("\n");
    if (existingNormalized !== sourceNormalized) {
      log(`WARN: existing MCP server differs from ECC baseline: ${name}`);
    } else {
      log(`ok: ${name}`);
    }
  }
}

nextText = appendSections(nextText, appendList);

if (nextText === targetText) {
  log("no changes needed");
  process.exit(0);
}

if (dryRun) {
  log(`dry-run only; ${appendList.length} section(s) would be ${mode === "update" ? "written" : "appended"}`);
  log("re-run with --apply to write changes");
  process.exit(0);
}

fs.mkdirSync(path.dirname(targetConfig), { recursive: true });
if (fs.existsSync(targetConfig)) {
  fs.copyFileSync(targetConfig, `${targetConfig}.bak`);
  log(`backup written: ${targetConfig}.bak`);
}
fs.writeFileSync(targetConfig, nextText, "utf8");
log(`updated ${targetConfig}`);
JS
