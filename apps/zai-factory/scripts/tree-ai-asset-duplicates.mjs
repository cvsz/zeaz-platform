#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGE_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(__dirname, "../../..");
const REGISTRY_FILE = path.join(PACKAGE_ROOT, "data/zai-factory-skills-registry.json");

const args = process.argv.slice(2);
const argSet = new Set(args);

const SHOW_ALL = argSet.has("--all");
const SHOW_CONFLICTS = argSet.has("--conflicts");
const SHOW_SAME_SHA = argSet.has("--same-sha");
const JSON_OUT = argSet.has("--json");

function getArg(name, fallback = "") {
  const idx = args.indexOf(name);
  if (idx === -1) return fallback;
  return args[idx + 1] || fallback;
}

const LIMIT = Number(getArg("--limit", "200"));
const TYPE_FILTER = getArg("--type", "");
const OUTPUT = getArg("--output", "");

function rel(p) {
  if (!p) return "";
  return path.relative(REPO_ROOT, p).split(path.sep).join("/");
}

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_FILE)) {
    console.error(`ERROR: registry not found: ${rel(REGISTRY_FILE)}`);
    console.error("Run first:");
    console.error("  pnpm --filter @zeaz/zai-factory run duplicates:scan");
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(REGISTRY_FILE, "utf8"));
}

function classify(asset) {
  const status = asset.status || "";

  if (
    status.includes("same-sha") ||
    status === "duplicate-same-sha"
  ) return "same-sha";

  if (
    status.includes("different-sha") ||
    status.includes("conflict") ||
    status === "duplicate-lower-priority"
  ) return "conflict";

  return "other";
}

function shouldInclude(asset) {
  if (TYPE_FILTER && asset.type !== TYPE_FILTER) return false;

  const kind = classify(asset);

  if (SHOW_ALL) return true;
  if (SHOW_CONFLICTS) return kind === "conflict";
  if (SHOW_SAME_SHA) return kind === "same-sha";

  return true;
}

function sourceLabel(asset) {
  const source = asset.source || "unknown";
  const priority = source === "repo" ? "KEEP-PRIORITY" : "LOWER-PRIORITY";
  return `${source} ${priority}`;
}

