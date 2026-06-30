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

// Main logic
console.log("== Syncing ZAI Factory apps registry ==");

const discoveredPkgs = walkForPackageJson(APPS_DIR).filter(isLikelyAppPackage);
const discoveredPaths = discoveredPkgs.map((pkg) => rel(path.dirname(pkg)));

const registry = readJson(REGISTRY_PATH);
const existingAppsMap = new Map(registry.apps.map(app => [app.path, app]));

const newApps = [];

for (const pkgPath of discoveredPkgs) {
  const appDir = path.dirname(pkgPath);
  const relPath = rel(appDir);
  
  if (existingAppsMap.has(relPath)) {
    // Keep existing
    newApps.push(existingAppsMap.get(relPath));
  } else {
    // Add new app entry
    const pkg = readJson(pkgPath);
    const scripts = pkg.scripts || {};
    const deps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {})
    };
    
    // Determine frameworks
    const frameworks = [];
    if (deps.next) frameworks.push("next");
    if (deps.vite) frameworks.push("vite");
    if (deps.react) frameworks.push("react");
    if (deps.vue) frameworks.push("vue");
    if (deps.svelte) frameworks.push("svelte");
    if (deps.express) frameworks.push("express");
    if (deps.fastify) frameworks.push("fastify");
    if (frameworks.length === 0) frameworks.push("unknown");
    
    // Find config files
    const configs = [];
    const configCandidates = [
      "next.config.js", "next.config.mjs", "next.config.ts",
      "vite.config.js", "vite.config.ts",
      "tsconfig.json", "Dockerfile", "docker-compose.yml"
    ];
    for (const conf of configCandidates) {
      if (fs.existsSync(path.join(appDir, conf))) {
        configs.push(`${relPath}/${conf}`);
      }
    }
    
    // Generate id: replace slashes and dots in relPath, make unique
    const baseId = relPath.replace(/^apps\//, "").replace(/[\/\.]/g, "-");
    let finalId = baseId;
    let counter = 1;
    // Check if ID is duplicate
    while (newApps.some(a => a.id === finalId)) {
      finalId = `${baseId}-${counter++}`;
    }
    
    const newEntry = {
      id: finalId,
      path: relPath,
      package_name: pkg.name || finalId,
      version: pkg.version || "0.1.0",
      frameworks,
      scripts,
      configs,
      factory: {
        develop: true,
        plan: true,
        refactor: true,
        test: Boolean(scripts.test),
        build: Boolean(scripts.build)
      }
    };
    
    console.log(`+ Adding discovery: ${newEntry.id} -> ${newEntry.path}`);
    newApps.push(newEntry);
  }
}

// Log removed ones
for (const app of registry.apps) {
  if (!discoveredPaths.includes(app.path)) {
    console.log(`- Removing missing: ${app.id} -> ${app.path}`);
  }
}

registry.apps = newApps;
registry.generated_at = new Date().toISOString();

fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), "utf8");
console.log("== Sync completed! ==");
