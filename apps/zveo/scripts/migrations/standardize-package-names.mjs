#!/usr/bin/env node
import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const replacements = new Map([
  ["worker_render", "worker-render"],
  ["worker_media", "worker-media"],
  ["api_gateway", "api-gateway"],
  ["worker_postprocess", "worker-postprocess"],
]);
const extensions = new Set([".ts", ".tsx", ".py", ".md", ".yml", ".yaml", ".json", ".tf"]);
const ignored = new Set(["dist", "node_modules", ".next", "coverage"]);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (extensions.has(extname(path))) yield path;
  }
}

let changed = 0;
for (const root of ["apps", "packages", "docs", "infra"]) {
  for await (const file of walk(root)) {
    let source = await readFile(file, "utf8");
    const original = source;
    for (const [from, to] of replacements) source = source.replaceAll(from, to);
    if (source !== original) {
      await writeFile(file, source);
      changed += 1;
      console.log(`standardized ${file}`);
    }
  }
}
console.log(`package name standardization complete: ${changed} files changed`);
