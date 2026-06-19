#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGE_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(__dirname, "../../..");
const HOME = process.env.HOME || path.dirname(REPO_ROOT);

const DATA_DIR = path.join(PACKAGE_ROOT, "data");
const DOCS_DIR = path.join(PACKAGE_ROOT, "docs");
const VENDOR_DIR = path.join(PACKAGE_ROOT, "vendor/ai-assets");

const REGISTRY_FILE = path.join(DATA_DIR, "zai-factory-skills-registry.json");
const REPORTS_DIR = path.join(PACKAGE_ROOT, "reports");
const DOC_FILE = path.join(REPORTS_DIR, "zai-factory-skills-installer-report.md");

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");
const COPY = args.has("--copy");
const SYMLINK = args.has("--symlink") || !COPY;
const VERBOSE = args.has("--verbose");
const INCLUDE_GLOBAL = args.has("--include-global") || args.has("--all");

const IGNORE_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  ".nuxt",
  ".svelte-kit",
  ".turbo",
  ".cache",
  ".vite",
  "dist",
  "build",
  "coverage",
  "__pycache__",
  ".pytest_cache",
  ".venv",
  "venv",
  ".opencode",
  ".wrangler",
  ".cloudflared",
  ".terraform",
  ".ssh",
  ".gnupg",
  ".kube"
]);

const SENSITIVE_NAMES = new Set([
  ".env",
  "creds.json",
  "credentials.json",
  "token.json",
  "id_rsa",
  "id_ed25519"
]);

const SENSITIVE_SUFFIXES = [
  ".pem",
  ".key",
  ".p12",
  ".pfx",
  ".tfstate",
  ".tfvars"
];

const REPO_SCAN_ROOTS = [
  path.join(REPO_ROOT, ".agents"),
  path.join(REPO_ROOT, ".skills"),
  path.join(REPO_ROOT, ".plugins"),
  path.join(REPO_ROOT, ".extensions"),
  path.join(REPO_ROOT, ".gemini")
];

const GLOBAL_SCAN_ROOTS = [
  path.join(HOME, ".agents"),
  path.join(HOME, ".skills"),
  path.join(HOME, ".plugins"),
  path.join(HOME, ".extensions")
];

const SCAN_ROOTS = INCLUDE_GLOBAL
  ? [...REPO_SCAN_ROOTS, ...GLOBAL_SCAN_ROOTS]
  : REPO_SCAN_ROOTS;

function usage() {
  console.log(`
ZAI Factory Skills Installer

Usage:
  node apps/zai-factory/scripts/zai-factory-skills-installer.mjs [options]

Options:
  --apply       install assets into apps/zai-factory/vendor/ai-assets
  --copy        copy assets instead of symlink
  --symlink     symlink assets, default
  --verbose     print discovered assets
  --include-global include user-level global AI assets
  --all         alias for --include-global

Examples:
  node apps/zai-factory/scripts/zai-factory-skills-installer.mjs
  node apps/zai-factory/scripts/zai-factory-skills-installer.mjs --apply --symlink
  node apps/zai-factory/scripts/zai-factory-skills-installer.mjs --apply --copy
  node apps/zai-factory/scripts/zai-factory-skills-installer.mjs --include-global
`);
}

if (args.has("--help") || args.has("-h")) {
  usage();
  process.exit(0);
}

function normalizeRel(file) {
  return path.relative(REPO_ROOT, file).split(path.sep).join("/");
}

function isSensitive(file) {
  const base = path.basename(file);
  if (SENSITIVE_NAMES.has(base)) return true;
  if (base.startsWith(".env.")) return true;
  if (SENSITIVE_SUFFIXES.some((suffix) => base.endsWith(suffix))) return true;
  return file.split(path.sep).some((part) =>
    ["secret", "secrets", "credential", "credentials", "token", "tokens"].includes(part)
  );
}

function shouldIgnoreDir(name) {
  return IGNORE_DIRS.has(name);
}

function sha256File(file) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(file));
  return hash.digest("hex");
}