function groupDuplicates(registry) {
  const selected = Array.isArray(registry.assets) ? registry.assets : [];
  const duplicates = Array.isArray(registry.duplicates) ? registry.duplicates : [];

  const selectedByTypeId = new Map();
  const selectedByTypeSha = new Map();

  for (const item of selected) {
    selectedByTypeId.set(`${item.type}:${item.id}`, item);
    selectedByTypeSha.set(`${item.type}:${item.sha256}`, item);
  }

  const groups = new Map();

  for (const dup of duplicates.filter(shouldInclude)) {
    const idKey = `${dup.type}:${dup.id}`;
    const shaKey = `${dup.type}:${dup.sha256}`;

    const keep =
      selectedByTypeId.get(idKey) ||
      selectedByTypeSha.get(shaKey) ||
      null;

    const groupKey = keep
      ? `${dup.type}:${keep.id || dup.id}`
      : `${dup.type}:${dup.id}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        key: groupKey,
        type: dup.type,
        id: keep?.id || dup.id,
        kind: classify(dup),
        keep,
        duplicates: []
      });
    }

    groups.get(groupKey).duplicates.push(dup);
  }

  return [...groups.values()]
    .sort((a, b) => {
      const kindOrder = { conflict: 0, "same-sha": 1, other: 2 };
      const ak = kindOrder[a.kind] ?? 9;
      const bk = kindOrder[b.kind] ?? 9;
      if (ak !== bk) return ak - bk;
      return a.key.localeCompare(b.key);
    });
}

function renderTree(registry, groups) {
  const lines = [];

  lines.push("ZAI Factory AI Asset Duplicate Tree");
  lines.push("");
  lines.push(`registry: ${rel(REGISTRY_FILE)}`);
  lines.push(`generated_at: ${registry.generated_at || ""}`);
  lines.push("");
  lines.push("summary:");
  lines.push(`  discovered: ${registry.counts?.discovered ?? 0}`);
  lines.push(`  selected: ${registry.counts?.selected ?? 0}`);
  lines.push(`  duplicates: ${registry.counts?.duplicates ?? 0}`);
  lines.push(`  tree_groups: ${groups.length}`);
  lines.push(`  filter_type: ${TYPE_FILTER || "all"}`);
  lines.push(`  mode: ${SHOW_CONFLICTS ? "conflicts" : SHOW_SAME_SHA ? "same-sha" : SHOW_ALL ? "all" : "default"}`);
  lines.push("");

  const shown = groups.slice(0, LIMIT);

  for (const group of shown) {
    const conflictCount = group.duplicates.filter((x) => classify(x) === "conflict").length;
    const sameShaCount = group.duplicates.filter((x) => classify(x) === "same-sha").length;

    lines.push(`├─ ${group.type}:${group.id}`);
    lines.push(`│  kind: ${group.kind}`);
    lines.push(`│  duplicates: ${group.duplicates.length}`);
    lines.push(`│  same_sha: ${sameShaCount}`);
    lines.push(`│  conflicts: ${conflictCount}`);

    if (group.keep) {
      lines.push(`│  keep:`);
      lines.push(`│    ├─ source: ${sourceLabel(group.keep)}`);
      lines.push(`│    ├─ sha256: ${group.keep.sha256}`);
      lines.push(`│    └─ path: ${group.keep.path}`);
    } else {
      lines.push(`│  keep: not-found-in-selected`);
    }

    lines.push(`│  duplicates:`);

    group.duplicates
      .sort((a, b) => `${classify(a)}:${a.source}:${a.path}`.localeCompare(`${classify(b)}:${b.source}:${b.path}`))
      .forEach((dup, index, arr) => {
        const last = index === arr.length - 1;
        const branch = last ? "└─" : "├─";
        const sub = last ? "   " : "│  ";

        lines.push(`│    ${branch} ${dup.status || classify(dup)}`);
        lines.push(`│    ${sub} source: ${sourceLabel(dup)}`);
        lines.push(`│    ${sub} sha256: ${dup.sha256}`);
        lines.push(`│    ${sub} path: ${dup.path}`);
      });

    lines.push("│");
  }

  if (groups.length > LIMIT) {
    lines.push(`└─ truncated: showing ${LIMIT} of ${groups.length} groups`);
    lines.push(`   rerun with: --limit ${groups.length}`);
  } else {
    lines.push("└─ end");
  }

  lines.push("");
  lines.push("safe next:");
  lines.push("  exact duplicates only:");
  lines.push("    pnpm --filter @zeaz/zai-factory run duplicates:clean");
  lines.push("");
  lines.push("  conflicts only tree:");
  lines.push("    node apps/zai-factory/scripts/tree-ai-asset-duplicates.mjs --conflicts --limit 100");
  lines.push("");

  return lines.join("\n");
}

const registry = loadRegistry();
const groups = groupDuplicates(registry);

if (JSON_OUT) {
  const payload = {
    registry: rel(REGISTRY_FILE),
    counts: registry.counts || {},
    groups
  };

  const text = JSON.stringify(payload, null, 2) + "\n";

  if (OUTPUT) {
    fs.mkdirSync(path.dirname(path.resolve(OUTPUT)), { recursive: true });
    fs.writeFileSync(OUTPUT, text);
  } else {
    process.stdout.write(text);
  }

  process.exit(0);
}

const text = renderTree(registry, groups);

if (OUTPUT) {
  fs.mkdirSync(path.dirname(path.resolve(OUTPUT)), { recursive: true });
  fs.writeFileSync(OUTPUT, text + "\n");
  console.log(`wrote ${OUTPUT}`);
} else {
  console.log(text);
}
