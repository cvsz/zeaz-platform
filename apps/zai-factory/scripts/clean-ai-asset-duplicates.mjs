#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGE_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(__dirname, "../../..");
const HOME = process.env.HOME || path.dirname(REPO_ROOT);

const REGISTRY_FILE = path.join(PACKAGE_ROOT, "data/zai-factory-skills-registry.json");

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");
const INCLUDE_CONFLICTS = args.has("--include-conflicts");
const CLEAN_LOWER_PRIORITY = args.has("--clean-lower-priority");
const TS = new Date().toISOString().replace(/[:.]/g, "-");
const QUARANTINE = path.join(HOME, `zai-factory-ai-assets-duplicates-${TS}`);

const SAFE_GLOBAL_PREFIXES = [
  path.join(HOME, ".agents"),
  path.join(HOME, ".skills"),
  path.join(HOME, ".plugins"),
  path.join(HOME, ".extensions")
];

function rel(p) {
  return path.relative(REPO_ROOT, p).split(path.sep).join("/");
}

function fail(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

function isSafeGlobalPath(p) {
  const resolved = path.resolve(p);
  return SAFE_GLOBAL_PREFIXES.some((prefix) => resolved === prefix || resolved.startsWith(prefix + path.sep));
}

function isRepoPath(p) {
  const resolved = path.resolve(p);
  return resolved === REPO_ROOT || resolved.startsWith(REPO_ROOT + path.sep);
}

function safeQuarantinePath(src) {
  const resolved = path.resolve(src);
  let relPath = resolved.replace(HOME, "").replace(/^\/+/, "");
  return path.join(QUARANTINE, relPath);
}

function moveToQuarantine(src) {
  const dst = safeQuarantinePath(src);
  fs.mkdirSync(path.dirname(dst), { recursive: true });

  if (!fs.existsSync(src)) {
    return "missing";
  }

  if (fs.existsSync(dst)) {
    return `already-exists:${dst}`;
  }

  if (APPLY) {
    fs.renameSync(src, dst);
    return `moved:${dst}`;
  }

  return `dry-run:${dst}`;
}

if (!fs.existsSync(REGISTRY_FILE)) {
  fail(`registry not found: ${rel(REGISTRY_FILE)}`);
}

const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, "utf8"));
const selected = Array.isArray(registry.assets) ? registry.assets : [];
const duplicates = Array.isArray(registry.duplicates) ? registry.duplicates : [];

const selectedByTypeId = new Map();
const selectedRepoSha = new Set();

for (const asset of selected) {
  const key = `${asset.type}:${asset.id}`;
  selectedByTypeId.set(key, asset);

  if (asset.source === "repo") {
    selectedRepoSha.add(`${asset.type}:${asset.sha256}`);
  }
}

const rows = [];
const skipped = [];

for (const dup of duplicates) {
  const p = dup.path;

  if (!p || !fs.existsSync(p)) {
    skipped.push({ ...dup, reason: "missing-path" });
    continue;
  }

  if (isRepoPath(p)) {
    skipped.push({ ...dup, reason: "repo-path-not-cleaned" });
    continue;
  }

  if (!isSafeGlobalPath(p)) {
    skipped.push({ ...dup, reason: "unsafe-path" });
    continue;
  }

  const selectedSameId = selectedByTypeId.get(`${dup.type}:${dup.id}`);
  const sameIdSameSha = selectedSameId && selectedSameId.sha256 === dup.sha256;
  const sameRepoSha = selectedRepoSha.has(`${dup.type}:${dup.sha256}`);

  const safeExactDuplicate =
    dup.status === "duplicate-same-sha" ||
    sameIdSameSha ||
    sameRepoSha;

  const conflict =
    dup.status === "duplicate-conflict-different-sha" ||
    dup.status === "duplicate-lower-priority";

  if (!safeExactDuplicate) {
    if (CLEAN_LOWER_PRIORITY && conflict && isSafeGlobalPath(p)) {
      rows.push({
        ...dup,
        action: moveToQuarantine(p),
        warning: "lower-priority-global-conflict-quarantined"
      });
    } else if (INCLUDE_CONFLICTS && conflict) {
      rows.push({
        ...dup,
        action: moveToQuarantine(p),
        warning: "conflict-cleaned-by-request"
      });
    } else {
      skipped.push({ ...dup, reason: "different-sha-conflict-kept" });
    }
    continue;
  }

  rows.push({ ...dup, action: moveToQuarantine(p) });
}

const report = {
  generated_at: new Date().toISOString(),
  apply: APPLY,
  quarantine: QUARANTINE,
  registry: REGISTRY_FILE,
  cleaned_count: rows.length,
  skipped_count: skipped.length,
  cleaned: rows,
  skipped
};

const reportFile = path.join(
  PACKAGE_ROOT,
  "data",
  `ai-assets-duplicates-clean-report-${TS}.json`
);

fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + "\n");

console.log("ZAI Factory AI Asset Duplicate Cleaner");
console.log(`apply: ${APPLY}`);
console.log(`registry duplicates: ${duplicates.length}`);
console.log(`clean candidates: ${rows.length}`);
console.log(`skipped: ${skipped.length}`);
console.log(`quarantine: ${QUARANTINE}`);
console.log(`report: ${rel(reportFile)}`);

if (!APPLY) {
  console.log("");
  console.log("Dry-run only. To quarantine exact duplicates:");
  console.log("  node apps/zai-factory/scripts/clean-ai-asset-duplicates.mjs --apply");
  console.log("  node apps/zai-factory/scripts/clean-ai-asset-duplicates.mjs --clean-lower-priority");
  console.log("  node apps/zai-factory/scripts/clean-ai-asset-duplicates.mjs --apply --clean-lower-priority");
  console.log("");
  console.log("Conflicts with different SHA are not moved by default.");
}