function listFiles(root) {
  const out = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (shouldIgnoreDir(entry.name)) continue;
        walk(full);
        continue;
      }

      if (entry.isFile()) {
        if (isSensitive(full)) continue;
        out.push(full);
      }
    }
  }

  walk(root);
  return out.sort();
}

function sha256Dir(dir) {
  const hash = crypto.createHash("sha256");
  const files = listFiles(dir);

  for (const file of files) {
    const rel = path.relative(dir, file).split(path.sep).join("/");
    hash.update(rel);
    hash.update("\0");
    hash.update(sha256File(file));
    hash.update("\0");
  }

  return {
    sha256: hash.digest("hex"),
    file_count: files.length,
    size_bytes: files.reduce((sum, f) => sum + fs.statSync(f).size, 0)
  };
}

function readTextMaybe(file, max = 4096) {
  try {
    return fs.readFileSync(file, "utf8").slice(0, max);
  } catch {
    return "";
  }
}

function slug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "unknown";
}

function parseSkillName(skillMd, fallback) {
  const text = readTextMaybe(skillMd);
  const title = text.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const yamlName = text.match(/^name:\s*["']?([^"'\n]+)["']?/m)?.[1]?.trim();
  return yamlName || title || fallback;
}

function detectAsset(markerFile) {
  const base = path.basename(markerFile);
  const dir = path.dirname(markerFile);

  if (base === "SKILL.md") {
    const name = parseSkillName(markerFile, path.basename(dir));
    return {
      type: "skill",
      id: slug(name),
      name,
      root: dir,
      marker: markerFile
    };
  }

  if (base === "agent.json") {
    let id = path.basename(dir);
    let name = id;
    try {
      const data = JSON.parse(fs.readFileSync(markerFile, "utf8"));
      id = data.id || data.name || id;
      name = data.name || data.id || name;
    } catch {}
    return {
      type: "agent",
      id: slug(id),
      name,
      root: dir,
      marker: markerFile
    };
  }

  if (["plugin.json", "plugin.yaml", "plugin.yml", "plugin.toml"].includes(base)) {
    return {
      type: "plugin",
      id: slug(path.basename(dir)),
      name: path.basename(dir),
      root: dir,
      marker: markerFile
    };
  }

  if (["extension.json", "extension.yaml", "extension.yml", "manifest.json", "manifest.yaml", "manifest.yml"].includes(base)) {
    return {
      type: "extension",
      id: slug(path.basename(dir)),
      name: path.basename(dir),
      root: dir,
      marker: markerFile
    };
  }

  if (dir.includes(".gemini") && base.endsWith(".prompt.md")) {
    return {
      type: "prompt",
      id: slug(base.replace(/\.prompt\.md$/, "")),
      name: base,
      root: markerFile,
      marker: markerFile
    };
  }

  if (dir.includes(".gemini") && base.endsWith(".toml")) {
    return {
      type: "command",
      id: slug(base.replace(/\.toml$/, "")),
      name: base,
      root: markerFile,
      marker: markerFile
    };
  }

  return null;
}

function findMarkers(root) {
  const markers = [];
  const files = listFiles(root);

  for (const file of files) {
    const base = path.basename(file);

    if (
      base === "SKILL.md" ||
      base === "agent.json" ||
      ["plugin.json", "plugin.yaml", "plugin.yml", "plugin.toml"].includes(base) ||
      ["extension.json", "extension.yaml", "extension.yml", "manifest.json", "manifest.yaml", "manifest.yml"].includes(base) ||
      (file.includes(`${path.sep}.gemini${path.sep}`) && base.endsWith(".prompt.md")) ||
      (file.includes(`${path.sep}.gemini${path.sep}`) && base.endsWith(".toml"))
    ) {
      markers.push(file);
    }
  }

  return markers.sort();
}

function sourcePriority(asset) {
  const root = asset.path;
  if (root.startsWith(path.join(REPO_ROOT, ".agents"))) return 0;
  if (root.startsWith(path.join(REPO_ROOT, ".skills"))) return 1;
  if (root.startsWith(path.join(REPO_ROOT, ".plugins"))) return 2;
  if (root.startsWith(path.join(REPO_ROOT, ".extensions"))) return 3;
  if (root.startsWith(path.join(REPO_ROOT, ".gemini"))) return 4;
  if (root.startsWith(HOME)) return 10;
  return 99;
}

