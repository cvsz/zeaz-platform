#!/usr/bin/env node
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const ROOT = path.join(process.cwd(), "..", "..");
const SCRIPTS_DIR = path.join(ROOT, "apps/zai-factory/scripts");

const validationScripts = [
  "validate-apps-registry.mjs"
];

// Verify source files
const SRC_FILES = [
    "index.js", "constants.js", "paths.js", "fs-safe.js", "safety.js", 
    "logger.js", "json-store.js", "registry.js", "apps-registry.js", 
    "assets-registry.js", "jobs.js", "factory-engine.js", "generators/app-generator.js"
];
for (const file of SRC_FILES) {
    if (!fs.existsSync(path.join(ROOT, "apps/zai-factory/src", file))) {
        console.error(`Missing source file: ${file}`);
        process.exit(1);
    }
}

// Verify public assets
const PUBLIC_FILES = ["index.html", "app.js", "styles.css"];
for (const file of PUBLIC_FILES) {
    if (!fs.existsSync(path.join(ROOT, "apps/zai-factory/public", file))) {
        console.error(`Missing public file: ${file}`);
        process.exit(1);
    }
}

// Verify docs
const DOC_FILES = [
    "README.md", "apps-registry.md", "factory-dashboard.md", 
    "factory-cli.md", "safety-model.md", "release-checklist.md"
];
for (const file of DOC_FILES) {
    if (!fs.existsSync(path.join(ROOT, "apps/zai-factory/docs", file))) {
        console.error(`Missing doc file: ${file}`);
        process.exit(1);
    }
}

// Verify data files
const DATA_FILES = [
    "agents-registry.json", "skills-registry.json", "plugins-registry.json", 
    "extensions-registry.json", "prompts-registry.json", 
    "workflows-registry.json", "jobs.json"
];
for (const file of DATA_FILES) {
    if (!fs.existsSync(path.join(ROOT, "apps/zai-factory/data", file))) {
        console.error(`Missing data file: ${file}`);
        process.exit(1);
    }
}

console.log("== Running AI Factory Validation ==");
for (const script of validationScripts) {
  const scriptPath = path.join(SCRIPTS_DIR, script);
  console.log(`Running ${script}...`);
  try {
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Validation failed for ${script}`);
    process.exit(1);
  }
}

console.log("== AI Factory Validation PASSED ==");
