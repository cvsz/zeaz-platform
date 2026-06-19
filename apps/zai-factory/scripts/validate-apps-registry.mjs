#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGE_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(__dirname, "../../..");
const APPS_DIR = path.join(REPO_ROOT, "apps");
const REGISTRY_PATH = path.join(PACKAGE_ROOT, "data/apps-registry.json");

const IGNORE_DIRS = new Set([
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
  ".git",
  ".opencode",
  "__pycache__",
  ".pytest_cache",
  ".venv",
  "venv"
]);

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function rel(file) {
  return path.relative(REPO_ROOT, file).split(path.sep).join("/");
}

function hasIgnoredPart(filePath) {
  return filePath.split(path.sep).some((part) => IGNORE_DIRS.has(part));
}

function walkForPackageJson(dir, results = []) {
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      walkForPackageJson(full, results);
      continue;
    }

    if (entry.isFile() && entry.name === "package.json" && !hasIgnoredPart(full)) {
      results.push(full);
    }
  }

  return results;
}

function isLikelyAppPackage(packageJsonPath) {
  const appDir = path.dirname(packageJsonPath);
  const relPath = rel(appDir);

  if (!relPath.startsWith("apps/")) return false;
  if (hasIgnoredPart(packageJsonPath)) return false;

  const pkg = readJson(packageJsonPath);
  const scripts = pkg.scripts || {};
  const deps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {})
  };

  return Boolean(
    pkg.name ||
    scripts.dev ||
    scripts.start ||
    scripts.build ||
    scripts.test ||
    scripts.lint ||
    deps.next ||
    deps.vite ||
    deps.react ||
    deps.vue ||
    deps.svelte ||
    deps.express ||
    deps.fastify ||
    deps["@nestjs/core"]
  );
}

console.log("== Validate ZAI Factory apps registry ==");
console.log(`repo root: ${REPO_ROOT}`);
console.log(`package root: ${PACKAGE_ROOT}`);
console.log(`registry: ${REGISTRY_PATH}`);
console.log("");

if (!fs.existsSync(REGISTRY_PATH)) {
  fail(`registry not found: ${rel(REGISTRY_PATH)}`);
  process.exit();
}

// Add schema validation logic
function validateRegistrySchema(registry) {
  if (!Array.isArray(registry.apps)) {
    throw new Error("Registry apps must be an array");
  }
  for (const app of registry.apps) {
    if (typeof app.id !== 'string' || typeof app.path !== 'string') {
        throw new Error(`Invalid app entry: ${JSON.stringify(app)}`);
    }
  }
}

// ... in the main validation block:
const registry = readJson(REGISTRY_PATH);
validateRegistrySchema(registry);
const registryApps = registry.apps;

const ids = new Set();
const registeredPaths = new Set();

for (const app of registryApps) {
  if (!app.id) fail(`app missing id: ${JSON.stringify(app)}`);
  if (!app.path) fail(`app ${app.id || "UNKNOWN"} missing path`);

  if (ids.has(app.id)) {
    fail(`duplicate app id: ${app.id}`);
  }

  ids.add(app.id);
  registeredPaths.add(app.path);

  const abs = path.join(REPO_ROOT, app.path);

  if (!app.path.startsWith("apps/")) {
    fail(`app path outside apps/: ${app.id} -> ${app.path}`);
  }

  if (hasIgnoredPart(abs)) {
    fail(`registered app is inside ignored path: ${app.id} -> ${app.path}`);
  }

  if (!fs.existsSync(abs)) {
    fail(`registered app path missing: ${app.id} -> ${app.path}`);
  }

  if (!fs.existsSync(path.join(abs, "package.json"))) {
    fail(`registered app missing package.json: ${app.id} -> ${app.path}`);
  }
}

const discoveredPaths = walkForPackageJson(APPS_DIR)
  .filter(isLikelyAppPackage)
  .map((pkg) => rel(path.dirname(pkg)))
  .sort();

const missing = discoveredPaths.filter((p) => !registeredPaths.has(p));
const extra = [...registeredPaths].filter((p) => !discoveredPaths.includes(p));

console.log(`registered apps: ${registryApps.length}`);
console.log(`discovered apps: ${discoveredPaths.length}`);
console.log("");

if (missing.length) {
  console.log("== Missing from registry ==");
  for (const p of missing) console.log(`- ${p}`);
  fail(`missing ${missing.length} discovered app(s) from registry`);
} else {
  console.log("missing from registry: 0");
}

if (extra.length) {
  console.log("");
  console.log("== Extra registry paths ==");
  for (const p of extra) console.log(`- ${p}`);
  fail(`registry has ${extra.length} extra path(s)`);
} else {
  console.log("extra registry paths: 0");
}

console.log("");
if (process.exitCode) {
  console.log("apps registry validation: FAILED");
} else {
  console.log("apps registry validation: OK");
}