function assetDestination(asset) {
  const dirName = `${asset.id}`;
  return path.join(VENDOR_DIR, `${asset.type}s`, dirName);
}

function removePath(target) {
  if (!fs.existsSync(target) && !fs.lstatSync?.(target)) return;

  try {
    fs.rmSync(target, { recursive: true, force: true });
  } catch {
    try {
      fs.unlinkSync(target);
    } catch {}
  }
}

function copyRecursive(src, dst) {
  const stat = fs.statSync(src);

  if (stat.isFile()) {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    return;
  }

  fs.mkdirSync(dst, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (shouldIgnoreDir(entry.name)) continue;

    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);

    if (isSensitive(s)) continue;

    if (entry.isDirectory()) {
      copyRecursive(s, d);
    } else if (entry.isFile()) {
      fs.copyFileSync(s, d);
    }
  }
}

function installAsset(asset) {
  const dst = assetDestination(asset);
  const src = asset.path;

  if (!APPLY) {
    return "dry-run";
  }

  fs.mkdirSync(path.dirname(dst), { recursive: true });

  if (fs.existsSync(dst)) {
    fs.rmSync(dst, { recursive: true, force: true });
  }

  if (SYMLINK) {
    fs.symlinkSync(src, dst, fs.statSync(src).isDirectory() ? "dir" : "file");
    return `symlink:${dst}`;
  }

  copyRecursive(src, dst);
  return `copy:${dst}`;
}

function discover() {
  const raw = [];

  for (const root of SCAN_ROOTS) {
    if (!fs.existsSync(root)) continue;

    const markers = findMarkers(root);

    for (const marker of markers) {
      const detected = detectAsset(marker);
      if (!detected) continue;

      const stat = fs.statSync(detected.root);
      const hash = stat.isDirectory()
        ? sha256Dir(detected.root)
        : {
            sha256: sha256File(detected.root),
            file_count: 1,
            size_bytes: fs.statSync(detected.root).size
          };

      raw.push({
        id: detected.id,
        type: detected.type,
        name: detected.name,
        path: detected.root,
        marker: detected.marker,
        source: detected.root.startsWith(REPO_ROOT) ? "repo" : "global",
        sha256: hash.sha256,
        file_count: hash.file_count,
        size_bytes: hash.size_bytes,
        installed_path: assetDestination({ ...detected, path: detected.root }),
        status: "discovered"
      });
    }
  }

  raw.sort((a, b) =>
    `${a.type}:${a.id}:${sourcePriority(a)}:${a.path}`.localeCompare(`${b.type}:${b.id}:${sourcePriority(b)}:${b.path}`)
  );

  const selected = [];
  const duplicates = [];
  const seenKey = new Map();
  const seenSha = new Map();

  for (const asset of raw) {
    const key = `${asset.type}:${asset.id}`;

    if (!seenKey.has(key)) {
      seenKey.set(key, asset);
      selected.push(asset);
      continue;
    }

    const current = seenKey.get(key);
    const currentPriority = sourcePriority(current);
    const nextPriority = sourcePriority(asset);

    if (nextPriority < currentPriority) {
      current.status = "duplicate-lower-priority";
      duplicates.push(current);

      const idx = selected.indexOf(current);
      if (idx >= 0) selected.splice(idx, 1);

      seenKey.set(key, asset);
      selected.push(asset);
    } else {
      asset.status = asset.sha256 === current.sha256
        ? "duplicate-same-sha"
        : "duplicate-conflict-different-sha";
      duplicates.push(asset);
    }
  }

  for (const asset of selected) {
    const shaKey = `${asset.type}:${asset.sha256}`;
    if (!seenSha.has(shaKey)) {
      seenSha.set(shaKey, asset);
      asset.status = "selected";
    } else {
      asset.status = "duplicate-same-sha-selected-key-conflict";
      duplicates.push(asset);
    }
  }

  return { raw, selected, duplicates };
}

function writeRegistry(result) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(DOCS_DIR, { recursive: true });
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const installed = [];

  for (const asset of result.selected) {
    const action = installAsset(asset);
    installed.push({
      ...asset,
      action,
      installed_path: assetDestination(asset)
    });
  }

  const registry = {
    generated_at: new Date().toISOString(),
    source_roots: SCAN_ROOTS.filter((x) => fs.existsSync(x)),
    apply: APPLY,
    include_global: INCLUDE_GLOBAL,
    install_mode: SYMLINK ? "symlink" : "copy",
    counts: {
      discovered: result.raw.length,
      selected: result.selected.length,
      duplicates: result.duplicates.length,
      skills: installed.filter((x) => x.type === "skill").length,
      agents: installed.filter((x) => x.type === "agent").length,
      plugins: installed.filter((x) => x.type === "plugin").length,
      extensions: installed.filter((x) => x.type === "extension").length,
      prompts: installed.filter((x) => x.type === "prompt").length,
      commands: installed.filter((x) => x.type === "command").length
    },
    assets: installed,
    duplicates: result.duplicates
  };

  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2) + "\n");

  const lines = [];
  lines.push("# ZAI Factory Skills Installer");
  lines.push("");
  lines.push(`- Generated: \`${registry.generated_at}\``);
  lines.push(`- Apply: \`${APPLY}\``);
  lines.push(`- Install mode: \`${registry.install_mode}\``);
  lines.push(`- Discovered: \`${registry.counts.discovered}\``);
  lines.push(`- Selected: \`${registry.counts.selected}\``);
  lines.push(`- Duplicates: \`${registry.counts.duplicates}\``);
  lines.push("");
  lines.push("## Counts");
  lines.push("");
  lines.push("| Type | Count |");
  lines.push("|---|---:|");
  for (const key of ["skills", "agents", "plugins", "extensions", "prompts", "commands"]) {
    lines.push(`| ${key} | ${registry.counts[key]} |`);
  }
  lines.push("");
  lines.push("## Selected Assets");
  lines.push("");
  lines.push("| Type | ID | Source | Path | Action |");
  lines.push("|---|---|---|---|---|");
  for (const asset of installed) {
    lines.push(`| ${asset.type} | \`${asset.id}\` | ${asset.source} | \`${asset.path}\` | \`${asset.action}\` |`);
  }
  lines.push("");
  lines.push("## Duplicates / Conflicts");
  lines.push("");
  if (!registry.duplicates.length) {
    lines.push("No duplicates detected.");
  } else {
    lines.push("| Type | ID | Status | Path | SHA |");
    lines.push("|---|---|---|---|---|");
    for (const asset of registry.duplicates) {
      lines.push(`| ${asset.type} | \`${asset.id}\` | \`${asset.status}\` | \`${asset.path}\` | \`${asset.sha256}\` |`);
    }
  }
  lines.push("");

  fs.writeFileSync(DOC_FILE, lines.join("\n"));
  return registry;
}

function main() {
  const result = discover();

  if (VERBOSE) {
    for (const asset of result.raw) {
      console.log(`${asset.type}\t${asset.id}\t${asset.source}\t${asset.path}`);
    }
  }

  const registry = writeRegistry(result);

  console.log("ZAI Factory Skills Installer");
  console.log(`apply: ${APPLY}`);
  console.log(`include_global: ${INCLUDE_GLOBAL}`);
  console.log(`install_mode: ${registry.install_mode}`);
  console.log(`discovered: ${registry.counts.discovered}`);
  console.log(`selected: ${registry.counts.selected}`);
  console.log(`duplicates: ${registry.counts.duplicates}`);
  console.log(`registry: ${path.relative(REPO_ROOT, REGISTRY_FILE)}`);
  console.log(`docs: ${path.relative(REPO_ROOT, DOC_FILE)}`);

  if (!APPLY) {
    console.log("");
    console.log("Dry-run only. To install:");
    console.log("  node apps/zai-factory/scripts/zai-factory-skills-installer.mjs --apply --symlink");
    console.log("  node apps/zai-factory/scripts/zai-factory-skills-installer.mjs --apply --copy");
  }
}

main();
